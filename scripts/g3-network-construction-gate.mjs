import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const fail = message => {
  console.error(`G3 network construction gate: FAIL — ${message}`);
  process.exitCode = 1;
};
const stripComments = source => source
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/(^|[^:])\/\/.*$/gm, "$1");

const required = [
  "core/construction/contracts.ts",
  "capabilities/construction/runtime.ts",
  "verticals/family/construction/types.ts",
  "verticals/family/construction/adapter.ts",
  "verticals/alumni/construction/types.ts",
  "verticals/alumni/construction/adapter.ts",
  "app-shell/vertical-capabilities.ts",
  "lib/family-intake-types.ts",
  "lib/remote.ts",
  "core/identity/contracts.ts",
  "core/participation/contracts.ts",
  "scripts/g1-4-remote-compatibility-exports.json",
  "scripts/g3-accepted-source-baseline.txt",
  "supabase/migrations/043_s3a1_distributed_family_intake.sql",
];
for (const file of required) if (!fs.existsSync(path.join(root, file))) fail(`missing ${file}`);

const core = read("core/construction/contracts.ts");
const runtime = read("capabilities/construction/runtime.ts");
const familyTypes = read("verticals/family/construction/types.ts");
const familyAdapter = read("verticals/family/construction/adapter.ts");
const alumniTypes = read("verticals/alumni/construction/types.ts");
const alumniAdapter = read("verticals/alumni/construction/adapter.ts");
const composition = read("app-shell/vertical-capabilities.ts");
const legacyTypes = read("lib/family-intake-types.ts");
const facade = read("lib/remote.ts");
const identityCore = read("core/identity/contracts.ts");
const participationCore = read("core/participation/contracts.ts");
const migration = read("supabase/migrations/043_s3a1_distributed_family_intake.sql");

