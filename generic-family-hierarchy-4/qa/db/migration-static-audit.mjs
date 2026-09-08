import fs from 'node:fs';import path from 'node:path';
const dir='supabase/migrations';const files=fs.readdirSync(dir).filter(x=>x.endsWith('.sql')).sort();const errors=[];
const strip=s=>s.replace(/--.*$/gm,'').replace(/\/\*[\s\S]*?\*\//g,'');
for(const f of files){const raw=fs.readFileSync(path.join(dir,f),'utf8'),s=strip(raw);if(/delete\s+from\s+storage\.objects/i.test(s))errors.push(`${f}: direct storage.objects DELETE is forbidden`);
 const functions=s.split(/(?=create\s+(?:or\s+replace\s+)?function\s+)/i).slice(1);
 for(const fn of functions){if(!/returns\s+table\s*\([^)]*\bstatus\b/i.test(fn)||!/language\s+plpgsql/i.test(fn))continue;const body=(fn.match(/\$\$([\s\S]*?)\$\$/)||[])[1]||'';const unqualified=[...body.matchAll(/\b(?:where|and|or|if|when)\s+status\s*(?:=|<>|!=|\bin\b|\bis\b)/gi)];if(unqualified.length){const name=(fn.match(/function\s+([^\s(]+)/i)||[])[1]||'unknown';errors.push(`${f}: ${name} may reference output column status ambiguously`)}
 }
}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}console.log(`Migration static audit PASS (${files.length} SQL files)`);
