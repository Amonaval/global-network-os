import type { EffectiveFeatureMap, FeatureCatalog, FeatureDefinition } from "./contracts";

export function createFeatureIndex<
  TKey extends string,
  TBundle extends string,
  TExperience extends string,
>(features: readonly FeatureDefinition<TKey, TBundle, TExperience>[]): Record<TKey, FeatureDefinition<TKey, TBundle, TExperience>> {
  return Object.fromEntries(features.map(feature => [feature.key, feature])) as Record<TKey, FeatureDefinition<TKey, TBundle, TExperience>>;
}

export function defaultFeatureMapForCatalog<
  TKey extends string,
  TBundle extends string,
  TExperience extends string,
>(catalog: FeatureCatalog<TKey, TBundle, TExperience>, localMode = false): EffectiveFeatureMap<TKey> {
  return Object.fromEntries(catalog.features.map(feature => [feature.key, {
    key: feature.key,
    rollout_state: localMode ? "released" : feature.defaultLaunch,
    enabled: localMode || feature.defaultLaunch === "released",
  }])) as EffectiveFeatureMap<TKey>;
}

export function isFeatureAvailableForCatalog<
  TKey extends string,
  TBundle extends string,
  TExperience extends string,
>(
  catalog: FeatureCatalog<TKey, TBundle, TExperience>,
  featureByKey: Record<TKey, FeatureDefinition<TKey, TBundle, TExperience>>,
  key: TKey,
  features: EffectiveFeatureMap<TKey>,
  experience: TExperience,
  canAdmin: boolean,
): boolean {
  const definition = featureByKey[key];
  if (!definition) throw new Error(`Unknown feature key: ${key}`);
  const effective = features[key];
  const launchEnabled = effective?.enabled ?? definition.defaultLaunch === "released";
  if (!launchEnabled) return false;
  if (definition.minimumExperience === "admin") return canAdmin;
  return catalog.experienceRank[experience] >= catalog.experienceRank[definition.minimumExperience];
}

export function createFeatureRuntime<
  TKey extends string,
  TBundle extends string,
  TExperience extends string,
>(catalog: FeatureCatalog<TKey, TBundle, TExperience>) {
  const featureByKey = createFeatureIndex(catalog.features);
  return Object.freeze({
    featureByKey,
    defaultFeatureMap: (localMode = false) => defaultFeatureMapForCatalog(catalog, localMode),
    isFeatureAvailable: (
      key: TKey,
      features: EffectiveFeatureMap<TKey>,
      experience: TExperience,
      canAdmin: boolean,
    ) => isFeatureAvailableForCatalog(catalog, featureByKey, key, features, experience, canAdmin),
  });
}
