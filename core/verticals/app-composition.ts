import type { NetworkVerticalKind, VerticalCapabilityId } from "./contracts";

export type AppLocale = "en" | "hi" | "mr";
export type LocalizedLabel = Readonly<{ en: string; hi: string; mr: string }>;

export type VerticalSurfaceDescriptor = Readonly<{
  viewId: string;
  featureKey?: string;
  capability?: VerticalCapabilityId;
  iconToken: string;
  label: LocalizedLabel;
  minimumExperience?: string;
  adminOnly?: boolean;
}>;

export type VerticalGuideComposition = Readonly<{
  registryId: string;
  guideByView: Readonly<Record<string, string>>;
  actionToView: Readonly<Record<string, string>>;
  playgroundViewIds: readonly string[];
  launchControlGuideKey?: string;
}>;

export type VerticalPlaygroundComposition = Readonly<{
  enabled: boolean;
  preferredViewerIdentityId?: string;
  startView: string;
  publicNetworkSettings?: Readonly<Record<string, string>>;
  setupNetworkSettings?: Readonly<Record<string, string>>;
}>;

export type VerticalLaunchBundleDescriptor = Readonly<{
  key: string;
  label: string;
  description: string;
}>;

export type VerticalLaunchComposition = Readonly<{
  bundles: readonly VerticalLaunchBundleDescriptor[];
  playgroundExcludedBundles: readonly string[];
  playgroundTitle: string;
  playgroundDescription: string;
  playgroundRecommendation: string;
  dayOneTitle: string;
  dayOneDescription: string;
  pilotTargetsTitle: string;
  pilotTargetsDescription: string;
  footnoteTitle: string;
  footnoteDescription: string;
}>;

export type VerticalWhatsNewComposition = Readonly<{
  featureToView: Readonly<Record<string, string>>;
  defaultView: string;
  kicker: string;
  fallbackTitle: string;
  fallbackDescription: string;
}>;

export type VerticalAppComposition = Readonly<{
  kind: NetworkVerticalKind;
  renderStatus: "active" | "skeleton";
  featureCatalogId: string;
  primaryNavigation: readonly VerticalSurfaceDescriptor[];
  mobileMoreNavigation: readonly VerticalSurfaceDescriptor[];
  mobileBottomViewIds: readonly string[];
  mobileMoreActiveViewIds: readonly string[];
  guide: VerticalGuideComposition;
  playground: VerticalPlaygroundComposition;
  launch: VerticalLaunchComposition;
  whatsNew: VerticalWhatsNewComposition;
}>;
