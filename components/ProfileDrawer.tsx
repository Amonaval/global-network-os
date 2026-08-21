"use client";

import {
  X,
  MapPin,
  Briefcase,
  Calendar,
  GitBranch,
  ArrowRight,
  Link2,
} from "lucide-react";
import { LifeEvent, Member, Relationship, Memory } from "../lib/types";
import { getNetworkConfig, NetworkSettings } from "../lib/network";
import { useLanguage } from "../lib/i18n";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((x) => x[0])
    .join("")
    .toUpperCase();
}
function friendlyDate(value?: string, language: "en" | "hi" | "mr" = "en") {
  if (!value) return "Not added yet";
  const locale = language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : "en-IN";
  return new Date(`${value}T00:00:00`).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
}

export default function ProfileDrawer({
  member,
  members,
  relationships,
  visibility,
  events,
  memories,
  network,
  onClose,
  onSelect,
  onFocus,
  canEdit,
  canViewPrivateContact,
  onManageRelationships,
  onEdit,
  onExploreRelationship,
  onAddEvent,
  onEditEvent,
}: {
  member: Member;
  members: Member[];
  relationships: Relationship[];
  visibility: "public" | "member" | "admin";
  events?: LifeEvent[];
  memories?: Memory[];
  network?: NetworkSettings | null;
  onClose: () => void;
  onSelect: (m: Member) => void;
  onFocus: (m: Member) => void;
  canEdit?: boolean;
  canViewPrivateContact?: boolean;
  onManageRelationships?: () => void;
  onEdit?: () => void;
  onExploreRelationship?: () => void;
  onAddEvent?: () => void;
  onEditEvent?: (e: LifeEvent) => void;
}) {
  const { t, language } = useLanguage();
  const copy = language === "hi" ? { phone:"फ़ोन", email:"ईमेल", about:"परिचय", addEvent:"घटना जोड़ें", noMilestones:"अभी कोई जीवन घटना साझा नहीं की गई।", noMemories:"अभी कोई याद साझा नहीं की गई।", noRelations:"अभी कोई रिश्ता दर्ज नहीं है।", member:"सदस्य", undated:"तारीख नहीं", edit:"बदलें" } : language === "mr" ? { phone:"फोन", email:"ईमेल", about:"परिचय", addEvent:"घटना जोडा", noMilestones:"अजून कोणतीही जीवन घटना सामायिक केलेली नाही.", noMemories:"अजून कोणतीही आठवण सामायिक केलेली नाही.", noRelations:"अजून कोणतेही नाते नोंदवलेले नाही.", member:"सदस्य", undated:"तारीख नाही", edit:"बदला" } : { phone:"Phone", email:"Email", about:"About", addEvent:"Add event", noMilestones:"No milestones have been shared yet.", noMemories:"No memories have been shared yet.", noRelations:"No relationships recorded.", member:"Member", undated:"Undated", edit:"Edit" };
  const cfg = getNetworkConfig(network ?? null);
  const related = relationships
    .filter(
      (r) => r.person_id === member.id || r.related_person_id === member.id,
    )
    .map((r) => {
      const otherId =
        r.person_id === member.id ? r.related_person_id : r.person_id;
      const other = members.find((m) => m.id === otherId);
      if (!other) return null;
      const type =
        r.relationship_type === "parent"
          ? r.person_id === member.id
            ? cfg.child_label
            : cfg.parent_label
          : r.relationship_type === "child"
            ? r.person_id === member.id
              ? cfg.parent_label
              : cfg.child_label
            : cfg.peer_label;
      return { other, type };
    })
    .filter(Boolean) as { other: Member; type: string }[];

  return (
    <div
      className="profile-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={member.full_name}>
        <div className="drawer-head">
          <strong>
            {cfg.network_template === "family"
              ? t("familyProfile")
              : `${cfg.entity_label} Profile`}
          </strong>
        <button className="btn small" aria-label="Close profile" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="profile-hero">
          <div className="avatar lg">
            {member.photo_url ? (
              <img
                src={member.photo_url}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              initials(member.full_name)
            )}
          </div>
          <div>
            <h2 style={{ margin: "0 0 5px", fontSize: 22 }}>
              {member.full_name}
            </h2>
            <div className="person-meta">
              {cfg.level_label} {member.generation_level}
            </div>
          </div>
        </div>
        <div className="detail-grid">
          <div className="detail">
            <div className="detail-label">
              <Briefcase size={12} style={{ verticalAlign: "middle" }} />{" "}
              {t("profession")}
            </div>
            <div className="detail-value">{member.profession || "—"}</div>
          </div>
          <div className="detail">
            <div className="detail-label">
              <MapPin size={12} style={{ verticalAlign: "middle" }} /> {t("location")}
            </div>
            <div className="detail-value">
              {[member.city, member.country].filter(Boolean).join(", ") || "—"}
            </div>
          </div>
          <div className="detail">
            <div className="detail-label">
              <GitBranch size={12} style={{ verticalAlign: "middle" }} />{" "}
              {t("generation")}
            </div>
            <div className="detail-value">{member.generation_level}</div>
          </div>
          <div className="detail">
            <div className="detail-label">
              <Calendar size={12} style={{ verticalAlign: "middle" }} /> {t("birthday")}
            </div>
            <div className="detail-value">{member.date_of_birth ? friendlyDate(member.date_of_birth, language) : t("notAdded")}</div>
          </div>
        </div>
        {canViewPrivateContact && (
          <div className="detail-grid">
            <div className="detail">
              <div className="detail-label">{copy.phone}</div>
              <div className="detail-value">{member.phone || "—"}</div>
            </div>
            <div className="detail">
              <div className="detail-label">{copy.email}</div>
              <div className="detail-value">{member.email || "—"}</div>
            </div>
          </div>
        )}
        {!canViewPrivateContact && (
          <div className="privacy-note">
            {t("privateContact")}
          </div>
        )}
        {canViewPrivateContact &&
          member.contact_visibility === "admin" &&
          !member.phone &&
          !member.email && (
            <div className="privacy-note">
              This member has chosen to keep contact details visible only to
              administrators.
            </div>
          )}
        {member.profile_visibility === "admin" && !member.bio && (
          <div className="privacy-note">
            Some profile details are visible only to administrators.
          </div>
        )}
        {member.bio && (
          <>
            <h3 style={{ fontSize: 14 }}>{copy.about}</h3>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: "#596579" }}>
              {member.bio}
            </p>
          </>
        )}
        <div className="profile-section-head">
          <h3 style={{ fontSize: 14, marginTop: 20, marginBottom: 0 }}>
            {t("lifeJourney")}
          </h3>
          {canEdit && onAddEvent && (
            <button className="btn small" onClick={onAddEvent}>
              + {copy.addEvent}
            </button>
          )}
        </div>
        <div className="timeline-list">
          {(!events || events.length === 0) && (
            <div className="empty compact">{copy.noMilestones}</div>
          )}
          {(events || [])
            .slice()
            .sort((a, b) =>
              (a.event_date || "9999").localeCompare(b.event_date || "9999"),
            )
            .map((e) => (
              <div className="timeline-item" key={e.id}>
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <div className="timeline-date">
                    {e.event_date || copy.undated} · {e.event_type}
                  </div>
                  <div className="timeline-title">{e.title}</div>
                  {e.location && (
                    <div className="person-meta">{e.location}</div>
                  )}
                  {e.description && (
                    <div className="timeline-description">{e.description}</div>
                  )}
                  {canEdit && onEditEvent && (
                    <button className="btn tiny" onClick={() => onEditEvent(e)}>
                      {copy.edit}
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
        <h3 style={{ fontSize: 14, marginTop: 20 }}>{t("memories")}</h3>
        <div className="profile-memory-list">
          {(!memories || memories.length === 0) && (
            <div className="empty compact">{copy.noMemories}</div>
          )}
          {(memories || []).slice(0, 6).map((m) => (
            <div className="profile-memory" key={m.id}>
              {m.photo_url && <img src={m.photo_url} alt="" />}
              <div>
                <b>{m.title}</b>
                {m.story && <p>{m.story}</p>}
                <span>{new Date(m.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
        <h3 style={{ fontSize: 14, marginTop: 20 }}>{t("familyConnections")}</h3>
        <div className="rel-list">
          {related.length === 0 && (
            <div className="empty">{copy.noRelations}</div>
          )}
          {related.map(({ other, type }) => (
            <div className="rel-row" key={other.id}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>
                  {other.full_name}
                </div>
                <div className="person-meta">
                  {type} · {other.profession || copy.member}
                </div>
              </div>
              <button className="btn small" onClick={() => onSelect(other)}>
                <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="form-actions">
          <button className="btn primary" onClick={() => onFocus(member)}>
            <GitBranch size={15} /> {t("viewInTree")}
          </button>
          {onExploreRelationship && (
            <button className="btn" onClick={onExploreRelationship}>
              {t("howRelated")}
            </button>
          )}
          {canEdit && onEdit && (
            <button className="btn" onClick={onEdit}>
              {t("editProfile")}
            </button>
          )}
          {canEdit && onManageRelationships && (
            <button className="btn" onClick={onManageRelationships}>
              <Link2 size={15} /> {t("manageRelationships")}
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
