import type { FeatureCatalog, FeatureDefinition } from "../../../core/features/contracts";

export type AlumniExperienceLevel = "member";
export type AlumniFeatureBundle = "core";

export const ALUMNI_FEATURES = [
  {key:"alumni.core.home",bundle:"core",label:"Alumni home",description:"Institution-focused starting point for the future Alumni vertical.",minimumExperience:"member",defaultLaunch:"hidden"},
  {key:"alumni.core.directory",bundle:"core",label:"Alumni directory",description:"Future directory across approved alumni membership records.",minimumExperience:"member",defaultLaunch:"hidden"},
] as const satisfies readonly FeatureDefinition<string, AlumniFeatureBundle, AlumniExperienceLevel>[];

export type AlumniFeatureKey = typeof ALUMNI_FEATURES[number]["key"];

export const ALUMNI_FEATURE_CATALOG: FeatureCatalog<AlumniFeatureKey, AlumniFeatureBundle, AlumniExperienceLevel> = {
  catalogId: "alumni",
  features: ALUMNI_FEATURES,
  experienceRank: {member: 1},
  experienceLabels: {member: {label:"Member", description:"Base alumni member experience."}},
};
