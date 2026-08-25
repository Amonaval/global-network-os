import fs from "node:fs";
const req=[
 "components/shared/NetworkGeography.tsx","components/shared/NetworkRelationshipExplorer.tsx","components/shared/NetworkEntityDetail.tsx",
 "archive/docs/g8.5/G8.5-B-CAPABILITY-PARITY.md","archive/docs/g8.5/G8.5-B-RUNTIME-VERIFICATION-CHECKLIST.md","archive/docs/g8.5/G8.5-B-RELEASE-MANIFEST.md"
];
for(const f of req)if(!fs.existsSync(f))throw new Error(`G8.5-B missing ${f}`);
const app=fs.readFileSync("components/TemplateNetworkApp.tsx","utf8"),activity=fs.readFileSync("components/shared/NetworkActivityHub.tsx","utf8"),cfg=fs.readFileSync("templates/productized/config.ts","utf8");
for(const token of ["NetworkGeography","NetworkRelationshipExplorer","NetworkEntityDetail","Launch Control status","What this network can do"])if(!app.includes(token))throw new Error(`G8.5-B app contract missing ${token}`);
if(!activity.includes('["event","memory","milestone","announcement"]'))throw new Error("G8.5-B activity discoverability regression");
for(const id of ["o12","b12","f12"])if(!cfg.includes(`\"${id}\"`))throw new Error(`G8.5-B showcase depth missing ${id}`);
console.log("G8.5-B capability parity gate: PASS — shared geography, relationship exploration, entity detail, living-network visibility and governance/help contracts present across productized verticals.");
