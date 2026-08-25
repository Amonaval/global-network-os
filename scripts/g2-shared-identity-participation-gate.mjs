import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const fail = message => {
  console.error(`G2 shared identity/participation gate: FAIL — ${message}`);
  process.exitCode = 1;
};

const required = [
  "core/identity/contracts.ts",
  "core/participation/contracts.ts",
  "capabilities/identity-claiming/runtime.ts",
  "capabilities/participation/runtime.ts",
  "verticals/family/identity/claiming-adapter.ts",
  "verticals/family/participation/adapter.ts",
  "verticals/family/participation/types.ts",
  "verticals/alumni/identity/types.ts",
  "verticals/alumni/identity/claiming-adapter.ts",
  "verticals/alumni/participation/adapter.ts",
  "app-shell/vertical-capabilities.ts",
  "lib/remote.ts",
  "lib/participation-types.ts",
  "scripts/g1-4-remote-compatibility-exports.json",
];
for (const file of required) if (!fs.existsSync(path.join(root, file))) fail(`missing ${file}`);

const identityCore = read("core/identity/contracts.ts");
const participationCore = read("core/participation/contracts.ts");
const claimRuntime = read("capabilities/identity-claiming/runtime.ts");
const participationRuntime = read("capabilities/participation/runtime.ts");
const familyClaim = read("verticals/family/identity/claiming-adapter.ts");
const alumniClaim = read("verticals/alumni/identity/claiming-adapter.ts");
const familyParticipation = read("verticals/family/participation/adapter.ts");
const alumniParticipation = read("verticals/alumni/participation/adapter.ts");
const alumniTypes = read("verticals/alumni/identity/types.ts");
const verticalCapabilities = read("app-shell/vertical-capabilities.ts");
const facade = read("lib/remote.ts");
const legacyTypes = read("lib/participation-types.ts");

const stripComments = source => source
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/(^|[^:])\/\/.*$/gm, "$1");

