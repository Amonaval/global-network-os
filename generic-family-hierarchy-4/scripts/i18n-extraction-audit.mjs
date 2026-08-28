import fs from 'node:fs';
import path from 'node:path';
const roots=['app','components'];
const files=[];
for(const root of roots){if(!fs.existsSync(root))continue;const walk=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(/\.tsx$/.test(e.name))files.push(p)}};walk(root)}
const results=[];
for(const file of files){const s=fs.readFileSync(file,'utf8');let n=0;
 // Visible JSX text nodes with letters; intentionally approximate.
 for(const m of s.matchAll(/>([^<>{}\n][^<>{}]*)</g)){const t=m[1].trim();if(/[A-Za-z]{2}/.test(t)&&!/^[-–—·|/]+$/.test(t))n++}
 // Common visible string props, excluding class/value identifiers.
 for(const m of s.matchAll(/\b(?:title|description|placeholder|aria-label|label|kicker|actionLabel)=(["'])(.*?)\1/g)){if(/[A-Za-z]{2}/.test(m[2]))n++}
 // User-facing browser dialogs/messages.
 for(const m of s.matchAll(/\b(?:confirm|alert)\(\s*(["'`])([^\n]*?)\1\s*\)/g)){if(/[A-Za-z]{2}/.test(m[2]))n++}
 if(n)results.push({file,count:n});
}
results.sort((a,b)=>b.count-a.count||a.file.localeCompare(b.file));
const total=results.reduce((a,x)=>a+x.count,0);
console.log(`Potential visible literal audit: ${total} candidates across ${results.length} TSX files`);
for(const x of results.slice(0,80))console.log(`${String(x.count).padStart(4)}  ${x.file}`);
