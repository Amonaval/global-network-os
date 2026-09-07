import type { NetworkVerticalKind } from "../core/verticals/contracts";
import type { NetworkMembershipRole } from "../core/network/contracts";
import { DEFAULT_VERTICAL_KIND, isRegisteredVerticalKind } from "../app-shell/vertical-registry";

export type NetworkSettings = {
  id: string;
  network_id?: string;
  slug?: string;
  membership_role?: NetworkMembershipRole;
  name: string;
  description?: string;
  initialized_at?: string;
  updated_at?: string;
  entity_label: string;
  entity_label_plural: string;
  level_label: string;
  level_label_plural: string;
  parent_label: string;
  child_label: string;
  peer_label: string;
  network_template: string;
  /** Typed runtime identity; optional until an additive persistence migration is justified. */
  vertical_kind?: NetworkVerticalKind;
  self_edit_mode?: "review" | "safe_fields_direct";
  family_milestones_enabled?: boolean;
  photo_upload_enabled?: boolean;
};

export function resolveNetworkVerticalKind(network: Pick<NetworkSettings, "vertical_kind" | "network_template"> | null): NetworkVerticalKind {
  if (isRegisteredVerticalKind(network?.vertical_kind)) return network.vertical_kind;
  if (network?.network_template === "alumni") return "alumni";
  return DEFAULT_VERTICAL_KIND;
}

export function getNetworkConfig(network: NetworkSettings | null) {
  return {
    entity_label: network?.entity_label ?? "Member",
    entity_label_plural: network?.entity_label_plural ?? "Members",
    level_label: network?.level_label ?? "Generation",
    level_label_plural: network?.level_label_plural ?? "Generations",
    parent_label: network?.parent_label ?? "Parent",
    child_label: network?.child_label ?? "Child",
    peer_label: network?.peer_label ?? "Spouse",
    network_template: network?.network_template ?? "family",
    vertical_kind: resolveNetworkVerticalKind(network),
    self_edit_mode: network?.self_edit_mode ?? "review",
    family_milestones_enabled: network?.family_milestones_enabled ?? true,
    photo_upload_enabled: network?.photo_upload_enabled ?? false,
  };
}

