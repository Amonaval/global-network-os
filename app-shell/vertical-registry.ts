import type { NetworkVerticalKind } from "../core/verticals/contracts";
import { ALUMNI_VERTICAL } from "../verticals/alumni/definition";
import { FAMILY_VERTICAL } from "../verticals/family/definition";

const definitions = [FAMILY_VERTICAL, ALUMNI_VERTICAL] as const;
type RegisteredVerticalDefinition = typeof definitions[number];
type VerticalRegistry = {
  readonly [K in RegisteredVerticalDefinition["kind"]]: Extract<RegisteredVerticalDefinition, {kind: K}>;
};

function buildRegistry(items: typeof definitions): VerticalRegistry {
  const seen = new Set<NetworkVerticalKind>();
  for (const item of items) {
    if (seen.has(item.kind)) throw new Error(`Duplicate vertical registration: ${item.kind}`);
    seen.add(item.kind);
  }
  return Object.freeze(Object.fromEntries(items.map(item => [item.kind, item]))) as VerticalRegistry;
}

export const VERTICAL_REGISTRY = buildRegistry(definitions);
export const DEFAULT_VERTICAL_KIND: NetworkVerticalKind = "family";

export function getVerticalDefinition<K extends NetworkVerticalKind>(kind: K): VerticalRegistry[K] {
  return VERTICAL_REGISTRY[kind];
}

export function getVerticalFeatureCatalog<K extends NetworkVerticalKind>(kind: K): VerticalRegistry[K]["featureCatalog"] {
  return VERTICAL_REGISTRY[kind].featureCatalog as VerticalRegistry[K]["featureCatalog"];
}

export function isRegisteredVerticalKind(value: string | null | undefined): value is NetworkVerticalKind {
  return Boolean(value && value in VERTICAL_REGISTRY);
}
