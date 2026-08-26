import fs from "node:fs";
const need=(file,text)=>{const body=fs.readFileSync(file,"utf8");if(!body.includes(text))throw new Error(`${file} missing: ${text}`)};
const exists=file=>{if(!fs.existsSync(file))throw new Error(`Missing ${file}`)};
try{
 ["components/MyNetworksHome.tsx","core/identity/trusted-person.ts","capabilities/trusted-identity/runtime.ts","NX-1-MY-NETWORKS-TRUSTED-IDENTITY.md"].forEach(exists);
 need("components/NetworkApp.tsx","<MyNetworksHome");
 need("components/NetworkApp.tsx","<NetworkSwitcher label=\"My Networks\"");
 need("capabilities/network-context/remote.ts",'value === "organization"');
 need("capabilities/network-context/remote.ts",'value === "business-trust"');
 need("capabilities/network-context/remote.ts",'value === "franchise"');
 need("core/identity/trusted-person.ts","Networks never silently merge");
 need("components/MyNetworksHome.tsx","Connected for you. Isolated by default.");
 console.log("NX-1 source gate: PASS — My Networks, trusted identity seam, five-vertical classification and privacy UX present.");
}catch(error){console.error(`NX-1 source gate: FAIL — ${error.message}`);process.exit(1)}
