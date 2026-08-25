import type { FeatureCatalog } from "../features/contracts";

export type NetworkVerticalKind = "family" | "alumni" | "organization" | "business-trust" | "franchise";

export type VerticalCapabilityId =
  | "network.context"
  | "network.membership"
  | "network.construction"
  | "network.affiliation"
  | "network.activity"
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
  | "domain.institutional-membership"
  | "domain.organizational-intelligence"
  | "domain.business-trust"
  | "domain.franchise-operations";

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
