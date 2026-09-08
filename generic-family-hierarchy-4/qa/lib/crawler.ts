import {expect,type Page,type TestInfo} from '@playwright/test';
import fs from 'node:fs';import path from 'node:path';
import {attachRuntimeWatch} from './runtime-watch';
import {mutationAllowed} from './safety';
const destructive=/delete|remove|purge|leave|archive|revoke|sign out|logout|pay|confirm|send invite|import now|add .* now/i;
const external=/download|print|export|mailto:|tel:/i;
const fatal=/Unhandled Runtime Error|Application error|column reference .* ambiguous|Module not found|TypeError:/i;
type NodeRec={id:string;url:string;text:string;tag:string;role:string|null;testId:string|null;href:string|null;disabled:boolean};
type Edge={from:string;to:string;action:string;testId:string|null;outcome:'navigated'|'state-change'|'blocked'|'error';error?:string};
function slug(x:string){return x.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80)||'action'}
async function inventory(page:Page):Promise<NodeRec[]>{return await page.locator('a:visible,button:visible,[role=tab]:visible,[role=menuitem]:visible,[data-testid]:visible').evaluateAll((els:any[])=>els.slice(0,300).map((el:any,i)=>({id:String(i),url:location.href,text:(el.innerText||el.getAttribute('aria-label')||el.getAttribute('title')||'').trim(),tag:el.tagName.toLowerCase(),role:el.getAttribute('role'),testId:el.getAttribute('data-testid'),href:el.getAttribute('href'),disabled:!!el.disabled||el.getAttribute('aria-disabled')==='true'})))}
export async function expertCrawl(page:Page,testInfo:TestInfo,{maxActions=60,role='unknown',scope='app',expectedTestIds=[]}:{maxActions?:number;role?:string;scope?:string;expectedTestIds?:string[]}={}){
 const watch=attachRuntimeWatch(page,testInfo),visited=new Set<string>(),nodes=new Map<string,NodeRec>(),edges:Edge[]=[];let current=`page:${page.url()}`;
 for(let n=0;n<maxActions;n++){
  await page.waitForLoadState('domcontentloaded');await page.waitForTimeout(120);
  for(const item of await inventory(page)){const k=`${item.url}|${item.testId||item.text}|${item.href||''}`;nodes.set(k,{...item,id:k})}
  const candidates=page.locator('a:visible,button:visible,[role=tab]:visible,[role=menuitem]:visible');const count=Math.min(await candidates.count(),180);let acted=false;
  for(let i=0;i<count;i++){
   const el=candidates.nth(i);let text='',testId:string|null=null,href:string|null=null,disabled=false;try{text=((await el.innerText())||await el.getAttribute('aria-label')||await el.getAttribute('title')||'').trim();testId=await el.getAttribute('data-testid');href=await el.getAttribute('href');disabled=await el.isDisabled().catch(()=>false)}catch{continue}
   if(disabled||(!text&&!testId))continue;const label=testId||text;if(external.test(label))continue;if(destructive.test(label)&&!mutationAllowed())continue;
   const key=`${page.url()}|${testId||text}|${href||''}`;if(visited.has(key))continue;visited.add(key);const before=page.url();const beforeSig=await page.locator('body').innerText().then(x=>x.slice(0,3500)).catch(()=> '');
   try{await el.click({timeout:3500});await page.waitForTimeout(300);const after=page.url(),afterSig=await page.locator('body').innerText().then(x=>x.slice(0,3500)).catch(()=> '');const outcome=after!==before?'navigated':afterSig!==beforeSig?'state-change':'blocked';const to=`page:${after}#${slug(label)}`;edges.push({from:current,to,action:text||testId||'',testId,outcome});current=to;acted=true;break}catch(e:any){edges.push({from:current,to:current,action:text||testId||'',testId,outcome:'error',error:e.message});}
  }
  const body=await page.locator('body').innerText();expect(body).not.toMatch(fatal);if(!acted)break;
 }
 watch.flush();const dir='qa-results/crawl';fs.mkdirSync(dir,{recursive:true});const inventoryRows=[...nodes.values()];const discoveredIds=[...new Set(inventoryRows.map(x=>x.testId).filter(Boolean) as string[])].sort();const missingExpected=expectedTestIds.filter(x=>!discoveredIds.includes(x));const prefix=`${role}-${scope}`.replace(/[^a-z0-9-]+/gi,'-').toLowerCase();
 fs.writeFileSync(path.join(dir,`${prefix}-inventory.json`),JSON.stringify({role,scope,generatedAt:new Date().toISOString(),nodes:inventoryRows,discoveredTestIds:discoveredIds,expectedTestIds,missingExpected},null,2));
 fs.writeFileSync(path.join(dir,`${prefix}-action-graph.json`),JSON.stringify({role,scope,generatedAt:new Date().toISOString(),edges,uniqueActions:visited.size,urls:[...new Set(inventoryRows.map(x=>x.url))],expectedTestIds,missingExpected},null,2));
 expect(missingExpected,`crawler coverage missing required surfaces for ${role}/${scope}`).toEqual([]);
 return {actions:visited.size,issues:watch.issues,nodes:inventoryRows.length,edges:edges.length,missingExpected};
}
