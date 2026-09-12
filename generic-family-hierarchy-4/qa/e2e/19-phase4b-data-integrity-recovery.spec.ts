import {test,expect} from '@playwright/test';
import fs from 'node:fs';import path from 'node:path';import * as XLSX from 'xlsx';
import {login} from '../lib/login';import {activate,authenticatedClient,seedState} from '../lib/role-client';
import {isNetworkBackup} from '../../core/export/contracts';
import {getImportSchema} from '../../core/import/registry';
import {createImportWorkbook} from '../../core/import/workbook';

const fatal=/application error|unhandled runtime error|internal server error/i;

async function openFamilyAdmin(page:any){await page.getByTestId('qa-nav-admin').click();await expect(page.getByTestId('qa-admin-center')).toBeVisible({timeout:20_000})}
async function openOrganizationAdmin(page:any){await page.getByTestId('qa-nav-admin').click();await expect(page.getByTestId('qa-guided-import-organization').first()).toBeVisible({timeout:20_000})}
async function expectImportReviewOrThrow(root:any){const review=root.getByTestId('qa-guided-import-review'),message=root.getByTestId('qa-guided-import-message');await expect.poll(async()=>await review.count()||await message.count(),{timeout:20_000,message:'guided import must produce review or an explicit read/parser error'}).toBeGreaterThan(0);if(await message.count())throw new Error(`Guided import read/parser error: ${await message.first().innerText()}`);await expect(review).toBeVisible();return review}

test.describe('Phase-4B data integrity, import/export and recovery certification',()=>{
  test('Family owner JSON and CSV downloads are readable portable snapshots of the seeded family',async({page},testInfo)=>{
    const s=seedState();await activate('owner',s.networks.family.id);await login(page,'owner');await openFamilyAdmin(page);await page.getByTestId('qa-admin-tab-export').click();
    const [jsonDl]=await Promise.all([page.waitForEvent('download'),page.getByTestId('qa-export-json').click()]);const jsonFile=path.join(testInfo.outputDir,'family-export.json');await jsonDl.saveAs(jsonFile);
    const payload=JSON.parse(fs.readFileSync(jsonFile,'utf8'));expect(payload.network?.network_id||payload.network?.id).toBe(s.networks.family.id);expect(Array.isArray(payload.members)).toBeTruthy();expect(Array.isArray(payload.relationships)).toBeTruthy();expect(JSON.stringify(payload)).toContain(s.networks.family.name);
    const [csvDl]=await Promise.all([page.waitForEvent('download'),page.getByTestId('qa-export-csv').click()]);const csvFile=path.join(testInfo.outputDir,'family-export.csv');await csvDl.saveAs(csvFile);const csv=fs.readFileSync(csvFile,'utf8');expect(csv).toContain('full_name');expect(csv).not.toContain('undefined');expect(csv.trim().split(/\r?\n/).length).toBeGreaterThanOrEqual(1);expect(page.locator('body')).not.toContainText(fatal);
  });

  test('Organization logical API backup satisfies backup contract and manifest-only media semantics',async({request})=>{
    const s=seedState();await activate('owner',s.networks.organization.id);const a=await authenticatedClient('owner');const r=await request.get(`/api/v1/networks/${s.networks.organization.id}/export`,{headers:{authorization:`Bearer ${a.token}`}});expect(r.status()).toBe(200);const body=await r.json();expect(body.ok).toBeTruthy();expect(isNetworkBackup(body.data)).toBeTruthy();expect(body.data.networkId).toBe(s.networks.organization.id);expect(body.data.media?.strategy).toBe('manifest');expect(body.data.media?.contentIncluded).toBe(false);const paths=Object.values(body.data.media?.buckets||{}).flat() as string[];expect(body.data.media?.objectCount).toBe(paths.length);expect(JSON.stringify(body.data)).not.toContain('data:image/');
  });

  test('malformed Organization workbook reaches review but commit remains blocked without data mutation',async({page},testInfo})=>{
    const s=seedState();await activate('owner',s.networks.organization.id);const a=await authenticatedClient('owner');const before=await a.client.rpc('get_network_affiliated_entities');expect(before.error).toBeNull();
    const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['Wrong Header'],['bad row']]),'People');const malformed=XLSX.write(wb,{type:'buffer',bookType:'xlsx'}) as Buffer;expect(malformed.length).toBeGreaterThan(100);
    await login(page,'owner');await openOrganizationAdmin(page);const root=page.getByTestId('qa-guided-import-organization').first();await expect(root).toBeVisible({timeout:20_000});await root.getByTestId('qa-guided-import-file').setInputFiles({name:'malformed-organization.xlsx',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:malformed});await expectImportReviewOrThrow(root);await expect(root.getByTestId('qa-guided-import-commit')).toBeDisabled();await expect(root.locator('.issue-row.error').first()).toBeVisible();
    const after=await a.client.rpc('get_network_affiliated_entities');expect(after.error).toBeNull();expect((after.data||[]).length).toBe((before.data||[]).length);expect(page.locator('body')).not.toContainText(fatal);
  });

  test('valid Organization workbook review is client-staged only: reload clears review and leaves governed data unchanged',async({page},testInfo})=>{
    const s=seedState();await activate('owner',s.networks.organization.id);const a=await authenticatedClient('owner');const before=await a.client.rpc('get_network_affiliated_entities');expect(before.error).toBeNull();
    const file=XLSX.write(createImportWorkbook(getImportSchema('organization')),{type:'buffer',bookType:'xlsx'}) as Buffer;expect(file.length).toBeGreaterThan(500);await login(page,'owner');await openOrganizationAdmin(page);const root=page.getByTestId('qa-guided-import-organization').first();await expect(root).toBeVisible({timeout:20_000});await root.getByTestId('qa-guided-import-file').setInputFiles({name:'organization-valid.xlsx',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:file});await expectImportReviewOrThrow(root);await expect(root.getByTestId('qa-guided-import-commit')).toBeEnabled();
    await page.reload({waitUntil:'commit'});await expect(page.getByTestId('qa-vertical-shell-organization')).toBeVisible({timeout:20_000});await openOrganizationAdmin(page);const recovered=page.getByTestId('qa-guided-import-organization').first();await expect(recovered.getByTestId('qa-guided-import-review')).toHaveCount(0);
    const after=await a.client.rpc('get_network_affiliated_entities');expect(after.error).toBeNull();expect((after.data||[]).length).toBe((before.data||[]).length);expect(page.locator('body')).not.toContainText(fatal);
  });
});
