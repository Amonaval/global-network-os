/**
 * Compatibility facade for the historical Family feature API.
 *
 * G1.2 keeps existing imports stable while the generic runtime lives under
 * core/features and the Family catalog lives under verticals/family/features.
 * New platform code should compose a vertical catalog through app-shell rather
 * than adding more Family-semantic keys to core runtime code.
 */
import { getVerticalFeatureCatalog } from "../app-shell/vertical-registry";
import type {
  EffectiveFeature as RuntimeEffectiveFeature,
  EffectiveFeatureMap as RuntimeEffectiveFeatureMap,
  FeatureDefinition as RuntimeFeatureDefinition,
  LaunchState as RuntimeLaunchState,
} from "../core/features/contracts";
import { createFeatureRuntime } from "../core/features/runtime";
import type {
  FamilyExperienceLevel,
  FamilyFeatureBundle,
  FamilyFeatureDefinition,
  FamilyFeatureKey,
} from "../verticals/family/features/catalog";

const FAMILY_CATALOG = getVerticalFeatureCatalog("family");
const FAMILY_RUNTIME = createFeatureRuntime(FAMILY_CATALOG);

export type ExperienceLevel = FamilyExperienceLevel;
export type LaunchState = RuntimeLaunchState;
export type FeatureBundle = FamilyFeatureBundle;
export type FeatureKey = FamilyFeatureKey;
export type FeatureDefinition = RuntimeFeatureDefinition<FeatureKey, FeatureBundle, ExperienceLevel>;

export const EXPERIENCE_RANK = FAMILY_CATALOG.experienceRank;
export const EXPERIENCE_LABELS = FAMILY_CATALOG.experienceLabels;
export const FEATURE_REGISTRY: FeatureDefinition[] = [...FAMILY_CATALOG.features] as FamilyFeatureDefinition[];
export const FEATURE_BY_KEY = FAMILY_RUNTIME.featureByKey;

export type EffectiveFeature = RuntimeEffectiveFeature<FeatureKey>;
export type EffectiveFeatureMap = RuntimeEffectiveFeatureMap<FeatureKey>;

export function defaultFeatureMap(localMode=false): EffectiveFeatureMap {
  return FAMILY_RUNTIME.defaultFeatureMap(localMode);
}

export function isFeatureAvailable(
  key: FeatureKey,
  features: EffectiveFeatureMap,
  experience: ExperienceLevel,
  canAdmin: boolean,
): boolean {
  return FAMILY_RUNTIME.isFeatureAvailable(key, features, experience, canAdmin);
}
