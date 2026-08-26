export type LaunchState = "hidden" | "test" | "pilot" | "released";

export type FeatureDefinition<
  TKey extends string = string,
  TBundle extends string = string,
  TExperience extends string = string,
> = {
  key: TKey;
  bundle: TBundle;
  label: string;
  description: string;
  minimumExperience: TExperience | "admin";
  defaultLaunch: LaunchState;
};

export type ExperienceLabel = { label: string; description: string };

export type FeatureCatalog<
  TKey extends string = string,
  TBundle extends string = string,
  TExperience extends string = string,
> = {
  catalogId: string;
  features: readonly FeatureDefinition<TKey, TBundle, TExperience>[];
  experienceRank: Readonly<Record<TExperience, number>>;
  experienceLabels: Readonly<Record<TExperience, ExperienceLabel>>;
};

export type EffectiveFeature<TKey extends string = string> = {
  key: TKey;
  rollout_state: LaunchState;
  enabled: boolean;
};

export type EffectiveFeatureMap<TKey extends string = string> = Partial<Record<TKey, EffectiveFeature<TKey>>>;