for (const [name, source] of [
  ["core identity", identityCore],
  ["core participation", participationCore],
  ["identity claiming runtime", claimRuntime],
  ["participation runtime", participationRuntime],
]) {
  if (/from\s+["'](?:\.\.\/)+verticals\/(?:family|alumni)\//.test(source)) fail(`${name} imports a vertical implementation`);
  if (/family_members|\bmember_id\b|get_my_claimable_profiles|claim_profile_by_verified_email/i.test(stripComments(source))) fail(`${name} leaks Family persistence/RPC semantics`);
}

for (const marker of [
  "VerticalIdentityRef",
  "ClaimableIdentitySummary",
  "IdentityClaimRequest",
  "IdentityClaimResult",
  "IdentityBinding",
  "IdentityClaimAdapter",
]) if (!identityCore.includes(marker)) fail(`identity contract missing ${marker}`);

for (const marker of [
  "InvitationCreateRequest",
  "NetworkInvitationSummary",
  "GovernedContributionPrompt",
  "ParticipationMetricsSnapshot",
  "ParticipationAdapter",
]) if (!participationCore.includes(marker)) fail(`participation contract missing ${marker}`);

if (!familyClaim.includes('supabase.rpc("get_my_claimable_profiles")') || !familyClaim.includes('supabase.rpc("claim_profile_by_verified_email"'))
  fail("Family claiming adapter does not delegate to the existing verified-email RPCs");
if (facade.includes('supabase.rpc("get_my_claimable_profiles")') || facade.includes('supabase.rpc("claim_profile_by_verified_email"'))
  fail("Family claiming RPC implementation still lives in lib/remote.ts");
if (!facade.includes('../verticals/family/identity/claiming-adapter')) fail("remote facade does not preserve Family claiming exports through adapter");

for (const forbidden of ["family_members", "get_my_claimable_profiles", "claim_profile_by_verified_email", "member_id", "verticals/family"]) {
  if (stripComments(alumniClaim).includes(forbidden) || stripComments(alumniParticipation).includes(forbidden) || stripComments(alumniTypes).includes(forbidden))
    fail(`Alumni skeleton illegally reuses Family identity semantics: ${forbidden}`);
}
if (!/availability:\s*"(?:skeleton|ready)"/.test(alumniClaim) || !/availability:\s*"(?:skeleton|ready)"/.test(alumniParticipation))
  fail("Alumni identity/participation availability is not explicit");
if (!alumniTypes.includes("institutionId") || !alumniTypes.includes("graduationYear"))
  fail("Alumni identity skeleton does not express institutional identity semantics");

const familyParticipationRpcs = [
  "create_member_invitation",
  "accept_member_invitation",
  "create_bulk_member_invitations",
  "get_member_invitations",
  "revoke_member_invitation",
  "resend_member_invitation",
  "get_invitation_preview",
  "refresh_contribution_suggestions",
  "get_contribution_suggestions",
  "act_on_contribution_suggestion",
  "get_participation_metrics",
  "track_public_participation",
];
for (const rpc of familyParticipationRpcs) {
  if (!familyParticipation.includes(`"${rpc}"`)) fail(`Family participation adapter missing existing RPC ${rpc}`);
  if (facade.includes(`supabase.rpc("${rpc}"`)) fail(`participation RPC ${rpc} still implemented in lib/remote.ts`);
}
if (!facade.includes('../verticals/family/participation/adapter')) fail("remote facade does not preserve Family participation exports through adapter");
if (!legacyTypes.includes('../verticals/family/participation/types')) fail("lib/participation-types.ts is not a compatibility facade for extracted Family transport types");

for (const token of ["FAMILY_IDENTITY_CLAIM_ADAPTER", "ALUMNI_IDENTITY_CLAIM_ADAPTER", "FAMILY_PARTICIPATION_ADAPTER", "ALUMNI_PARTICIPATION_ADAPTER"])
  if (!verticalCapabilities.includes(token)) fail(`vertical capability composition missing ${token}`);
if (!verticalCapabilities.includes("createIdentityClaimingRuntime") || !verticalCapabilities.includes("createParticipationRuntime"))
  fail("app-shell does not compose shared identity/participation runtimes");

// Family/Alumni adapters must not depend on one another.
if (/verticals\/alumni|\.\.\/\.\.\/alumni/.test(familyClaim + familyParticipation)) fail("Family adapters depend on Alumni implementation");
if (/verticals\/family|\.\.\/\.\.\/family/.test(alumniClaim + alumniParticipation)) fail("Alumni adapters depend on Family implementation");

// Existing Family callers remain on the compatibility facades: no broad UI migration in G2.
for (const [file, marker] of [
  ["components/NetworkApp.tsx", 'from "../lib/remote"'],
  ["components/SetupScreen.tsx", "ClaimableProfile"],
  ["components/InvitationModal.tsx", 'from \'../lib/remote\''],
  ["components/ParticipationCenter.tsx", 'from "../lib/remote"'],
]) {
  const source = read(file);
  if (!source.includes(marker)) fail(`Family compatibility caller changed unexpectedly: ${file}`);
}

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
      const token = item.trim();
      if (!token) continue;
      const alias = token.split(/\s+as\s+/);
      names.add((alias[1] || alias[0]).trim());
    }
  }
  return names;
}
const baseline = JSON.parse(read("scripts/g1-4-remote-compatibility-exports.json"));
const current = exportedNames(facade);
const missing = baseline.filter(name => !current.has(name));
if (missing.length) fail(`historical lib/remote.ts exports missing: ${missing.join(", ")}`);

// G2 is TypeScript/API extraction only: do not create a fake Alumni DB by adding a new migration.
const migrationNames = fs.readdirSync(path.join(root, "supabase/migrations")).filter(x => x.endsWith(".sql")).sort();
const postG13 = migrationNames.filter(x => (/^04[5-9]_/.test(x) || /^[1-9][0-9]{2,}_/.test(x)) && !['045_g5_alumni_network_v1.sql','046_g6_two_vertical_hardening.sql'].includes(x));
if (postG13.length) fail(`G2 unexpectedly added database migrations: ${postG13.join(", ")}`);

if (!process.exitCode) console.log(`G2 shared identity/participation gate: PASS — ${baseline.length} historical remote exports preserved`);