export const NETWORK_TEMPLATES = [
  {
    id: "family",
    name: "Family Tree",
    description: "Track generations, marriages, and family history",
    entity_label: "Member",
    entity_label_plural: "Members",
    level_label: "Generation",
    level_label_plural: "Generations",
    parent_label: "Parent",
    child_label: "Child",
    peer_label: "Spouse",
  },
  {
    id: "family-association",
    name: "Family Community / Cultural Association",
    description: "Family-grade cultural/community chapter with annual family membership, full people profiles, events, committees and history",
    entity_label: "Family",
    entity_label_plural: "Families",
    level_label: "Membership Year",
    level_label_plural: "Membership Years",
    parent_label: "Representative",
    child_label: "Family Member",
    peer_label: "Community Member",
  },
  {
    id: "housing-society",
    name: "Residential Community / Housing Society",
    description: "Flats/units, residents, households and recurring society operations",
    entity_label: "Flat / Unit",
    entity_label_plural: "Flats / Units",
    level_label: "Floor",
    level_label_plural: "Floors",
    parent_label: "Owner",
    child_label: "Resident",
    peer_label: "Neighbour",
  },
  {
    id: "association",
    name: "Community / Association",
    description: "Household/member associations with events, RSVP, memories, committees and annual renewal",
    entity_label: "Family / Household",
    entity_label_plural: "Families / Households",
    level_label: "Membership",
    level_label_plural: "Memberships",
    parent_label: "Representative",
    child_label: "Member",
    peer_label: "Community peer",
  },
  {
    id: "organization",
    name: "Organizational Intelligence",
    description: "Matrix organization, teams, projects, expertise and ownership",
    entity_label: "Employee",
    entity_label_plural: "Employees",
    level_label: "Seniority",
    level_label_plural: "Levels",
    parent_label: "Manager",
    child_label: "Direct Report",
    peer_label: "Co-founder",
  },
  {
    id: "alumni",
    name: "Alumni Network",
    description: "School or university alumni by batch and year",
    entity_label: "Alumni",
    entity_label_plural: "Alumni",
    level_label: "Batch Year",
    level_label_plural: "Batch Years",
    parent_label: "Senior",
    child_label: "Junior",
    peer_label: "Classmate",
  },
  {
    id: "business-trust",
    name: "Business Trust Network",
    description: "Trusted businesses, suppliers, service providers and relationship paths",
    entity_label: "Business", entity_label_plural: "Businesses", level_label: "Category", level_label_plural: "Categories", parent_label: "Recommender", child_label: "Recommended", peer_label: "Partner",
  },
  {
    id: "franchise",
    name: "Franchise Network",
    description: "Regions, cities, locations, owners and operational communities",
    entity_label: "Location", entity_label_plural: "Locations", level_label: "Region", level_label_plural: "Regions", parent_label: "Owner", child_label: "Location", peer_label: "Peer location",
  },
  {
    id: "professional",
    name: "Trusted Expertise Network",
    description: "Professional expertise, trusted referrals, collaboration and reusable case knowledge",
    entity_label: "Professional", entity_label_plural: "Professionals", level_label: "Expertise", level_label_plural: "Expertise areas", parent_label: "Referrer", child_label: "Referred professional", peer_label: "Collaborator",
  },
  {
    id: "academic",
    name: "Academic Lineage",
    description: "PhD advisor–student trees and research lab hierarchies",
    entity_label: "Researcher",
    entity_label_plural: "Researchers",
    level_label: "Career Stage",
    level_label_plural: "Stages",
    parent_label: "Advisor",
    child_label: "Student",
    peer_label: "Collaborator",
  },
  {
    id: "corporate",
    name: "Corporate Ownership",
    description: "Subsidiaries, parent companies, and board relationships",
    entity_label: "Company",
    entity_label_plural: "Companies",
    level_label: "Tier",
    level_label_plural: "Tiers",
    parent_label: "Parent Company",
    child_label: "Subsidiary",
    peer_label: "Partner",
  },
  {
    id: "skills",
    name: "Skill Tree",
    description: "Technology prerequisites and learning path dependencies",
    entity_label: "Skill",
    entity_label_plural: "Skills",
    level_label: "Difficulty",
    level_label_plural: "Levels",
    parent_label: "Prerequisite of",
    child_label: "Required for",
    peer_label: "Related",
  },
];

export const DEFAULT_NETWORK_NAME = "My Hierarchy Network";

export function loadLocalNetwork(): NetworkSettings | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("hierarchy-network-settings-v1");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLocalNetwork(
  settings: Omit<NetworkSettings, "id" | "initialized_at" | "updated_at">,
): NetworkSettings {
  const value: NetworkSettings = {
    id: "local-network",
    name: settings.name.trim() || DEFAULT_NETWORK_NAME,
    description: settings.description || "",
    entity_label: settings.entity_label ?? "Member",
    entity_label_plural: settings.entity_label_plural ?? "Members",
    level_label: settings.level_label ?? "Generation",
    level_label_plural: settings.level_label_plural ?? "Generations",
    parent_label: settings.parent_label ?? "Parent",
    child_label: settings.child_label ?? "Child",
    peer_label: settings.peer_label ?? "Spouse",
    network_template: settings.network_template ?? "family",
    vertical_kind: settings.vertical_kind ?? resolveNetworkVerticalKind(settings),
    self_edit_mode: settings.self_edit_mode ?? "review",
    family_milestones_enabled: settings.family_milestones_enabled ?? true,
    photo_upload_enabled: settings.photo_upload_enabled ?? false,
    initialized_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  localStorage.setItem("hierarchy-network-settings-v1", JSON.stringify(value));
  return value;
}
