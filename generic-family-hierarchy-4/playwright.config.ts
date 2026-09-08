import {defineConfig,devices} from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

function loadEnv(file:string){if(!fs.existsSync(file))return;for(const raw of fs.readFileSync(file,'utf8').split(/\r?\n/)){const line=raw.trim();if(!line||line.startsWith('#'))continue;const i=line.indexOf('=');if(i<1)continue;const k=line.slice(0,i).trim(),v=line.slice(i+1).trim();if(process.env[k]===undefined)process.env[k]=v}}
loadEnv(path.resolve('.env.qa'));
const baseURL=process.env.QA_BASE_URL||'http://127.0.0.1:3000';

export default defineConfig({
  testDir:'./qa/e2e',
  outputDir:'qa-results/artifacts',
  fullyParallel:false,
  forbidOnly:!!process.env.CI,
  retries:process.env.CI?1:0,
  workers:1,
  timeout:60_000,
  expect:{timeout:10_000},
  reporter:[['list'],['html',{outputFolder:'qa-results/html',open:'never'}],['junit',{outputFile:'qa-results/junit.xml'}],['./qa/lib/bug-reporter.ts']],
  use:{baseURL,trace:'retain-on-failure',screenshot:'only-on-failure',video:'retain-on-failure',actionTimeout:15_000,navigationTimeout:30_000},
  projects:[{name:'chromium-desktop',use:{...devices['Desktop Chrome']}}],
  webServer:process.env.QA_EXTERNAL_SERVER==='true'?undefined:{command:'npm run dev',url:baseURL,reuseExistingServer:true,timeout:120_000}
});
