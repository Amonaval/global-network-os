# TrustWeave — CTO Product Capability Book

**As of:** 2026-09-12  
**Purpose:** engineering/product leadership summary of what the platform can do, what is shared, what is vertical-specific, and what is still gated.

## 1. Product identity

1. TrustWeave is a multi-vertical **Network OS** for private, governed real-world networks.
2. The platform evolved from a Family network application into reusable network infrastructure.
3. A user can participate in multiple independent networks.
4. Each network remains permissioned and context-specific.
5. The system deliberately avoids a universal public social graph.
6. Cross-network interoperability is explicit, governed and consent-aware.
7. The product supports both consumer/community and institutional network types.
8. Current showcase emphasis is Family, Family Community / Cultural Association and Residential / Housing Society.
9. Additional supported verticals remain in the codebase even when hidden from public Create/Playground through Launch Control.
10. Existing memberships are never supposed to disappear because a vertical is hidden from new creation.

## 2. Shared platform architecture

11. Next.js application shell with shared cross-vertical runtime composition.
12. Supabase/Postgres persistence, Auth and private Storage foundations.
13. Typed vertical registry and capability composition.
14. Shared network model with network identifiers and memberships.
15. Shared active-network context.
16. Shared user identity anchor with network-local profiles/entities preserved.
17. Reusable feature/capability registry rather than copying full products per vertical.
18. Vertical-specific vocabulary and semantics remain explicit.
19. Core architecture follows **shared primitives + domain modules + vertical composition**.
20. Compatibility facades preserve older Family flows while shared contracts evolve.
21. Application-owned API/runtime boundaries exist for selected production operations.
22. Health/readiness/runtime hardening foundations exist from Mission 4/5.
23. Duplicate/expensive command protection and bounded abuse controls were introduced in the production-runtime track.
24. Existing architecture favors additive migrations and backward compatibility.
25. Network deletion/lifecycle safety is treated as a governed operation, not a blind table delete.

## 3. Identity, membership and access

26. Authenticated accounts can belong to multiple networks.
27. Network membership has status and role semantics.
28. Owner/Admin/Member style roles are supported.
29. Active-network switching is first-class.
30. My Networks provides a cross-vertical membership home.
31. Invitations support network-scoped joining.
32. Claiming flows map a signed-in person to the appropriate network-local profile/entity.
33. Family and generic network creation are supported.
34. Creation approval can be auto-approved or manually governed at platform level.
35. Platform owners can inspect a network registry and approval status.
36. Creation finalization verifies profile, membership and active-network consistency.
37. Approved network creation should navigate directly into the newly created network.
38. Pending approval preserves the user’s previous active-network context.
39. Membership visibility is not tied to public showcase availability.
40. Role administration is network-scoped.

## 4. Privacy and authorization

41. Network isolation is a core invariant.
42. Read/write checks are network-scoped.
43. Private media uses signed access rather than permanent public URLs.
44. Public/anonymous experiences intentionally expose reduced, privacy-masked data.
45. Notifications re-check membership when read/opened.
46. Deep links do not confer access.
47. Complaint media has stricter authorization than ordinary community/event media.
48. Cross-network/federation features do not imply child-graph disclosure.
49. Trusted bridges are explicit and revocable.
50. Multi-hop discovery requires policy on every traversed bridge.
51. Introduction/consent flows were designed to prevent silent cross-network exposure.
52. Destructive actions are protected more heavily in Playground/showcase contexts.
53. Platform QA includes role/permission/destructive-safety phases.
54. Security remediation Phase 5A–5C exists as a separate track and has been intentionally paused/revisited selectively rather than conflated with showcase work.

## 5. Family product

55. Family people and relationship graph.
56. Generations and family-tree visualizations.
57. Person profiles with privacy-aware fields.
58. Search/directory/filtering.
59. Kinship/path interpretation.
60. Ancestor/descendant exploration.
61. Life events and family history.
62. Memories and media.
63. Birthdays/anniversaries/special-day experiences.
64. Family timeline and preservation-oriented history.
65. Family participation/contribution workflows.
66. Invitations, claiming and corrections.
67. Family admin center.
68. Family storage/quota controls.
69. Guided workbook/import flows.
70. Multi-family switching.
71. Family Home and simplified/explore-oriented presentation modes.
72. Living Family / return-loop experiments.
73. Family Time Machine / legacy presentation.
74. Growth Relay for distributed contribution.
75. Connection & Belonging relationship/path experiences.
76. Responsive and multilingual experience foundations.
77. Family remains the deepest long-running product-quality proving ground.

## 6. Family Community / Cultural Association

