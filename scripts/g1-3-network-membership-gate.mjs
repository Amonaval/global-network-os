import fs from "node:fs";
import path from "node:path";
const root=process.cwd(), read=p=>fs.readFileSync(path.join(root,p),"utf8");
const fail=m=>{console.error(`G1.3 network/membership gate: FAIL — ${m}`);process.exitCode=1};
const required=[
  "core/network/contracts.ts",
  "capabilities/network-context/remote.ts",
  "verticals/family/network/membership-adapter.ts",
  "lib/remote.ts","lib/network.ts","lib/auth.ts",
  "components/FounderLaunchConsole.tsx",
  "supabase/migrations/044_g1_3_feature_catalog_integrity.sql",
  "verticals/family/features/catalog.ts"
];
for(const f of required) if(!fs.existsSync(path.join(root,f))) fail(`missing ${f}`);
const core=read("core/network/contracts.ts"), networkRemote=read("capabilities/network-context/remote.ts"), adapter=read("verticals/family/network/membership-adapter.ts"), remote=read("lib/remote.ts"), network=read("lib/network.ts"), auth=read("lib/auth.ts"), founder=read("components/FounderLaunchConsole.tsx"), migration=read("supabase/migrations/044_g1_3_feature_catalog_integrity.sql"), catalog=read("verticals/family/features/catalog.ts");
if(/family|alumni|member_id|family_members/i.test(core)) fail("core network contracts contain vertical/domain membership semantics");
for(const marker of ["NetworkMembershipRole","NetworkIdentity","NetworkMembership","ActiveNetworkContext"]) if(!core.includes(`type ${marker}`)&&!core.includes(`export type ${marker}`)) fail(`neutral contract missing: ${marker}`);
if(!adapter.includes("LegacyFamilyNetworkMembershipRow")||!adapter.includes("member_id?: string | null")) fail("Family member_id leak is not isolated in the Family adapter");
if(!adapter.includes('verticalKind: "family"')||!adapter.includes("adaptLegacyFamilyNetworkMembership")) fail("Family transport adapter does not produce neutral membership");
if(!networkRemote.includes("fetchMyNetworkMemberships")||!networkRemote.includes("get_my_networks")||/\bmember_id\s*[?:]/.test(networkRemote)) fail("neutral membership fetch seam missing or Family profile link leaked into capability transport");
if(!remote.includes("fetchMyNetworkMemberships")||!remote.includes("../capabilities/network-context/remote")) fail("compatibility facade does not preserve the neutral membership export");
if(!remote.includes("export type NetworkMembership = LegacyFamilyNetworkMembershipRow")||!remote.includes("export async function fetchMyNetworks")) fail("legacy Family membership facade was not preserved");
if(!/fetchNetworkSettings[\s\S]*fetchMyNetworkMemberships\(\)/.test(remote)) fail("network settings still depends on the Family-shaped membership facade");
if(!network.includes("membership_role?: NetworkMembershipRole")) fail("NetworkSettings membership role is not neutral");
if(!auth.includes("membership_role?:NetworkMembershipRole")||!auth.includes("family_role?:NetworkMembershipRole")||!auth.includes("membership_role:membershipRole,family_role:membershipRole")) fail("AuthUser generic role + Family compatibility alias contract missing");
if(/alter table\s+public\.network_memberships|drop table\s+public\.network_memberships|drop function\s+.*get_my_networks|create (?:or replace )?function\s+public\.get_my_networks/i.test(migration)) fail("G1.3 migration changes membership schema/RPC; forbidden in this mission");
if(!migration.includes("043_s3a1_distributed_family_intake.sql")) fail("feature repair does not guard the S3-A1 backend prerequisite");
if(!founder.includes("playgroundByKey.has(f.key)")||!founder.includes("Database update required")) fail("Launch Control does not guard code↔database feature catalog drift");
const catalogKeys=[...catalog.matchAll(/\{key:"([^"]+)"/g)].map(m=>m[1]);
const missing=catalogKeys.filter(k=>!migration.includes(`'${k}'`));
if(missing.length) fail(`feature catalog reconciliation missing keys: ${missing.join(", ")}`);
if(catalogKeys.length!==23) fail(`expected 23 Family feature keys, found ${catalogKeys.length}`);
if(!process.exitCode) console.log("G1.3 network/membership gate: PASS");
