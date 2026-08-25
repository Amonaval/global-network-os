import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const fail = message => {
  console.error(`G1.4 remote capability gate: FAIL — ${message}`);
  process.exitCode = 1;
};

const required = [
  "lib/remote.ts",
  "capabilities/network-context/remote.ts",
  "capabilities/launch-runtime/remote.ts",
  "capabilities/platform-ownership/remote.ts",
  "scripts/g1-4-remote-compatibility-exports.json",
  "components/FounderLaunchConsole.tsx",
  "supabase/migrations/044_g1_3_feature_catalog_integrity.sql",
  "verticals/family/features/catalog.ts",
  "verticals/family/construction/adapter.ts",
];
for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) fail(`missing ${file}`);
}

const facade = read("lib/remote.ts");
const networkRemote = read("capabilities/network-context/remote.ts");
const launchRemote = read("capabilities/launch-runtime/remote.ts");
const ownerRemote = read("capabilities/platform-ownership/remote.ts");
const founder = read("components/FounderLaunchConsole.tsx");
const migration = read("supabase/migrations/044_g1_3_feature_catalog_integrity.sql");
const catalog = read("verticals/family/features/catalog.ts");
const familyConstruction = read("verticals/family/construction/adapter.ts");

for (const [name, source] of [
  ["network-context", networkRemote],
  ["launch-runtime", launchRemote],
  ["platform-ownership", ownerRemote],
]) {
  if (/from\s+["'](?:\.\.\/)+verticals\//.test(source)) fail(`${name} imports a vertical implementation`);
}

if (/\bmember_id\s*[?:]/.test(networkRemote)) fail("neutral network-context transport exposes the Family member_id link");
if (!networkRemote.includes('supabase.rpc("get_my_networks")') || !networkRemote.includes('supabase.rpc("set_active_network"'))
  fail("network-context transport does not own the expected neutral RPC seam");

for (const rpc of [
  "get_playground_features",
  "get_playground_launch_console",
  "set_playground_feature_visibility",
  "get_effective_platform_features",
  "get_platform_launch_console",
  "get_platform_rollout_audit",
  "set_platform_feature_rollout",
  "set_platform_bundle_rollout",
  "get_my_feature_announcements",
  "mark_feature_announcement_seen",
]) {
  if (!launchRemote.includes(`\"${rpc}\"`)) fail(`launch-runtime transport missing RPC ${rpc}`);
  if (facade.includes(`supabase.rpc(\"${rpc}\"`)) fail(`compatibility facade still implements extracted launch RPC ${rpc}`);
}

for (const rpc of ["get_platform_owners", "add_platform_owner_by_email", "remove_platform_owner", "get_platform_owner_audit"]) {
  if (!ownerRemote.includes(`\"${rpc}\"`)) fail(`platform-ownership transport missing RPC ${rpc}`);
  if (facade.includes(`supabase.rpc(\"${rpc}\"`)) fail(`compatibility facade still implements extracted ownership RPC ${rpc}`);
}

if (!facade.includes('../capabilities/network-context/remote') ||
    !facade.includes('../capabilities/launch-runtime/remote') ||
    !facade.includes('../capabilities/platform-ownership/remote')) {
  fail("lib/remote.ts is not acting as the G1.4 compatibility facade");
}

// Family semantics that remain outside later extracted seams still live in the legacy facade.
for (const familyRpc of ["create_family", "get_family_memberships", "get_visible_family_members"]) {
  if (!facade.includes(`\"${familyRpc}\"`)) fail(`Family RPC ${familyRpc} was moved or removed prematurely`);
}
// G3 is allowed to move the already-proven S3-A1 transport behind the Family construction adapter.
if (!facade.includes('verticals/family/construction/adapter') || !familyConstruction.includes('"get_family_intake_admin_dashboard"'))
  fail("Family intake transport is neither preserved in facade nor owned by the G3 Family construction adapter");

function exportedNames(source) {
  const names = new Set();
  const directPatterns = [
    /^export\s+type\s+([A-Za-z_$][\w$]*)/gm,
    /^export\s+interface\s+([A-Za-z_$][\w$]*)/gm,
    /^export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/gm,
    /^export\s+(?:const|let|var|class|enum)\s+([A-Za-z_$][\w$]*)/gm,
  ];
  for (const pattern of directPatterns) {
    for (const match of source.matchAll(pattern)) names.add(match[1]);
  }
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

const baseline = JSON.parse(read("scripts/g1-4-remote-compatibility-exports.json"));
const current = exportedNames(facade);
const missingExports = baseline.filter(name => !current.has(name));
if (missingExports.length) fail(`historical lib/remote.ts exports missing: ${missingExports.join(", ")}`);

// Preserve the G1.3 catalog drift safety net while remote code moves around it.
if (!founder.includes("playgroundByKey.has(f.key)") || !founder.includes("Database update required"))
  fail("Playground code↔database drift guard regressed");
const catalogKeys = [...catalog.matchAll(/\{key:"([^"]+)"/g)].map(m => m[1]);
const missingCatalogKeys = catalogKeys.filter(key => !migration.includes(`'${key}'`));
if (missingCatalogKeys.length) fail(`feature catalog reconciliation missing keys: ${missingCatalogKeys.join(", ")}`);

if (!process.exitCode) console.log(`G1.4 remote capability gate: PASS — ${baseline.length} historical facade exports preserved`);
