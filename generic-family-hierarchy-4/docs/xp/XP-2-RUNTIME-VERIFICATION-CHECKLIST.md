# XP-2 Runtime Verification Checklist

For each released vertical (Family, Alumni, Housing Society, Family Association, Association, Organization, Business Trust, Franchise, Professional):
- switch English → Hindi → Marathi without reload;
- navigate Home, Directory/Explorer, Community, Admin and Guide;
- verify no visible token keys or blank labels;
- verify modals, placeholders, destructive confirmations and validation messages change language;
- verify dynamic user/network/entity values are not translated;
- perform native-speaker review for long-form Hindi/Marathi domain copy;
- run `npm run audit:i18n` and `npm run validate:xp2`.
