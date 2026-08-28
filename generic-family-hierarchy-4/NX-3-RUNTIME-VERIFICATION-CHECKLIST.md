# NX-3 Runtime Verification Checklist

Use this at the next milestone verification window; do not regression-test the entire app.

## Family Time Machine
- [ ] Open Family Home with a realistic multi-generation dataset.
- [ ] Time Machine shows eras with real years and no invented narrative.
- [ ] Switching eras updates the chapter without layout jumps/overflow.
- [ ] Clicking a person/event opens the expected profile/tree destination.
- [ ] Sparse data shows the honest empty-state rather than fake history.

## Generational legacy
- [ ] `What could be forgotten?` lists believable preservation opportunities.
- [ ] Missing photo/story/place/birthday labels match the selected member.
- [ ] Opening the priority member works.
- [ ] Generation coverage does not overlap or stretch on desktop/mobile.
- [ ] Playground remains read-only and no cross-network data appears.

## Regression
- [ ] NX-2 Living Family still renders above NX-3.
- [ ] Memories, Participation, Tree and Profile still open normally.
- [ ] Family Home works at desktop, tablet and phone width.
- [ ] `npm run build` passes in the normal development environment.
