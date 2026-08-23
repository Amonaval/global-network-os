"use client";

import {
  X,
  MapPin,
  Briefcase,
  Calendar,
  GitBranch,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Link2, ExternalLink,
} from "lucide-react";
import {IdentityAvatar,safeExternalUrl} from "../lib/identity";
import { LifeEvent, Member, Relationship, Memory } from "../lib/types";
import { getNetworkConfig, NetworkSettings } from "../lib/network";
import { describeRelationshipToViewer, relationshipLabelToViewer } from "../lib/relationship-intelligence";
import { useLanguage } from "../lib/i18n";
import FeatureGuide from "./FeatureGuide";
import {GUIDE_ENTRIES} from "../lib/user-guide-content";

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
  viewerMemberId,
  simple = false,
  onClose,
  onBack,
  onSelect,
  onFocus,
  canEdit,
  canViewPrivateContact,
  onManageRelationships,
  onEdit,
  onExploreRelationship,
  onReportCorrection,
  onAddEvent,
  onEditEvent,
  onOpenGuide,
}: {
  member: Member;
  members: Member[];
  relationships: Relationship[];
  visibility: "public" | "member" | "admin";
  events?: LifeEvent[];
  memories?: Memory[];
  network?: NetworkSettings | null;
  viewerMemberId?: string;
  simple?: boolean;
  onClose: () => void;
  onBack?: () => void;
  onSelect: (m: Member) => void;
  onFocus: (m: Member) => void;
  canEdit?: boolean;
  canViewPrivateContact?: boolean;
  onManageRelationships?: () => void;
  onEdit?: () => void;
  onExploreRelationship?: () => void;
  onReportCorrection?: () => void;
  onAddEvent?: () => void;
  onEditEvent?: (e: LifeEvent) => void;
  onOpenGuide?: (key:string) => void;
}) {
  const { t, language } = useLanguage();
  const copy = language === "hi" ? { phone:"फ़ोन", email:"ईमेल", about:"परिचय", addEvent:"घटना जोड़ें", noMilestones:"अभी कोई जीवन घटना साझा नहीं की गई।", noMemories:"अभी कोई याद साझा नहीं की गई।", noRelations:"अभी कोई रिश्ता दर्ज नहीं है।", member:"सदस्य", undated:"तारीख नहीं", edit:"बदलें" } : language === "mr" ? { phone:"फोन", email:"ईमेल", about:"परिचय", addEvent:"घटना जोडा", noMilestones:"अजून कोणतीही जीवन घटना सामायिक केलेली नाही.", noMemories:"अजून कोणतीही आठवण सामायिक केलेली नाही.", noRelations:"अजून कोणतेही नाते नोंदवलेले नाही.", member:"सदस्य", undated:"तारीख नाही", edit:"बदला" } : { phone:"Phone", email:"Email", about:"About", addEvent:"Add event", noMilestones:"No milestones have been shared yet.", noMemories:"No memories have been shared yet.", noRelations:"No relationships recorded.", member:"Member", undated:"Undated", edit:"Edit" };
  const cfg = getNetworkConfig(network ?? null);
  const visibilityRank = { public: 0, member: 1, admin: 2 } as const;
  const previewRank = visibilityRank[visibility];
  const visibleAtPreview = (required?: "public" | "member" | "admin" | null) => previewRank >= visibilityRank[required || "member"];
  const showProfileDetails = visibleAtPreview(member.profile_visibility || "member");
  const showContactDetails = canViewPrivateContact && visibleAtPreview(member.contact_visibility || "admin");
  const visibleEvents = (events || []).filter(e => visibleAtPreview(e.visibility || "member"));
  const visibleMemories = (memories || []).filter(m => visibleAtPreview(m.visibility || "member"));
  const relationshipToViewer = viewerMemberId ? describeRelationshipToViewer(members, relationships, viewerMemberId, member.id) : null;
  const relationshipLabel = viewerMemberId ? relationshipLabelToViewer(members, relationships, viewerMemberId, member.id) : null;
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
          <div className="drawer-head-title">{onBack && <button className="btn small profile-back" aria-label="Back to previous profile" onClick={onBack}><ArrowLeft size={16}/> Back</button>}
          <strong>
            {cfg.network_template === "family"
              ? t("familyProfile")
              : `${cfg.entity_label} Profile`}
          </strong></div>
        <button className="btn small" aria-label="Close profile" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <FeatureGuide entry={GUIDE_ENTRIES.find(e=>e.key==="profiles")} onOpenGuide={onOpenGuide} rememberKey="drawer-profile"/>
        <div className="profile-hero">
<IdentityAvatar member={member} size="lg" />
          <div>
            <h2 style={{ margin: "0 0 5px", fontSize: 22 }}>
              {member.full_name}
            </h2>
            <div className="person-meta">
              {relationshipToViewer || (simple && cfg.network_template === "family" ? "Family member" : `${cfg.level_label} ${member.generation_level}`)}
            </div>
            {relationshipLabel && <div className={`profile-relationship-badge ${relationshipLabel === "You" ? "you" : ""}`}>{relationshipLabel === "You" ? "This is you" : `Your ${relationshipLabel.toLowerCase()}`}</div>}
          </div>
        </div>
        {showProfileDetails && <div className="detail-grid">
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
          {!simple && <div className="detail">
            <div className="detail-label">
              <GitBranch size={12} style={{ verticalAlign: "middle" }} />{" "}
              {t("generation")}
            </div>
            <div className="detail-value">{member.generation_level}</div>
          </div>}
          <div className="detail">
            <div className="detail-label">
              <Calendar size={12} style={{ verticalAlign: "middle" }} /> {t("birthday")}
            </div>
            <div className="detail-value">{member.date_of_birth ? friendlyDate(member.date_of_birth, language) : t("notAdded")}</div>
          </div>
        </div>}
        {showContactDetails && (
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
        {!showContactDetails && (
          <div className="privacy-note">
            {t("privateContact")}
          </div>
        )}
        {showContactDetails &&
          member.contact_visibility === "admin" &&
          !member.phone &&
          !member.email && (
            <div className="privacy-note">
              This member has chosen to keep contact details visible only to
              administrators.
            </div>
          )}
        {!showProfileDetails && (
          <div className="privacy-note">
            This profile has more details than this preview is allowed to show.
          </div>
        )}
        {(() => { const links=[
          {label:"Facebook",url:safeExternalUrl(member.facebook_url),show:showProfileDetails&&(visibility!=="public"||member.facebook_public)},
          {label:"Instagram",url:safeExternalUrl(member.instagram_url),show:showProfileDetails&&(visibility!=="public"||member.instagram_public)},
          {label:member.other_social_label||"Website",url:safeExternalUrl(member.other_social_url),show:showProfileDetails&&(visibility!=="public"||member.other_social_public)}
        ].filter(x=>x.url&&x.show); return links.length?<div className="profile-social-links"><div className="detail-label"><Link2 size={12}/> Social links</div><div className="social-link-chips">{links.map(x=><a key={x.label} href={x.url} target="_blank" rel="noopener noreferrer nofollow" className="social-link-chip">{x.label}<ExternalLink size={12}/></a>)}</div><div className="person-meta">External links are user-provided and are not identity verification.</div></div>:null })()}
        {showProfileDetails && member.bio && (
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
          {visibleEvents.length === 0 && (
            <div className="empty compact">{copy.noMilestones}</div>
          )}
          {visibleEvents
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
          {visibleMemories.length === 0 && (
            <div className="empty compact">{copy.noMemories}</div>
          )}
          {visibleMemories.slice(0, 6).map((m) => (
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
                  {viewerMemberId ? (relationshipLabelToViewer(members, relationships, viewerMemberId, other.id) || type) : type} · {other.profession || copy.member}
                </div>
              </div>
              <button className="btn small relationship-view-button" onClick={() => onSelect(other)}>
                View {other.full_name.split(/\s+/)[0]} <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
        {!canEdit && viewerMemberId && <div className="profile-correction-note"><AlertCircle size={16}/><span><b>Something looks wrong?</b> Tell the family owner what needs correcting. Members cannot directly change foundational family structure.</span>{onReportCorrection&&<button className="btn small" onClick={onReportCorrection}>Report correction</button>}</div>}
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
