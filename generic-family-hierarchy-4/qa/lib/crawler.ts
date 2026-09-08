import {expect,type Page,type TestInfo} from '@playwright/test';
import {attachRuntimeWatch} from './runtime-watch';
const dangerous=/delete|remove|purge|leave|archive|revoke|sign out|logout|pay|submit|confirm|send invite|import/i;
const skip=/download|print|export|mailto:|tel:/i;
export async function expertCrawl(page:Page,testInfo:TestInfo,{maxActions=45}:{maxActions?:number}={}){const watch=attachRuntimeWatch(page,testInfo);const visited=new Set<string>();for(let n=0;n<maxActions;n++){await page.waitForLoadState('domcontentloaded');const candidates=page.locator('a:visible,button:visible,[role=tab]:visible');const count=Math.min(await candidates.count(),120);let acted=false;for(let i=0;i<count;i++){const el=candidates.nth(i);let text='';try{text=((await el.innerText())||await el.getAttribute('aria-label')||'').trim()}catch{continue}if(!text||dangerous.test(text)||skip.test(text))continue;const key=`${page.url()}|${text}`;if(visited.has(key))continue;visited.add(key);try{await el.click({timeout:3000});await page.waitForTimeout(350);acted=true;break}catch{}}
 if(!acted)break;
 const body=await page.locator('body').innerText();expect(body).not.toMatch(/Unhandled Runtime Error|Application error|column reference .* ambiguous|Module not found|TypeError:/i);
 }watch.flush();return {actions:visited.size,issues:watch.issues}}
