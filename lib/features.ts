export type ExperienceLevel = "simple" | "connected" | "explorer";
export type LaunchState = "hidden" | "test" | "pilot" | "released";
export type FeatureBundle = "core" | "remember" | "celebrate" | "connect" | "contribute" | "share" | "admin";

export type FeatureKey =
  | "core.home"
  | "core.family"
  | "core.directory"
  | "core.profile"
  | "remember.memories"
  | "remember.history"
  | "celebrate.special_days"
  | "connect.places"
  | "connect.community"
  | "connect.gatherings"
  | "contribute.help_family"
  | "share.family"
  | "share.public_profiles"
  | "share.print_qr"
  | "advanced.relationships"
  | "admin.center"
  | "admin.import"
  | "admin.governance";

export type FeatureDefinition = {
  key: FeatureKey;
  bundle: FeatureBundle;
  label: string;
  description: string;
  minimumExperience: ExperienceLevel | "admin";
  defaultLaunch: LaunchState;
};

export const EXPERIENCE_RANK: Record<ExperienceLevel, number> = {
  simple: 1,
  connected: 2,
  explorer: 3,
};

export const EXPERIENCE_LABELS: Record<ExperienceLevel, {label:string; description:string}> = {
  simple: {label:"Simple", description:"Home, family and your own profile."},
  connected: {label:"Connected", description:"Adds memories and family moments."},
  explorer: {label:"Explorer", description:"Adds history, places and ways to help the family."},
};

export const FEATURE_REGISTRY: FeatureDefinition[] = [
  {key:"core.home",bundle:"core",label:"Family home",description:"A calm return screen for the family.",minimumExperience:"simple",defaultLaunch:"released"},
  {key:"core.family",bundle:"core",label:"Family tree",description:"Explore relatives and family branches.",minimumExperience:"simple",defaultLaunch:"released"},
  {key:"core.directory",bundle:"core",label:"Find family",description:"Search the family by name, city or profession.",minimumExperience:"simple",defaultLaunch:"released"},
  {key:"core.profile",bundle:"core",label:"My profile",description:"View or improve your own family profile.",minimumExperience:"simple",defaultLaunch:"released"},
  {key:"remember.memories",bundle:"remember",label:"Family memories",description:"Photos and stories shared by relatives.",minimumExperience:"connected",defaultLaunch:"test"},
  {key:"remember.history",bundle:"remember",label:"Family history",description:"Life events and family timeline.",minimumExperience:"explorer",defaultLaunch:"test"},
  {key:"celebrate.special_days",bundle:"celebrate",label:"Special days",description:"Birthdays, anniversaries and On This Day.",minimumExperience:"simple",defaultLaunch:"released"},
  {key:"connect.places",bundle:"connect",label:"Family places",description:"Privacy-safe city-level family map.",minimumExperience:"explorer",defaultLaunch:"test"},
  {key:"connect.community",bundle:"connect",label:"Family community",description:"Community discovery and family connection tools.",minimumExperience:"explorer",defaultLaunch:"test"},
  {key:"connect.gatherings",bundle:"connect",label:"Gatherings",description:"Family events, attendance and follow-up memories.",minimumExperience:"connected",defaultLaunch:"test"},
  {key:"contribute.help_family",bundle:"contribute",label:"Help improve our family",description:"Invitations, missing information and contribution prompts.",minimumExperience:"explorer",defaultLaunch:"test"},
  {key:"share.family",bundle:"share",label:"Share with family",description:"Privacy-safe WhatsApp/native sharing.",minimumExperience:"connected",defaultLaunch:"test"},
  {key:"share.public_profiles",bundle:"share",label:"Public family cards",description:"Optional public profile and directory sharing.",minimumExperience:"explorer",defaultLaunch:"test"},
  {key:"share.print_qr",bundle:"share",label:"Print & QR",description:"Printable cards, directories and QR access.",minimumExperience:"explorer",defaultLaunch:"test"},
  {key:"advanced.relationships",bundle:"connect",label:"Relationship explorer",description:"Advanced family relationship and lineage exploration.",minimumExperience:"explorer",defaultLaunch:"test"},
  {key:"admin.center",bundle:"admin",label:"Manage family",description:"Family settings and day-to-day administration.",minimumExperience:"admin",defaultLaunch:"released"},
  {key:"admin.import",bundle:"admin",label:"Import family",description:"Guided bulk family import and validation.",minimumExperience:"admin",defaultLaunch:"released"},
  {key:"admin.governance",bundle:"admin",label:"Approvals & history",description:"Governed approvals, audit history and diagnostics.",minimumExperience:"admin",defaultLaunch:"released"},
];

export const FEATURE_BY_KEY = Object.fromEntries(FEATURE_REGISTRY.map(feature => [feature.key, feature])) as Record<FeatureKey, FeatureDefinition>;

export type EffectiveFeature = {key:FeatureKey; rollout_state:LaunchState; enabled:boolean};
export type EffectiveFeatureMap = Partial<Record<FeatureKey, EffectiveFeature>>;

export function defaultFeatureMap(localMode=false): EffectiveFeatureMap {
  return Object.fromEntries(FEATURE_REGISTRY.map(feature => [feature.key, {
    key: feature.key,
    rollout_state: localMode ? "released" : feature.defaultLaunch,
    enabled: localMode || feature.defaultLaunch === "released",
  }])) as EffectiveFeatureMap;
}

export function isFeatureAvailable(
  key: FeatureKey,
  features: EffectiveFeatureMap,
  experience: ExperienceLevel,
  canAdmin: boolean,
): boolean {
  const definition = FEATURE_BY_KEY[key];
  const effective = features[key];
  const launchEnabled = effective?.enabled ?? definition.defaultLaunch === "released";
  if (!launchEnabled) return false;
  if (definition.minimumExperience === "admin") return canAdmin;
  return EXPERIENCE_RANK[experience] >= EXPERIENCE_RANK[definition.minimumExperience];
}
