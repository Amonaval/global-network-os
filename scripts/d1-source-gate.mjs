import fs from "node:fs";
import path from "node:path";

const root=process.cwd(),fail=[];
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const migrations=fs.readdirSync(path.join(root,"supabase/migrations")).filter(x=>x.endsWith(".sql")).sort();
const numbers=migrations.map(x=>Number(x.slice(0,3)));
for(let i=1;i<=16;i++)if(!numbers.includes(i))fail.push(`missing migration ${String(i).padStart(3,"0")}`);
if(new Set(numbers).size!==numbers.length)fail.push("duplicate migration number");
const all=migrations.map(x=>read(`supabase/migrations/${x}`)).join("\n").toLowerCase();
for(const bucket of ["profile-photos","community-media"]){
 if(!all.includes(`update storage.buckets set public = false`))fail.push(`${bucket} private-bucket closure missing`);
}
const d1=read("supabase/migrations/016_d1_production_participation.sql").toLowerCase();
for(const marker of ["revoked_at is null","create_bulk_member_invitations","refresh_contribution_suggestions","track_public_participation","get_participation_metrics","respond_to_community_event"])
 if(!d1.includes(marker))fail.push(`D1 marker missing: ${marker}`);
const definer=(d1.match(/security definer/g)||[]).length,paths=(d1.match(/set search_path=/g)||[]).length;
if(paths<definer)fail.push(`security definer search_path coverage ${paths}/${definer}`);
for(const route of ["app/public/member/[id]/page.tsx","components/ParticipationCenter.tsx","components/PublicMemberPage.tsx"])
 if(!fs.existsSync(path.join(root,route)))fail.push(`route/component missing: ${route}`);
if(fail.length){console.error("D1 SOURCE GATE: FAILED\n- "+fail.join("\n- "));process.exit(1)}
console.log(`D1 SOURCE GATE: PASS (${migrations.length} migrations; ${definer} D1 security-definer functions checked)`);
