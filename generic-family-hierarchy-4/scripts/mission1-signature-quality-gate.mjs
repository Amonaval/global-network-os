import fs from "node:fs";
const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),"utf8");
const home=read("components/FamilyHome.tsx"),sig=read("components/FamilySignatureExperience.tsx"),model=read("lib/family-signature.ts"),app=read("components/NetworkApp.tsx"),comp=read("verticals/family/runtime/composition.ts"),css=read("app/globals.css"),i18n=read("lib/i18n.tsx"),guide=read("lib/user-guide-content.ts"),profile=read("components/ProfileDrawer.tsx");
const checks=[
 [home.includes("<FamilySignatureExperience")&&!home.includes("<FamilyExperienceHub"),"Home uses signature experience instead of NX feature hub"],
 [sig.includes("My Family, Through Me")&&sig.includes("family-signature-path"),"relationship-first signature surface"],
 [model.includes("buildFamilySignatureModel")&&model.includes("findRelationshipPath"),"signature selection lives in reusable domain model"],
 [!/(window\.|document\.|localStorage|React)/.test(model),"signature domain is UI/browser agnostic"],
 [sig.includes("relationshipSentence")&&sig.includes('language === "hi"')&&sig.includes('language === "mr"'),"signature relationship copy is localized"],
 [i18n.includes("type MessageCatalog = Record<MessageKey, string>")&&i18n.includes("function interpolate"),"typed complete i18n catalog with interpolation"],
 [profile.includes("relationBadge")&&profile.includes("relationshipSentence"),"Profile uses shared relationship language"],
 [comp.match(/primaryNavigation:[\s\S]*?mobileMoreNavigation:/)?.[0]?.includes('viewId:"home"')&&comp.match(/primaryNavigation:[\s\S]*?mobileMoreNavigation:/)?.[0]?.includes('viewId:"tree"')&&comp.match(/primaryNavigation:[\s\S]*?mobileMoreNavigation:/)?.[0]?.includes('viewId:"community"'),"Family primary navigation is lean"],
 [app.includes("desktop-more-nav")&&app.includes("minimumExperience"),"advanced navigation is progressively disclosed and experience-gated"],
 [css.includes("Mission 1 — Family Signature Experience")&&css.includes("@media(max-width:620px)"),"explicit desktop/tablet/mobile signature styling"],
 [guide.includes('title:"My Family, Through Me"')&&!guide.includes('title:"Family Home · Today, People & Legacy"'),"Guide reflects signature journey"]
];
for(const [ok,label] of checks)console.log(`${ok?"PASS":"FAIL"} ${label}`);if(checks.some(([ok])=>!ok))process.exit(1);console.log(`Mission 1 signature gate passed (${checks.length}/${checks.length}).`);
