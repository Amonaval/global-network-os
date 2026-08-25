import type { NetworkVerticalKind, VerticalDefinition } from "../core/verticals/contracts";
import { ALUMNI_VERTICAL } from "../verticals/alumni/definition";
import { FAMILY_VERTICAL } from "../verticals/family/definition";

const definitions = [FAMILY_VERTICAL, ALUMNI_VERTICAL] as const;
function buildRegistry(items: readonly VerticalDefinition[]): Readonly<Record<NetworkVerticalKind, VerticalDefinition>> {
  const seen = new Set<NetworkVerticalKind>();
  for (const item of items) {
    if (seen.has(item.kind)) throw new Error(`Duplicate vertical registration: ${item.kind}`);
    seen.add(item.kind);
  }
  return Object.freeze(Object.fromEntries(items.map(item => [item.kind, item])) as Record<NetworkVerticalKind, VerticalDefinition>);
}
export const VERTICAL_REGISTRY = buildRegistry(definitions);
export const DEFAULT_VERTICAL_KIND: NetworkVerticalKind = "family";
export function getVerticalDefinition(kind: NetworkVerticalKind): VerticalDefinition { return VERTICAL_REGISTRY[kind]; }
export function isRegisteredVerticalKind(value: string | null | undefined): value is NetworkVerticalKind {
  return Boolean(value && value in VERTICAL_REGISTRY);
}
