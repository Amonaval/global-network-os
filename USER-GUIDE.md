# Our Family — User Guide

Our Family is a private place to explore your family tree, find relatives,
preserve relationships and gradually complete the family story. Choose English,
Hindi or Marathi from the language selector; names remain in the script in which
your family enters them.

## Create your family

1. Give the family a familiar name.
2. Choose to start with a few relatives, explore a sample, or use Family Excel.
3. If using Excel, download the guided workbook before editing your own file.
4. Upload and review the people and relationships found.
5. Correct any clearly explained issues, then choose **Add to family**.

## 1. What you see first
The demo dataset contains **150 synthetic members across 6 generations**. It intentionally includes siblings, spouses, branches, multiple cities and deceased members so the features can be tested without real personal data.

## 2. Family Hierarchy
- **Family Hierarchy** opens the visual relationship graph.
- Solid connectors = parent/child lineage.
- Dashed connectors = spouse relationship.
- Use mouse wheel / trackpad to zoom and drag the canvas to pan.
- `+ / -` controls change zoom; the mini-map helps navigate larger trees.
- Click any person to open their profile.
- Search dims non-matching people.

### Lineage Focus
1. Click a member.
2. Choose **View in Family Tree** or **Focus Lineage**.
3. The app isolates the connected branch: parents, children, siblings and spouses that are reachable through recorded relationships.
4. **Show Full Tree** returns to the entire network.

This is intentionally a network view rather than a simple top-down org chart because real families contain marriages and sibling branches.

## 3. Member Directory
Search and filter by:
- Name
- Profession
- City/location

Use **View Profile** for details or **Focus Lineage** to jump back to the relationship graph.

## 4. Member Profile
A profile can show:
- Name and generation
- Profession
- City/country
- Date of birth
- About/bio
- Phone and email depending on visibility mode
- Recorded family connections

Click a connected person to navigate directly to their profile.

## 5. Privacy Preview
The top-right selector is a **preview of the intended privacy model**:
- **Public**: phone/email are hidden.
- **Member**: contact details can be shown to authenticated members.
- **Admin**: intended for administrators.

Important: the current local demo is client-side. Real production privacy must be enforced in Supabase RLS/API, not only by hiding fields in the UI.

## 6. Location Map
Open **Location Map** from the left navigation.

Each member with latitude/longitude appears on the map. In the sample data, city coordinates are provided for Pune, Mumbai, Jalgaon, Nashik, Bengaluru, Delhi, London and Dubai.

Click a marker to see the member name, profession and city, then use **View profile**.

The map is useful for questions such as:
- How many members are in Pune?
- Who lives outside India?
- Where are community clusters?

The map is not a precise home-address map. For privacy, production should normally store city/region coordinates rather than residential addresses.

## 7. In-Memoriam
A member is treated as deceased when `date_of_death` is present.

In the hierarchy their node is visually subdued/grayscale and shows the death year. Their profile retains the recorded birth/death information.

This is a **presentation feature**, not a separate person type. A deceased person can still be an ancestor, spouse or parent in the same relationship network.

The sample includes several deceased members specifically to make this visible during testing.

## 8. Submit Profile
A member can submit a profile without directly editing the master record. The submission enters the pending queue.

The intended production workflow is:
`Member submits → Admin reviews → Approve/Reject → Master profile updated`

## 9. Administration
Administration currently provides:
- Member count
- Relationship count
- Pending profile count
- Location count
- CSV/XLSX import
- CSV export
- JSON export
- Demo reset
- Pending submission approval/rejection

## 10. Family Excel

Supported input: XLSX, XLS and CSV.

The recommended workbook is downloaded inside the Family Excel assistant. It has:

- **Family Members:** `person_id, full_name, gender, date_of_birth,
  living_status, generation, city, profession, phone, email,
  short_introduction`.
- **Relationships:** `person_id, related_person_id, relationship, note`.
- **Read Me First:** step-by-step instructions and a realistic example.
- **Example Family — Do Not Import:** a separate worked example; the two entry
  sheets remain blank to prevent accidental sample imports.

Use simple IDs such as P001 only to connect rows. Never enter Aadhaar, PAN or
another sensitive identity number. Relationship values are Parent, Child and
Spouse. Siblings are understood through shared parents. Leave information blank
when it is not known; do not guess.

The app previews the file and checks duplicate people, missing references,
impossible loops and inconsistent generations before anything is added.

## 11. Export / Backup
- **CSV** exports member/profile data.
- **JSON** exports both members and relationships and is the better structural backup.

## 12. Sample hierarchy
The included 150-member dataset is intentionally synthetic and contains:
- 6 generations
- 150 people
- parent/child relationships
- sibling branches created by shared parents
- spouse relationships
- a few cross-branch marriages
- deceased ancestors
- multiple Indian and international locations
- varied professions

Use this dataset to test the app before importing real family data.

## 13. Recommended next production features
Before adding AI/analytics/PDF features, prioritize:
1. Stable relationship editor (add/edit/remove parent, child, spouse, sibling).
2. Duplicate detection and merge.
3. Relationship validation and orphan detection.
4. Authenticated member/admin roles with real RLS.
5. Approval workflow for profile and relationship changes.
6. Audit history.
7. Better large-tree layout/performance.
8. City-level map clustering.

## Account help

### Forgot your password
1. Open **Join or sign in**.
2. Choose **Forgot password?**.
3. Enter the email used for your family account.
4. Open the private reset link sent to that email.
5. Choose and confirm a new password.
6. Continue to your family.

If an account was just created but email confirmation is required, the signup screen explains this and can resend the confirmation email.

Family Owner/Admin access and Platform Launch Control are different. A family administrator manages only their family. Launch Control is available only to separately trusted platform-owner accounts.

---

# Alpha Quick Start — getting into a family

After you sign in, Family Network first checks whether you already belong to a family.

If you do, your family opens automatically.

If you do not, choose one of these:

### Join my family
Use the short **Family Code** shared by your family administrator. This gives you normal member access so you can explore the family. It does not claim another person's profile.

If the family already contains an unclaimed profile using your **verified sign-in email**, the app may show the matching name and family. Choose **This is me** to connect it.

A private personal invitation link remains the best option when the administrator wants you to claim one exact family profile.

### Explore a sample family
Choose **Explore a sample family** when you only want to understand the app first. The sample is read-only. Your Supabase account stays signed in, but sample data is not saved into your real family.

Use **Join or create mine** when you are ready to leave the sample.

### Create my family
For the current invite-only Alpha, Platform Launch Control can allow instant creation without waiting for approval.

Recommended starting methods:
1. **Upload guided Excel** — best when you already have a family list.
2. **Start with a few relatives** — create the family immediately and add parents, spouse, children and close relatives one by one.

The Excel assistant provides a downloadable template and checks the people/relationships before import.

## For Family Admins — easiest way to invite relatives
Open **Manage family → Invitations / Invite Family**.

For quick Alpha exploration, share the **Family Code** in your trusted WhatsApp group. You can regenerate it if it spreads beyond the intended group.

For exact profile ownership, create a **personal invitation link** for the specific member instead.

## Quick navigation
- **Home** — what matters now and a shortcut to your family.
- **Family** — your personal lineage first on mobile; use Full Tree only when needed.
- **Me** — your own profile and information.
- **Help** — open Quick Start instructions at any time.
