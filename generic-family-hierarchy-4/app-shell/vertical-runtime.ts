import type { AppLocale, VerticalAppComposition, VerticalSurfaceDescriptor } from "../core/verticals/app-composition";
import type { NetworkVerticalKind } from "../core/verticals/contracts";
import { ALUMNI_APP_COMPOSITION } from "../verticals/alumni/runtime/composition";
import { FAMILY_APP_COMPOSITION } from "../verticals/family/runtime/composition";
import { ASSOCIATION_APP_COMPOSITION } from "../verticals/association/runtime/composition";
import { FAMILY_ASSOCIATION_APP_COMPOSITION } from "../verticals/family-association/runtime/composition";
import { ORGANIZATION_APP_COMPOSITION } from "../verticals/organization/runtime/composition";
import { BUSINESS_TRUST_APP_COMPOSITION } from "../verticals/business-trust/runtime/composition";
import { FRANCHISE_APP_COMPOSITION } from "../verticals/franchise/runtime/composition";
import { PROFESSIONAL_APP_COMPOSITION } from "../verticals/professional/runtime/composition";
import { HOUSING_SOCIETY_APP_COMPOSITION } from "../verticals/housing-society/runtime/composition";
import { getVerticalDefinition } from "./vertical-registry";
import { getVerticalCapabilityRuntime } from "./vertical-capabilities";

const appCompositions = {
  family: FAMILY_APP_COMPOSITION,
  alumni: ALUMNI_APP_COMPOSITION,
  association: ASSOCIATION_APP_COMPOSITION,
  "family-association": FAMILY_ASSOCIATION_APP_COMPOSITION,
  "housing-society": HOUSING_SOCIETY_APP_COMPOSITION,
  organization: ORGANIZATION_APP_COMPOSITION,
  "business-trust": BUSINESS_TRUST_APP_COMPOSITION,
  franchise: FRANCHISE_APP_COMPOSITION,
  professional: PROFESSIONAL_APP_COMPOSITION,
} as const satisfies Record<NetworkVerticalKind, VerticalAppComposition>;

function assertComposition(kind: NetworkVerticalKind, app: VerticalAppComposition) {
  const definition = getVerticalDefinition(kind);
  if (app.kind !== kind) throw new Error(`Vertical app composition kind mismatch: ${kind}`);
  if (app.featureCatalogId !== definition.featureCatalog.catalogId) throw new Error(`Vertical feature catalog mismatch: ${kind}`);
  if (app.renderStatus !== definition.status) throw new Error(`Vertical render status mismatch: ${kind}`);
  const featureKeys = new Set<string>(definition.featureCatalog.features.map(item => item.key));
  const capabilityIds = new Set<string>(definition.capabilities);
  for (const surface of [...app.primaryNavigation, ...app.mobileMoreNavigation]) {
    if (surface.featureKey && !featureKeys.has(surface.featureKey)) throw new Error(`Unknown ${kind} surface feature: ${surface.featureKey}`);
    if (surface.capability && !capabilityIds.has(surface.capability)) throw new Error(`Unknown ${kind} surface capability: ${surface.capability}`);
  }
}

for (const kind of Object.keys(appCompositions) as NetworkVerticalKind[]) assertComposition(kind, appCompositions[kind]);

export type VerticalRuntimeDefinition = Readonly<{
  kind: NetworkVerticalKind;
  definition: ReturnType<typeof getVerticalDefinition>;
  capabilities: ReturnType<typeof getVerticalCapabilityRuntime>;
  app: VerticalAppComposition;
}>;

export function getVerticalAppComposition<K extends NetworkVerticalKind>(kind: K): (typeof appCompositions)[K] {
  return appCompositions[kind];
}

export function getVerticalRuntimeDefinition(kind: NetworkVerticalKind): VerticalRuntimeDefinition {
  return {kind, definition:getVerticalDefinition(kind), capabilities:getVerticalCapabilityRuntime(kind), app:appCompositions[kind]};
}

/** Skeleton verticals fail closed. They never inherit Family-only surfaces merely because Family is the default product. */
export function getRenderableVerticalRuntime(kind: NetworkVerticalKind): VerticalRuntimeDefinition {
  const requested = getVerticalRuntimeDefinition(kind);
  if(requested.app.renderStatus!=="active") throw new Error(`Vertical ${kind} is not user-visible yet.`);
  return requested;
}

export function localizedSurfaceLabel(surface: VerticalSurfaceDescriptor, locale: AppLocale): string {
  return surface.label[locale] || surface.label.en;
}
