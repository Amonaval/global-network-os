import type { VerticalDefinition } from "../../core/verticals/contracts";
import { ALUMNI_FEATURE_CATALOG } from "./features/catalog";

export const ALUMNI_VERTICAL = {
  kind: "alumni",
  displayName: "Alumni Network",
  iconToken: "graduation-cap",
  themeToken: "alumni-institutional",
  status: "skeleton",
  capabilities: [
    "network.context", "network.membership", "network.construction", "runtime.launch-control", "runtime.guide",
    "runtime.playground", "runtime.whats-new", "identity.claiming", "identity.invitations",
    "identity.privacy", "contribution.governed", "community.groups-events", "notifications.digest",
    "domain.institutional-membership",
  ],
  featureCatalog: ALUMNI_FEATURE_CATALOG,
  navigation: () => [],
  legacyNetworkLabels: {
    entityLabel: "Alumni", entityLabelPlural: "Alumni", levelLabel: "Batch Year",
    levelLabelPlural: "Batch Years", parentLabel: "Senior", childLabel: "Junior", peerLabel: "Classmate",
  },
} satisfies VerticalDefinition;
