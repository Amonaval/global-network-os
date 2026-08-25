import type { VerticalDefinition } from "../../core/verticals/contracts";
import { FAMILY_FEATURE_CATALOG } from "./features/catalog";

export const FAMILY_VERTICAL = {
  kind: "family",
  displayName: "Family Network",
  iconToken: "tree",
  themeToken: "family-warm",
  status: "active",
  capabilities: [
    "network.context", "network.membership", "network.construction", "network.intelligence", "runtime.launch-control", "runtime.guide",
    "runtime.playground", "runtime.whats-new", "identity.claiming", "identity.invitations",
    "identity.privacy", "contribution.governed", "community.groups-events", "notifications.digest",
    "domain.kinship",
  ],
  featureCatalog: FAMILY_FEATURE_CATALOG,
  legacyNetworkLabels: {
    entityLabel: "Member", entityLabelPlural: "Members", levelLabel: "Generation",
    levelLabelPlural: "Generations", parentLabel: "Parent", childLabel: "Child", peerLabel: "Spouse",
  },
} satisfies VerticalDefinition;
