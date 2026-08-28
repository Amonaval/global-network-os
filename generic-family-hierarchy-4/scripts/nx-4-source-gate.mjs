import fs from "node:fs";
const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),"utf8");
const relay=read("components/FamilyGrowthRelay.tsx");
const participation=read("components/ParticipationCenter.tsx");
const app=read("components/NetworkApp.tsx");
const css=read("app/globals.css");
const guide=read("lib/user-guide-content.ts");
const checks=[
 [relay.includes("Everyone can help the family grow"),"relay product promise"],
 [relay.includes("Ask someone"),"privacy-safe handoff"],
 [relay.includes("findRelationshipPath")&&relay.includes("relationshipLabelToViewer"),"relationship-aware context"],
 [participation.includes("<FamilyGrowthRelay"),"participation integration"],
 [app.includes("relationships={relationships}")&&app.includes("viewerMemberId={viewerMemberId}"),"network context wiring"],
 [css.includes("NX-4 — Family Growth Relay"),"responsive styling"],
 [guide.includes('key:"family-growth-relay"'),"guide coverage"],
 [!relay.includes("phone")&&!relay.includes("email"),"share flow does not source private contact fields"],
];
const bad=checks.filter(([ok])=>!ok); if(bad.length){for(const [,label] of bad)console.error(`FAIL: ${label}`);process.exit(1)}
console.log(`NX-4 source gate passed (${checks.length}/${checks.length}).`);