// Shared construction owns workflow vocabulary only, never vertical implementation semantics.
for (const [name, source] of [["construction core", core], ["construction runtime", runtime]]) {
  const code = stripComments(source);
  if (/from\s+["'](?:\.\.\/)+verticals\/(?:family|alumni)\//.test(code)) fail(`${name} imports a vertical implementation`);
  for (const forbidden of ["family_members", "family_intake_", "parent", "child", "spouse", "generation_offset", "role_from_anchor"]) {
    if (code.includes(forbidden)) fail(`${name} leaks Family/Kinship semantics: ${forbidden}`);
  }
}
for (const marker of [
  "ConstructionSource", "ConstructionProvenance", "ConstructionEntityInput", "ConstructionEdgeInput",
  "ConstructionSessionSummary", "ConstructionAccessSummary", "StagedEntitySummary", "StagedEdgeSummary", "MatchCandidateSummary", "MatchDecisionRecord",
  "ConstructionConflictSummary", "ConstructionValidationResult", "ConstructionCommitPlan", "ConstructionCommitResult", "ConstructionAdapter",
]) if (!core.includes(marker)) fail(`shared construction contract missing ${marker}`);
if (!runtime.includes("createNetworkConstructionRuntime")) fail("shared construction runtime factory missing");

// Existing S3-A1 Family behavior stays authoritative inside the Family adapter.
const familyRpcs = [
  "create_family_intake_session", "create_family_intake_link", "get_family_intake_preview", "submit_family_intake",
  "get_family_intake_admin_dashboard", "decide_family_intake_match", "commit_family_intake_branch", "revoke_family_intake_link",
];
for (const rpc of familyRpcs) {
  if (!familyAdapter.includes(`"${rpc}"`)) fail(`Family construction adapter missing existing RPC ${rpc}`);
  if (facade.includes(`supabase.rpc("${rpc}"`)) fail(`Family construction RPC ${rpc} still implemented in lib/remote.ts`);
  if (!migration.includes(rpc)) fail(`authoritative S3-A1 migration no longer contains ${rpc}`);
}
for (const marker of ["parent", "child", "spouse", "generation_offset", "role_from_anchor", "matched_member_id"]) {
  if (!familyTypes.includes(marker)) fail(`Family construction types lost kinship-specific field ${marker}`);
}
if (!familyAdapter.includes("FAMILY_CONSTRUCTION_ADAPTER") || !familyAdapter.includes('availability: "ready"')) fail("Family construction adapter is not registered as ready");
if (!facade.includes('../verticals/family/construction/adapter')) fail("lib/remote.ts does not preserve S3-A1 functions through Family construction adapter");
if (!legacyTypes.includes('../verticals/family/construction/types')) fail("lib/family-intake-types.ts is not a compatibility facade");

// Alumni proves a genuinely different consumer without borrowing Family persistence/kinship.
const alumniCode = stripComments(alumniTypes + "\n" + alumniAdapter);
for (const forbidden of ["family_", "family_members", "member_id", "parent", "child", "spouse", "generation", "role_from_anchor", "create_family_intake", "commit_family_intake"]) {
  if (alumniCode.toLowerCase().includes(forbidden)) fail(`Alumni construction skeleton illegally reuses Family/Kinship semantics: ${forbidden}`);
}
for (const marker of ["institutionId", "graduationYear", "program", "department", "batchmate", "classmate", "mentor"]) {
  if (!alumniTypes.includes(marker)) fail(`Alumni construction evidence missing ${marker}`);
}
if (!alumniAdapter.includes('availability: "skeleton"')) fail("Alumni construction adapter availability is not explicit");

// App-shell is the composition root; vertical implementations do not compose each other.
for (const marker of ["FAMILY_CONSTRUCTION_ADAPTER", "ALUMNI_CONSTRUCTION_ADAPTER", "createNetworkConstructionRuntime"]) {
  if (!composition.includes(marker)) fail(`vertical capability composition missing ${marker}`);
}
if (/verticals\/alumni|\.\.\/\.\.\/alumni/.test(familyAdapter)) fail("Family construction adapter depends on Alumni implementation");
if (/verticals\/family|\.\.\/\.\.\/family/.test(alumniAdapter)) fail("Alumni construction adapter depends on Family implementation");

// Existing S3-A1 UI stays on compatibility paths; G3 does not force a UI rewrite.
for (const [file, marker] of [
  ["app/contribute/[token]/page.tsx", 'from "../../../lib/remote"'],
  ["components/FamilyBranchIntakeForm.tsx", 'from "../lib/remote"'],
  ["components/FamilyIntakeAdmin.tsx", 'from "../lib/remote"'],
]) {
  if (!read(file).includes(marker)) fail(`S3-A1 compatibility caller changed unexpectedly: ${file}`);
}
for (const file of ["app/contribute/[token]/page.tsx", "components/FamilyBranchIntakeForm.tsx", "components/FamilyIntakeAdmin.tsx"]) {
  if (!read(file).includes("family-intake-types")) fail(`S3-A1 type compatibility path changed unexpectedly: ${file}`);
}

// Preserve G2 identity/participation foundations while construction is extracted.
for (const marker of ["IdentityClaimAdapter", "VerticalIdentityRef"]) if (!identityCore.includes(marker)) fail(`G2 identity contract regressed: ${marker}`);
for (const marker of ["ParticipationAdapter", "NetworkInvitationSummary", "GovernedContributionPrompt"]) if (!participationCore.includes(marker)) fail(`G2 participation contract regressed: ${marker}`);

function exportedNames(source) {
  const names = new Set();
  const directPatterns = [
    /^export\s+type\s+([A-Za-z_$][\w$]*)/gm,
    /^export\s+interface\s+([A-Za-z_$][\w$]*)/gm,
    /^export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/gm,
    /^export\s+(?:const|let|var|class|enum)\s+([A-Za-z_$][\w$]*)/gm,
  ];
  for (const pattern of directPatterns) for (const match of source.matchAll(pattern)) names.add(match[1]);
  const blocks = /export\s+(?:type\s+)?\{([\s\S]*?)\}\s+from\s+["'][^"']+["'];?/g;
  for (const match of source.matchAll(blocks)) {
    for (const item of match[1].split(",")) {
      const token = item.replace(/\/\*[\s\S]*?\*\//g, "").trim();
      if (!token) continue;
      const alias = token.split(/\s+as\s+/);
      names.add((alias[1] || alias[0]).trim());
    }
  }
  return names;
}
const baselineExports = JSON.parse(read("scripts/g1-4-remote-compatibility-exports.json"));
const currentExports = exportedNames(facade);
const missingExports = baselineExports.filter(name => !currentExports.has(name));
if (missingExports.length) fail(`historical lib/remote.ts exports missing: ${missingExports.join(", ")}`);

// Accepted G2 files cannot disappear silently during the extraction.
const acceptedFiles = read("scripts/g3-accepted-source-baseline.txt").split(/\r?\n/).map(x => x.trim()).filter(Boolean);
const missingFiles = acceptedFiles.filter(file => !fs.existsSync(path.join(root, file)));
if (missingFiles.length) fail(`accepted G2 files deleted: ${missingFiles.join(", ")}`);

// G3 is an adapter/runtime extraction, not a schema rewrite.
const migrations = fs.readdirSync(path.join(root, "supabase/migrations")).filter(x => x.endsWith(".sql")).sort();
const post044 = migrations.filter(x => /^04[5-9]_/.test(x) || /^[1-9][0-9]{2,}_/.test(x));
if (post044.length) fail(`G3 unexpectedly added database migrations: ${post044.join(", ")}`);

if (!process.exitCode) console.log(`G3 network construction gate: PASS — ${baselineExports.length} historical remote exports and ${acceptedFiles.length} accepted G2 files preserved`);
