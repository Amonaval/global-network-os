import type {LifeEvent, Member, Memory, Relationship} from "./types";
import {findRelationshipPath, immediateFamilyForViewer, relationshipLabelToViewer} from "./relationship-intelligence";

export type FamilySignatureSpotlight = {
  member: Member;
  relationshipLabel: string;
  pathMemberIds: string[];
  distance: number;
};

export type FamilySignatureMoment = {
  kind: "special-day" | "memory" | "preserve" | "grow";
  member?: Member;
  memory?: Memory;
  eventLabel?: "birthday" | "anniversary";
  daysAway?: number;
  dateLabel?: string;
};

export type FamilySignatureModel = {
  viewer?: Member;
  spotlight?: FamilySignatureSpotlight;
  closest: {member: Member; label: string}[];
  moment?: FamilySignatureMoment;
};

function daySeed(now: Date) {
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

function nextOccurrence(raw: string, now: Date) {
  const normalized = raw.slice(0, 10);
  const parts = normalized.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return undefined;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let next = new Date(now.getFullYear(), parts[1] - 1, parts[2]);
  if (next < today) next = new Date(now.getFullYear() + 1, parts[1] - 1, parts[2]);
  return {next, days: Math.round((next.getTime() - today.getTime()) / 86400000)};
}

function chooseSpotlight(members: Member[], relationships: Relationship[], viewerId: string, seed: number): FamilySignatureSpotlight | undefined {
  const candidates = members
    .filter(member => member.id !== viewerId && member.profile_status !== "disabled")
    .map(member => {
      const path = findRelationshipPath(members, relationships, viewerId, member.id);
      if (!path) return null;
      const label = relationshipLabelToViewer(members, relationships, viewerId, member.id) || "Family relative";
      const richness = Number(Boolean(member.photo_url)) * 3 + Number(Boolean(member.bio)) * 2 + Number(Boolean(member.city)) + Number(Boolean(member.profession));
      const wider = path.distance >= 3 ? 6 : path.distance === 2 ? 2 : 0;
      const score = wider + richness + Math.min(path.distance, 4);
      return {member, relationshipLabel: label, pathMemberIds: path.memberIds, distance: path.distance, score};
    })
    .filter(Boolean) as (FamilySignatureSpotlight & {score: number})[];
  if (!candidates.length) return undefined;
  candidates.sort((a, b) => b.score - a.score || a.member.full_name.localeCompare(b.member.full_name));
  const topScore = candidates[0].score;
  const pool = candidates.filter(item => item.score >= topScore - 2).slice(0, 8);
  const chosen = pool[seed % pool.length];
  return {member: chosen.member, relationshipLabel: chosen.relationshipLabel, pathMemberIds: chosen.pathMemberIds, distance: chosen.distance};
}

function chooseMoment(members: Member[], events: LifeEvent[], memories: Memory[], spotlight: FamilySignatureSpotlight | undefined, now: Date): FamilySignatureMoment | undefined {
  const upcoming = [
    ...members.filter(m => !m.date_of_death && m.date_of_birth).flatMap(member => {
      const when = nextOccurrence(member.date_of_birth!, now);
      return when && when.days <= 45 ? [{member, eventLabel: "birthday" as const, ...when}] : [];
    }),
    ...events.filter(e => e.event_type === "marriage" && e.event_date).flatMap(event => {
      const member = members.find(m => m.id === event.member_id);
      const when = nextOccurrence(event.event_date!, now);
      return member && when && when.days <= 45 ? [{member, eventLabel: "anniversary" as const, ...when}] : [];
    }),
  ].sort((a, b) => a.days - b.days)[0];
  if (upcoming) return {kind: "special-day", member: upcoming.member, eventLabel: upcoming.eventLabel, daysAway: upcoming.days, dateLabel: upcoming.next.toISOString().slice(0, 10)};

  const latestMemory = memories.slice().sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))[0];
  if (latestMemory) return {kind: "memory", memory: latestMemory, member: latestMemory.member_id ? members.find(m => m.id === latestMemory.member_id) : undefined};

  const preserve = spotlight?.member && (!spotlight.member.bio || !spotlight.member.photo_url || !spotlight.member.city) ? spotlight.member : members.find(m => !m.bio || !m.photo_url || !m.city);
  if (preserve) return {kind: "preserve", member: preserve};
  if (members.length) return {kind: "grow", member: spotlight?.member};
  return undefined;
}

export function buildFamilySignatureModel(args: {
  members: Member[];
  relationships: Relationship[];
  events: LifeEvent[];
  memories: Memory[];
  viewerMemberId?: string;
  now?: Date;
}): FamilySignatureModel {
  const now = args.now || new Date();
  const viewer = args.viewerMemberId ? args.members.find(member => member.id === args.viewerMemberId) : undefined;
  if (!viewer) return {viewer: undefined, spotlight: undefined, closest: [], moment: chooseMoment(args.members, args.events, args.memories, undefined, now)};
  const spotlight = chooseSpotlight(args.members, args.relationships, viewer.id, daySeed(now));
  const closest = immediateFamilyForViewer(args.members, args.relationships, viewer.id).slice(0, 8);
  return {viewer, spotlight, closest, moment: chooseMoment(args.members, args.events, args.memories, spotlight, now)};
}
