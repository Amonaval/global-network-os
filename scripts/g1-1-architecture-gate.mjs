import fs from "node:fs";
import path from "node:path";
const root=process.cwd(), read=p=>fs.readFileSync(path.join(root,p),"utf8");
const fail=m=>{console.error(`G1.1 architecture gate: FAIL — ${m}`);process.exitCode=1};
for(const f of ["core/verticals/contracts.ts","app-shell/vertical-registry.ts","verticals/family/definition.ts","verticals/alumni/definition.ts"]) if(!fs.existsSync(path.join(root,f))) fail(`missing ${f}`);
const c=read("core/verticals/contracts.ts"), r=read("app-shell/vertical-registry.ts"), f=read("verticals/family/definition.ts"), a=read("verticals/alumni/definition.ts"), n=read("lib/network.ts"), s=read("components/SetupScreen.tsx");
if(!c.includes('NetworkVerticalKind = "family" | "alumni"')) fail("typed family/alumni vertical kind is missing");
if(!f.includes('kind: "family"')||!f.includes('status: "active"')) fail("Family must be active");
if(!a.includes('kind: "alumni"')||!a.includes('status: "skeleton"')) fail("Alumni must remain skeleton");
if(!r.includes("Duplicate vertical registration")) fail("registry uniqueness guard missing");
if(!r.includes('DEFAULT_VERTICAL_KIND: NetworkVerticalKind = "family"')) fail("Family must stay default");
if(!n.includes("resolveNetworkVerticalKind")) fail("runtime vertical resolver missing");
if(!s.includes('getVerticalDefinition("family")')) fail("Family setup is not registry-composed");
for(const base of ["core","capabilities","domain-layers"]){const start=path.join(root,base);if(!fs.existsSync(start))continue;const stack=[start];while(stack.length){const cur=stack.pop();for(const e of fs.readdirSync(cur,{withFileTypes:true})){const full=path.join(cur,e.name);if(e.isDirectory())stack.push(full);else if(/\.[cm]?[jt]sx?$/.test(e.name)){const src=fs.readFileSync(full,"utf8");if(/from\s+["'][^"']*verticals\//.test(src))fail(`${path.relative(root,full)} imports an explicit vertical`)}}}}
if(/verticals\/alumni/.test(f)) fail("Family imports Alumni");
if(/verticals\/family/.test(a)) fail("Alumni imports Family");
if(!process.exitCode) console.log("G1.1 architecture gate: PASS");
