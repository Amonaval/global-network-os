import fs from 'node:fs';import path from 'node:path';
const files=['MISSION-STATUS-earlier.md','ROADMAP-earlier.md','Doc_Ideas.txt','P3_Review.txt','P4_Plan.txt','Architecture_P4.md','FAMILY-RELEASE-1.md','FAMILY-RELEASE-2.md','FAMILY-RELEASE-2A-STORAGE-CONTROLS.md','P4-PRODUCTION-READINESS.md','P4.1-IMPLEMENTATION.md','P4.2-IMPLEMENTATION.md','P4.3-IMPLEMENTATION.md','P4.4-IMPLEMENTATION.md','P5-ACTIVE-PLAN.md','P5-CONFIGURABLE-TYPES.md','P5-ROADMAP.md','P5-S0-VERIFICATION.md','P5.1-FAMILY-UX-AUDIT.md','P5.1-IMPLEMENTATION.md','REGRESSION-AUDIT-FAMILY-RELEASE-1.md'];
const dir=path.join(process.cwd(),'archive','history');fs.mkdirSync(dir,{recursive:true});
for(const f of files){const src=path.join(process.cwd(),f),dst=path.join(dir,f);if(fs.existsSync(src)&&!fs.existsSync(dst))fs.renameSync(src,dst);else if(fs.existsSync(src)&&fs.existsSync(dst))fs.rmSync(src);}
console.log(`Historical planning archive ready: ${dir}`);
