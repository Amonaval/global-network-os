import type { VerticalDefinition } from "../../core/verticals/contracts";

export const FAMILY_VERTICAL: VerticalDefinition = {
  kind: "family",
  displayName: "Family Network",
  iconToken: "tree",
  themeToken: "family-warm",
  status: "active",
  capabilities: [
    "network.context", "network.membership", "runtime.launch-control", "runtime.guide",
    "runtime.playground", "runtime.whats-new", "identity.claiming", "identity.invitations",
    "identity.privacy", "contribution.governed", "community.groups-events", "notifications.digest",
    "domain.kinship",
  ],
  navigation: () => [
    { id: "home", label: "Home" },
    { id: "tree", label: "Family", capability: "domain.kinship" },
    { id: "directory", label: "Find family" },
    { id: "guide", label: "Explore & Guide", capability: "runtime.guide" },
  ],
  legacyNetworkLabels: {
    entityLabel: "Member", entityLabelPlural: "Members", levelLabel: "Generation",
    levelLabelPlural: "Generations", parentLabel: "Parent", childLabel: "Child", peerLabel: "Spouse",
  },
};
