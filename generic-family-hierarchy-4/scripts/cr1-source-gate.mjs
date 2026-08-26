import fs from 'node:fs';

const files = {
  app: fs.readFileSync(new URL('../components/NetworkApp.tsx', import.meta.url), 'utf8'),
  tree: fs.readFileSync(new URL('../components/TreeView.tsx', import.meta.url), 'utf8'),
  profile: fs.readFileSync(new URL('../components/ProfileDrawer.tsx', import.meta.url), 'utf8'),
  relationship: fs.readFileSync(new URL('../components/RelationshipModal.tsx', import.meta.url), 'utf8'),
  intelligence: fs.readFileSync(new URL('../lib/relationship-intelligence.ts', import.meta.url), 'utf8'),
  css: fs.readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8'),
  migration: fs.readFileSync(new URL('../supabase/migrations/030_cr1_core_family_trust.sql', import.meta.url), 'utf8'),
};

const checks = [
  ['strict lineage helper exists', files.intelligence.includes('getStrictLineageIds')],
  ['strict lineage no sibling expansion', !files.intelligence.includes('parents(focusId).forEach')],
  ['simple Family navigation focuses current viewer', files.app.includes('setFocusId(viewerMemberId)') && files.app.includes('openFamilyView')],
  ['members cannot open relationship manager', files.app.includes('onManageRelationships={canAdmin && hasFeature("advanced.relationships")')],
  ['profile navigation has Back', files.profile.includes('Back to previous profile')],
  ['profile shows relationship to viewer', files.profile.includes('describeRelationshipToViewer')],
  ['mobile lineage alternative exists', files.tree.includes('mobile-lineage-view') && files.css.includes('.mobile-lineage-view')],
  ['You marker exists', files.tree.includes('tree-you-badge')],
  ['focused lineage is visually emphasized', files.tree.includes('compactLineage ? 3.4') && files.css.includes('.tree-node.focused')],
  ['co-admin UI protects parent relationships', files.relationship.includes('Protected · Family Owner only')],
  ['database protects parent-child deletion', files.migration.includes('Only the Family Owner can remove a parent-child relationship')],
  ['large text option exists', files.app.includes('family-large-text') && files.css.includes('.large-text')],
];

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failed++;
}
if (failed) {
  console.error(`CR1 source gate failed: ${failed} check(s).`);
  process.exit(1);
}
console.log(`CR1 source gate passed: ${checks.length}/${checks.length}.`);
