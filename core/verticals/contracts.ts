import type { FeatureCatalog } from "../features/contracts";

export type NetworkVerticalKind = "family" | "alumni";

export type VerticalCapabilityId =
  | "network.context"
  | "network.membership"
  | "network.construction"
  | "runtime.launch-control"
  | "runtime.guide"
  | "runtime.playground"
  | "runtime.whats-new"
  | "identity.claiming"
  | "identity.invitations"
  | "identity.privacy"
  | "contribution.governed"
  | "community.groups-events"
  | "notifications.digest"
  | "domain.kinship"
  | "domain.institutional-membership";

export type VerticalNetworkLabels = {
  entityLabel: string; entityLabelPlural: string; levelLabel: string; levelLabelPlural: string;
  parentLabel: string; childLabel: string; peerLabel: string;
};

export type VerticalDefinition = {
  kind: NetworkVerticalKind;
  displayName: string;
  iconToken: string;
  themeToken: string;
  capabilities: readonly VerticalCapabilityId[];
  featureCatalog: FeatureCatalog;
  legacyNetworkLabels: VerticalNetworkLabels;
  status: "active" | "skeleton";
};