78. Dedicated `family-association` vertical distinct from a generic association template.
79. Household/family is a key membership unit.
80. Representative, spouse and children/dependents remain first-class people.
81. Representative can change over time.
82. Household relationships are preserved.
83. Family-grade person profiles are reused.
84. Member-family directory.
85. Professional profile fields.
86. Annual membership cycles.
87. Renewal status/history.
88. Chapter/location context.
89. Committee/designation roles.
90. Co-admin concepts.
91. Events and RSVP.
92. Birthdays and celebrations.
93. Announcements.
94. Community history/timeline.
95. Community memories/media.
96. Finance/membership concepts exist and E6 is intended to deepen pool funds/event collections.
97. MPF Pune East is the flagship proving configuration.
98. MPF President-first flagship dashboard exists.
99. The Home emphasizes what needs attention, upcoming events, membership health and community activity.
100. Advanced capabilities remain progressively disclosed rather than deleted.

## 7. Residential / Housing Society

101. First-class `housing-society` vertical.
102. Structural model: Society → Building/Tower → Wing → Floor → Unit/Flat → Household → People.
103. Unit/Flat is the principal operating object.
104. Owner/co-owner/tenant/occupant history.
105. My Flat / resident association.
106. Vehicles and parking.
107. Notices.
108. Complaints.
109. Vendor/contract operations.
110. Amenities and bookings.
111. Maintenance charge heads and cycles.
112. Bills and immutable bill lines.
113. Dues, payments, receipts and adjustments.
114. Arrears/funds/budget-vs-actual visibility.
115. Committee terms.
116. Meetings, minutes, decisions and action items.
117. Visitor/staff operations.
118. Move/renovation approvals.
119. Asset service history.
120. Compliance due dates.
121. Emergency contacts.
122. Chairman-first flagship dashboard summarizes operational attention.
123. Dashboard cards deep-link to the existing certified modules instead of duplicating them.
124. Complaint category→resolver routing is implemented through E4.
125. Complaint photos are private and compressed.
126. Complaint creation/update/comment notifications form an end-to-end operational loop.
127. Elections/secret ballots are intentionally separated into E7 rather than folded casually into HS governance.

## 8. Other supported verticals

128. Alumni network vertical.
129. Professional / Trusted Expertise vertical.
130. Organizational Intelligence vertical.
131. Business Trust vertical.
132. Franchise vertical.
133. Generic Association / Community foundations.
134. These verticals remain implemented even if normal showcase Create/Playground hides them.
135. Productized verticals reuse shared navigation, activity, guide, admin and runtime composition.
136. Vertical semantics are kept distinct rather than relabeling Family concepts incorrectly.

## 9. Federation and network-of-networks

137. Trusted identity / multi-network reach foundations.
138. Explicit network-to-network trust bridges.
139. Federation / umbrella concepts.
140. Network Passport.
141. Governed network↔umbrella affiliation.
142. Umbrella network runtime.
143. Federated directory/discovery concepts.
144. Community application/purpose scopes.
145. Trusted request routing.
146. Governed introduction/consent.
147. Outcome/trust receipt concepts.
148. Multi-hop trusted paths with traversal controls.
149. Federation is a distribution and interoperability layer, not a permission bypass.
150. Person↔network and network↔umbrella are modeled as separate many-to-many axes.

## 10. Launch Control and rollout governance

151. Platform-owner Launch Control exists.
152. Create visibility can be controlled per vertical.
153. Playground visibility can be controlled per vertical.
154. Featured state can be controlled.
155. Vertical brand palette can be controlled.
156. Existing vertical implementation stays intact when hidden from public discovery.
157. Network Registry & Approvals is separated from Showcase settings.
158. Auto-approve/manual-approval policy exists.
159. Network registry can group/filter by vertical.
160. Feature rollout/governance concepts are separated from showcase discoverability.
161. Platform-owner governance remains a privileged surface.

## 11. Playground and showcase system

162. Deterministic Playground experiences exist.
163. Playground is designed as “explore what yours could look like,” not a technical sandbox.
164. Family showcase data demonstrates people, generations, memories and history.
165. Community showcase data demonstrates households, membership, committee, events and celebrations.
166. Residential showcase data demonstrates units, complaints, notices, amenities, visitors, finance and governance.
167. Playground return behavior is explicitly handled.
168. Showcase visibility is decoupled from existing membership access.
169. S2/S3 first-impression and navigation work simplified entry paths.
170. Flow-repair missions restored original membership/network-selection behavior where showcase redesign had overreached.
171. Showcase stabilization added loaders, mobile-safe CTAs, close/back behavior and demo-certification hooks.

## 12. User experience system

