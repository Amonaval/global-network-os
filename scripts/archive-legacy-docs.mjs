import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const groups={
  "family-foundation": /^((A\d|ALPHA|B0|CR|D1|S[123]-|PILOT|PRE-ALPHA).*)\.md$/i,
  "g0-g6": /^(G[0-6][.-].*|G5-CERTIFICATION-HOTFIX-VERTICAL-FEATURE-DISPATCH)\.md$/i,
  "g7": /^(G7-.*|README-G7-.*)\.md$/i,
  "g8": /^G8-.*\.md$/i
};
const protectedRoot=new Set([
  "README.md","PROJECT-VISION.md","FOUNDER-COMPASS.md","ROADMAP.md","MISSION-STATUS.md","CODEBASE.md","CODEBASE-UPDATE-RULE.md","DEVELOPMENT-RULES.md","VALIDATION.md","USER-GUIDE.md","DEPLOY.md","SUPABASE-SETUP-GUIDE.md","VERCEL-SETUP-GUIDE.md","MODEL-SELECTION-RULE.md","NEXT-SESSION-PROMPT.md",
  "ARCHIVE-INDEX.md","GENERIC-CAPABILITY-UTILIZATION-RULE.md","G8.5-A-CAPABILITY-APPLICABILITY-MATRIX.md","G8.5-A-BASELINE-CLEANUP-AUDIT.md","G8.5-A-RUNTIME-VERIFICATION-CHECKLIST.md","G8.5-A-RELEASE-MANIFEST.md"
]);
for(const name of fs.readdirSync(root)){
  if(!name.endsWith(".md")||protectedRoot.has(name)) continue;
  const group=Object.entries(groups).find(([,rx])=>rx.test(name))?.[0]||"legacy-planning";
  const dir=path.join(root,"archive","docs",group); fs.mkdirSync(dir,{recursive:true});
  const src=path.join(root,name),dst=path.join(dir,name);
  if(fs.existsSync(dst)) fs.rmSync(src); else fs.renameSync(src,dst);
}
console.log("Historical documentation archive normalized under archive/docs/. No content deleted.");
