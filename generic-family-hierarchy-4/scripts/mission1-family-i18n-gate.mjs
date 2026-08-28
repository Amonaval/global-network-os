import fs from "node:fs";
const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),"utf8");
const files={auth:read("components/AuthPanel.tsx"),quick:read("components/QuickFamilyStart.tsx"),theme:read("components/ThemeSwitcher.tsx"),home:read("components/FamilySignatureExperience.tsx"),tree:read("components/TreeView.tsx"),profile:read("components/ProfileDrawer.tsx"),setup:read("components/SetupScreen.tsx"),importer:read("components/ImportModal.tsx"),i18n:read("lib/i18n.tsx")};
const tri=s=>/language\s*={2,3}\s*"hi"/.test(s)&&/language\s*={2,3}\s*"mr"/.test(s);
const checks=[
 [tri(files.auth),"auth/recovery supports EN/HI/MR"],
 [tri(files.quick),"quick family bootstrap supports EN/HI/MR"],
 [tri(files.theme),"appearance controls support EN/HI/MR"],
 [tri(files.home),"signature Home supports EN/HI/MR"],
 [tri(files.tree)&&files.tree.includes("localizeRelationshipLabel"),"Tree relationship labels support EN/HI/MR"],
 [tri(files.profile)&&files.profile.includes("relationshipSentence"),"Profile relationship journey supports EN/HI/MR"],
 [files.setup.includes('hi:')&&files.setup.includes('mr:'),"Family setup has Hindi/Marathi copy"],
 [files.importer.includes('language === "hi"')||files.importer.includes('language==="hi"')||files.importer.includes('hi:'),"Family import has locale-aware copy"],
 [files.i18n.includes("MessageCatalog")&&files.i18n.includes("hi: MessageCatalog")&&files.i18n.includes("mr: MessageCatalog"),"central locale catalogs are compile-time complete"]
];
for(const [ok,label] of checks)console.log(`${ok?"PASS":"FAIL"} ${label}`);if(checks.some(([ok])=>!ok))process.exit(1);console.log(`Mission 1 Family i18n gate passed (${checks.length}/${checks.length}).`);
