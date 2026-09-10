import {defineConfig,devices} from '@playwright/test';
import fs from 'node:fs';import path from 'node:path';
function loadEnv(file:string,fillBlank=false){if(!fs.existsSync(file))return;for(const raw of fs.readFileSync(file,'utf8').split(/\r?\n/)){const line=raw.trim();if(!line||line.startsWith('#'))continue;const i=line.indexOf('=');if(i<1)continue;const k=line.slice(0,i).trim(),v=line.slice(i+1).trim();if(process.env[k]===undefined||(fillBlank&&!process.env[k]))process.env[k]=v}}
loadEnv(path.resolve(process.env.QA_ENV_FILE||'.env.qa'));loadEnv(path.resolve('qa-results/fixtures/generated.env'),true);
const baseURL=process.env.QA_BASE_URL||'http://127.0.0.1:3000';
export default defineConfig({
 testDir:'./qa/e2e',outputDir:'qa-results/artifacts',fullyParallel:false,forbidOnly:!!process.env.CI,retries:process.env.CI?1:0,workers:1,timeout:90_000,expect:{timeout:10_000},
 reporter:[['list'],['html',{outputFolder:'qa-results/html',open:'never'}],['junit',{outputFile:'qa-results/junit.xml'}],['json',{outputFile:'qa-results/playwright.json'}],['./qa/lib/bug-reporter.ts']],
 use:{baseURL,trace:'retain-on-failure',screenshot:'only-on-failure',video:'retain-on-failure',actionTimeout:15_000,navigationTimeout:45_000},
 projects:[
  {name:'chromium-desktop',testIgnore:/90-cross-browser-smoke\.spec\.ts/,use:{...devices['Desktop Chrome']}},
  {name:'firefox-smoke',testMatch:/90-cross-browser-smoke\.spec\.ts/,use:{...devices['Desktop Firefox']}},
  {name:'webkit-smoke',testMatch:/90-cross-browser-smoke\.spec\.ts/,use:{...devices['Desktop Safari']}}
 ],
 webServer:process.env.QA_EXTERNAL_SERVER==='true'?undefined:{command:'npm run dev',url:baseURL,reuseExistingServer:true,timeout:120_000}
});
