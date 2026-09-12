import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const sql=read('supabase/migrations/109_engagement_elections_voting.sql');
const ui=read('components/shared/NetworkVotingPanel.tsx');
const app=read('components/TemplateNetworkApp.tsx');
const fca=read('verticals/family-association/runtime/composition.ts');
const hs=read('verticals/housing-society/runtime/composition.ts');
const remote=read('capabilities/participation/voting-remote.ts');
const checks=[
 ['six governance tables', ['network_ballots','network_ballot_options','network_ballot_nominations','network_ballot_eligibility','network_ballot_participation','network_ballot_votes'].every(x=>sql.includes(`public.${x}`))],
 ['RLS on governance tables', (sql.match(/enable row level security/g)||[]).length>=6],
 ['direct table access revoked', sql.includes('revoke all on public.network_ballots')&&sql.includes('network_ballot_votes from anon,authenticated')],
 ['eligibility snapshot', sql.includes('network_ballot_eligibility')&&sql.includes("eligibility_mode='members'")&&sql.includes("eligibility_mode='admins'")],
 ['family representative eligibility', sql.includes("family_representative")&&sql.includes('family_association_family_memberships')],
 ['participation separate from vote choices', sql.includes('network_ballot_participation')&&sql.includes('network_ballot_votes')],
 ['secret choices omit voter id', sql.includes('case when b.secret_ballot then null else auth.uid() end')],
 ['one vote enforced', sql.includes('primary key(ballot_id,user_id)')&&sql.includes('already been recorded')],
 ['audit omits choice identifiers', sql.includes("'network_ballot_vote_cast'")&&!/network_ballot_vote_cast[^;]{0,500}option_id/s.test(sql)],
 ['aggregate result counts only', sql.includes("select count(*) from public.network_ballot_votes v where v.option_id=o.id")],
 ['notification deep links elections', sql.includes("'elections','ballot'")],
 ['member nominations can see draft election', sql.includes("b.allow_nominations and b.ballot_type='election'")],
 ['remote contract', remote.includes('castNetworkBallotVote')&&remote.includes('publishNetworkBallotResults')],
 ['voting UI', ui.includes('qa-network-voting-panel')&&ui.includes('E7SecretBallotHelpTxt')],
 ['app route wired', app.includes('NetworkVotingPanel')&&app.includes('"elections"')],
 ['association navigation', fca.includes('electionsSurface')&&fca.includes('"elections"')],
 ['housing navigation', hs.includes('electionsSurface')&&hs.includes('"elections"')],
 ['no capability deletion sentinel', app.includes('NetworkFundsPanel')&&hs.includes('maintenanceSurface')&&fca.includes('fundsSurface')],
];
let fail=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} E7 ${name}`);if(!ok)fail++}console.log(`E7 ${checks.length-fail}/${checks.length} PASS`);if(fail)process.exit(1);
