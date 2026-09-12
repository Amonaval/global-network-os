# E7 — Elections, Nominations, Voting & Polls

## Outcome
TrustWeave now has a network-scoped governance ballot system for Family Community / Cultural Associations, Associations and Housing Societies. Formal elections and lightweight polls share the same lifecycle while keeping eligibility, participation identity and vote choice storage deliberately separated.

## Governance model
- Ballots are `draft → open → closed → published`.
- Voter eligibility is snapshotted when voting opens; later membership changes cannot silently rewrite the electorate.
- Supported electorates: all active members, administrators, or active Family Community representatives.
- One participation row per eligible user enforces one submission per ballot.
- A ballot may allow one or multiple choices.
- Election drafts can accept member nominations; administrators approve/reject nominations before opening the ballot.
- Approved nominations can become ballot options automatically.

## Secret ballot privacy
For a secret ballot, `network_ballot_participation` records that a user participated and issues a receipt ID, but `network_ballot_votes.voter_user_id` is `NULL`. Vote rows contain anonymous tokens and option IDs. Application administrators receive aggregate results, not a user-to-choice mapping. The audit event records ballot ID, number of choices and whether the ballot was secret; it does not record selected option IDs.

This design improves application-level secrecy while acknowledging that infrastructure-level database operators still require normal operational trust and access controls.

## Notifications
Opening a ballot creates a high-priority persisted notification for every snapshotted eligible voter. Publishing results notifies the same electorate. Notification deep links use the `elections` surface and land inside the relevant network.

## UX
The Elections & Voting surface shows participation, ballot state, privacy explanation, selectable choices, nomination review, administrator lifecycle actions and result bars after publication. Existing Community / Housing navigation and operational features remain intact; Elections & Voting is additive under More.

## Migration
`supabase/migrations/109_engagement_elections_voting.sql`

## Validation
Run `npm run validate:engage-e7`. It chains E7 through all E1–E6 engagement source gates.
