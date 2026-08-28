import fs from "node:fs";
const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),"utf8");
const home=read("components/FamilyHome.tsx");const hub=read("components/FamilyExperienceHub.tsx");const profile=read("components/ProfileDrawer.tsx");const account=read("components/shared/NetworkAccountMenu.tsx");const my=read("components/MyNetworksHome.tsx");const app=read("components/NetworkApp.tsx");const alumni=read("components/AlumniNetworkApp.tsx");const template=read("components/TemplateNetworkApp.tsx");const css=read("app/globals.css");const guide=read("lib/user-guide-content.ts");
const checks=[
 [home.includes("<FamilySignatureExperience")&&!home.includes("<FamilyExperienceHub"),"Family Home superseded by Mission 1 signature composition"],
 [hub.includes('type HubTab="today"|"people"|"legacy"')&&hub.includes("<LivingFamilyLoop")&&hub.includes("<FamilyBelonging")&&hub.includes("<FamilyTimeMachine"),"NX Today/People/Legacy capabilities preserved beneath product layer"],
 [profile.includes("nx6-profile-tabs")&&profile.includes('tab==="overview"')&&profile.includes('tab==="story"')&&profile.includes('tab==="family"'),"profile information hierarchy"],
 [account.includes("network-account-popover")&&app.includes("<NetworkAccountMenu")&&alumni.includes("<NetworkAccountMenu")&&template.includes("<NetworkAccountMenu"),"shared account controls"],
 [my.includes("One identity. Your meaningful networks.")&&my.includes("nx6-playground-drawer")&&my.includes("nx6-privacy-drawer"),"My Networks simplification"],
 [css.includes("NX-6 — WOW Experience & Product Unification")&&css.includes(".network-account-menu")&&css.includes(".nx6-profile-tabs"),"NX-6 responsive foundations preserved"],
 [!home.includes("<FamilyBelonging")&&!home.includes("<FamilyTimeMachine")&&!home.includes("<LivingFamilyLoop"),"feature stack remains removed from Home"],
 [guide.includes('title:"My Family, Through Me"')&&guide.includes("relationship path"),"Mission 1 guide supersedes old NX-6 Home guide"]
];
const bad=checks.filter(([ok])=>!ok);for(const [ok,label] of checks)console.log(`${ok?"PASS":"FAIL"} ${label}`);if(bad.length)process.exit(1);console.log(`NX-6 compatibility source gate passed (${checks.length}/${checks.length}).`);
