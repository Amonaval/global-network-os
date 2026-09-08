import fs from 'node:fs';import path from 'node:path';
const FILE=path.join('qa-results','issues','findings.ndjson');
export function recordFinding(f){fs.mkdirSync(path.dirname(FILE),{recursive:true});fs.appendFileSync(FILE,JSON.stringify({at:new Date().toISOString(),severity:'P2',...f})+'\n')}
export function resetFindings(){fs.mkdirSync(path.dirname(FILE),{recursive:true});fs.writeFileSync(FILE,'')}