172. Responsive desktop/mobile layouts.
173. Mobile bottom navigation with progressive “More” disclosure.
174. Role-aware navigation.
175. Humanized terminology preferred over graph/platform jargon.
176. Five Appearance themes: Light, Warm, Modern, Aurora and Dark.
177. Separate vertical/network brand palette concept.
178. Hindi/Marathi/English localization foundation and high-visibility coverage.
179. Contextual help/Guide patterns.
180. Quick Start / activation concepts.
181. Empty/error/loading states are treated as product-quality requirements.
182. Sign-in modal has explicit close/backdrop/Escape behavior.
183. My Networks transition loaders and network-switch feedback exist.
184. Notification drawer now uses a body-level portal to avoid shell z-index collisions.
185. Mobile notification drawer uses a tall bottom-sheet layout.

## 13. Activity, engagement and notifications

186. Cross-vertical activity feed/hub foundations.
187. Persisted in-app notification inbox.
188. Cross-network unread count.
189. Notification priority.
190. Actor/entity metadata.
191. Network/surface/item deep links.
192. Mark-read / mark-all-read.
193. Web Push subscription foundation.
194. Service worker notification display.
195. Push notification click opens the relevant TrustWeave destination.
196. Push opt-in is explicit.
197. Expired push subscriptions are cleaned up.
198. Quiet-hour/timezone preference foundation exists.
199. Role mentions such as `@President` and `@Chairman`.
200. Named-member mentions.
201. Responsibility roles are network-scoped.
202. Activity posts can trigger routed mention notifications.
203. Notification and push infrastructure is designed for reuse by dues, events, elections and other future workflows.

## 14. Media and storage

204. Private Supabase media buckets.
205. Signed URL hydration.
206. Client-side resizing/compression.
207. WebP re-encoding.
208. Re-encoding strips EXIF/camera metadata from the uploaded derivative.
209. Media presets exist for profile, memory, event, announcement and complaint use cases.
210. Main image plus lightweight thumbnail generation.
211. Shared `network_media_assets` metadata registry introduced in E5.
212. Media can be bound to domain entities/activities.
213. Family profile and memory flows use the shared media direction.
214. Productized member profiles use shared media.
215. Productized activities can carry media.
216. Alumni activities use the shared media path.
217. Residential complaint media remains stricter than ordinary member-readable media.
218. Network storage accounting/quota foundations are reused.
219. E8 is reserved for archive/quota/cleanup lifecycle rather than ad-hoc deletion.

## 15. Import, export and recovery

220. CSV/Excel import foundations.
221. Guided family workbook import.
222. Housing mapped CSV/Excel onboarding foundations.
223. Shared backup/export/recovery work exists from XP-5.
224. Versioned logical network backup concepts exist.
225. Storage paths can be included as recovery manifests without treating private media as public exports.
226. Import/export flows are subject to network permissions.

## 16. QA and release discipline

227. Unit/source gates exist for major mission contracts.
228. Playwright E2E/crawl suites exist for anonymous, owner, admin and member journeys.
229. Cross-vertical capability/regression matrices exist.
230. Phase 2 representative capability certification was completed.
231. Phase 4A runtime robustness/recovery was completed.
232. Phase 4B data integrity/import/export/recovery was completed.
233. Phase 4C governance/permissions/destructive safety was completed.
234. Phase 4D vertical business rules was completed.
235. Phase 5A security/RPC work was started and later intentionally paused during showcase work.
236. Source-gate success is not automatically called runtime certification.
237. Free-tier Supabase constraints are explicitly considered in QA design.
238. Headed Playwright has historically been more reliable than headless in the project environment.
239. Documentation closure is now a formal mission requirement.

## 17. Intelligence foundations

240. Deterministic Network Intelligence experiments exist.
241. Evidence/confidence and missing-link/health ideas were explored.
242. Organization knowledge bootstrap was explored.
243. Graph-aware RAG integration was explored.
244. Intelligence was intentionally decoupled from the core Network OS.
245. RAG/Ollama is not a mandatory runtime dependency.
246. Further intelligence expansion is evidence-gated until repeated real usage justifies it.

## 18. Current boundary and next program

247. E1–E5 engagement foundations are the latest implemented sequence.
248. E6 is planned for Community membership funds, pooled funds and event collections.
249. E7 is planned for elections, nominations, polls and voting integrity/audit.
250. E8 is planned for media archive, quota visibility, selective deletion and cleanup management.
251. E6–E8 should reuse the E1–E5 notification/media foundations rather than introduce parallel systems.
252. Real-world MPF/community and Residential usage should drive the next product decisions.
253. No major new vertical should be prioritized ahead of engagement/pilot proof unless strategy changes explicitly.
