import fs from 'node:fs';
import path from 'node:path';

const ROLE_NAMES=['public','anon','authenticated'];

function migrationFiles(root='supabase/migrations'){
  if(!fs.existsSync(root))return [];
  return fs.readdirSync(root).filter(x=>x.endsWith('.sql')).sort().map(name=>({name,path:path.join(root,name),text:fs.readFileSync(path.join(root,name),'utf8')}));
}

function extractNames(spec){
  const out=[];
  for(const m of spec.matchAll(/(?:public\.)?([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g))out.push(m[1]);
  return [...new Set(out)];
}

function ensure(map,name){
  if(!map.has(name))map.set(name,{name,expectedRoles:new Set(),explicitPublicRevoke:false,explicitRoleEvents:[],definitionFiles:[],dropFiles:[],securityDefinerDefinitions:0,fixedSearchPathDefinitions:0});
  return map.get(name);
}

export function buildMigrationRpcIntent(root='supabase/migrations'){
  const map=new Map();
  const files=migrationFiles(root);
  for(const file of files){
    const t=file.text;
    const creates=[...t.matchAll(/create\s+(?:or\s+replace\s+)?function\s+(?:public\.)?([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/ig)];
    for(let i=0;i<creates.length;i++){
      const m=creates[i],item=ensure(map,m[1]);
      item.definitionFiles.push(file.name);
      const end=i+1<creates.length?creates[i+1].index:t.length;
      const block=t.slice(m.index,end);
      if(/security\s+definer/i.test(block))item.securityDefinerDefinitions++;
      if(/set\s+search_path\s*=/i.test(block))item.fixedSearchPathDefinitions++;
    }
    for(const m of t.matchAll(/drop\s+function\s+(?:if\s+exists\s+)?([\s\S]*?);/ig)){
      for(const n of extractNames(m[1]))ensure(map,n).dropFiles.push(file.name);
    }
    for(const m of t.matchAll(/revoke\s+(?:all|execute)\s+on\s+function\s+([\s\S]*?)\s+from\s+([^;]+);/ig)){
      const roles=m[2].toLowerCase();
      for(const n of extractNames(m[1])){
        const item=ensure(map,n);
        if(/\bpublic\b/.test(roles))item.explicitPublicRevoke=true;
        for(const role of ROLE_NAMES)if(new RegExp(`\\b${role}\\b`,'i').test(roles))item.explicitRoleEvents.push({file:file.name,action:'revoke',role});
      }
    }
    for(const m of t.matchAll(/grant\s+execute\s+on\s+function\s+([\s\S]*?)\s+to\s+([^;]+);/ig)){
      const roles=m[2].toLowerCase();
      for(const n of extractNames(m[1])){
        const item=ensure(map,n);
        for(const role of ROLE_NAMES){
          if(new RegExp(`\\b${role}\\b`,'i').test(roles)){
            if(role!=='public')item.expectedRoles.add(role);
            item.explicitRoleEvents.push({file:file.name,action:'grant',role});
          }
        }
      }
    }
  }
  const functions=[...map.values()].map(item=>({
    ...item,
    expectedRoles:[...item.expectedRoles].sort(),
    definitionFiles:[...new Set(item.definitionFiles)],
    dropFiles:[...new Set(item.dropFiles)],
    classification:item.expectedRoles.has('anon')?'anonymous':item.expectedRoles.has('authenticated')?'authenticated':item.explicitPublicRevoke?'internal':'unclassified',
    aclResetRisk:item.dropFiles.length>0 && item.explicitRoleEvents.length>0 && item.dropFiles.some(drop=>drop>item.explicitRoleEvents.at(-1)?.file),
  })).sort((a,b)=>a.name.localeCompare(b.name));
  return {
    generatedAt:new Date().toISOString(),
    migrationCount:files.length,
    functionNameCount:functions.length,
    anonymousFunctions:functions.filter(x=>x.classification==='anonymous').map(x=>x.name),
    authenticatedFunctions:functions.filter(x=>x.classification==='authenticated').map(x=>x.name),
    internalFunctions:functions.filter(x=>x.classification==='internal').map(x=>x.name),
    unclassifiedFunctions:functions.filter(x=>x.classification==='unclassified').map(x=>x.name),
    functions,
  };
}

export function intentMap(contract){return new Map(contract.functions.map(x=>[x.name,x]));}
