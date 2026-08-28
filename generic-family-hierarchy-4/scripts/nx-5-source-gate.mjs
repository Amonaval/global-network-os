import fs from "node:fs";
const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),"utf8");
const belonging=read("components/FamilyBelonging.tsx");
const home=read("components/FamilyHome.tsx");
const hub=read("components/FamilyExperienceHub.tsx");
const css=read("app/globals.css");
const guide=read("lib/user-guide-content.ts");
const mission=read("NX-5-FAMILY-CONNECTION-BELONGING.md");
const checks=[
 [belonging.includes("Know the people behind the family tree"),"product promise"],
 [belonging.includes("findRelationshipPath")&&belonging.includes("relationshipLabelToViewer"),"relationship-aware implementation"],
 [belonging.includes("Family circles")&&belonging.includes("Your generation"),"derived circles"],
 [belonging.includes("commonAncestors")&&belonging.includes("Connected through"),"family context signal"],
 [home.includes("<FamilyExperienceHub")&&hub.includes("<FamilyBelonging"),"Family Home integration"],
 [css.includes("NX-5 — Family Connection & Belonging"),"responsive styling"],
 [guide.includes('key:"family-belonging"'),"guide coverage"],
 [mission.includes("No new persistence model")&&mission.includes("No contact field"),"privacy and architecture guardrails"],
 [!belonging.includes("phone")&&!belonging.includes("email"),"no private contact sourcing"],
];
const bad=checks.filter(([ok])=>!ok);if(bad.length){for(const [,label] of bad)console.error(`FAIL: ${label}`);process.exit(1)}
console.log(`NX-5 source gate passed (${checks.length}/${checks.length}).`);
