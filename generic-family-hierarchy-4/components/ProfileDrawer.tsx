"use client";

import {useState} from "react";
import {
  X,
  MapPin,
  Briefcase,
  Calendar,
  GitBranch,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Link2, ExternalLink, BookOpen,
} from "lucide-react";
import {IdentityAvatar,safeExternalUrl} from "../lib/identity";
import { LifeEvent, Member, Relationship, Memory } from "../lib/types";
import { getNetworkConfig, NetworkSettings } from "../lib/network";
import { relationshipLabelToViewer } from "../lib/relationship-intelligence";
import {localizeRelationshipLabel, relationBadge, relationshipSentence} from "../lib/family-relationship-copy";
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
  const [tab,setTab]=useState<"overview"|"story"|"family">("overview");
  const copy = language === "hi" ? { phone:"फ़ोन", email:"ईमेल", about:"परिचय", addEvent:"घटना जोड़ें", noMilestones:"अभी कोई जीवन घटना साझा नहीं की गई।", noMemories:"अभी कोई याद साझा नहीं की गई।", noRelations:"अभी कोई रिश्ता दर्ज नहीं है।", member:"सदस्य", undated:"तारीख नहीं", edit:"बदलें", back:"पिछली प्रोफ़ाइल", overview:"परिचय", story:"कहानी", family:"परिवार", sections:"प्रोफ़ाइल अनुभाग", correctionTitle:"कुछ गलत दिख रहा है?", correctionBody:"परिवार के मालिक को बताएं कि क्या सुधारना है। सदस्य परिवार की मूल संरचना सीधे नहीं बदल सकते।", correction:"सुधार बताएँ", privacyAdmin:"इस सदस्य ने संपर्क जानकारी केवल प्रबंधकों को दिखाने का विकल्प चुना है।", privacyLimited:"इस प्रोफ़ाइल में कुछ और जानकारी है जो इस दृश्य में दिखाई नहीं जा सकती।", social:"सोशल लिंक", external:"बाहरी लिंक सदस्य द्वारा दिए गए हैं; ये पहचान सत्यापन नहीं हैं।", view:"देखें", openGuide:"प्रोफ़ाइल सहायता खोलें", guideTitle:"प्रोफ़ाइल सहायता", close:"प्रोफ़ाइल बंद करें", generation:"पीढ़ी" } : language === "mr" ? { phone:"फोन", email:"ईमेल", about:"परिचय", addEvent:"घटना जोडा", noMilestones:"अजून कोणतीही जीवन घटना सामायिक केलेली नाही.", noMemories:"अजून कोणतीही आठवण सामायिक केलेली नाही.", noRelations:"अजून कोणतेही नाते नोंदवलेले नाही.", member:"सदस्य", undated:"तारीख नाही", edit:"बदला", back:"मागील प्रोफाइल", overview:"परिचय", story:"कथा", family:"कुटुंब", sections:"प्रोफाइल विभाग", correctionTitle:"काही चुकीचे दिसते आहे?", correctionBody:"कुटुंब मालकाला काय दुरुस्त करायचे ते सांगा. सदस्य मूलभूत कौटुंबिक रचना थेट बदलू शकत नाहीत.", correction:"दुरुस्ती कळवा", privacyAdmin:"या सदस्याने संपर्क माहिती फक्त व्यवस्थापकांना दिसावी असे निवडले आहे.", privacyLimited:"या प्रोफाइलमध्ये अधिक माहिती आहे जी या दृश्यात दाखवता येत नाही.", social:"सोशल लिंक", external:"बाह्य लिंक सदस्याने दिलेल्या आहेत; त्या ओळख पडताळणी नाहीत.", view:"पहा", openGuide:"प्रोफाइल मदत उघडा", guideTitle:"प्रोफाइल मदत", close:"प्रोफाइल बंद करा", generation:"पिढी" } : { phone:"Phone", email:"Email", about:"About", addEvent:"Add event", noMilestones:"No milestones have been shared yet.", noMemories:"No memories have been shared yet.", noRelations:"No relationships recorded.", member:"Member", undated:"Undated", edit:"Edit", back:"Back to previous profile", overview:"Overview", story:"Story", family:"Family", sections:"Profile sections", correctionTitle:"Something looks wrong?", correctionBody:"Tell the family owner what needs correcting. Members cannot directly change foundational family structure.", correction:"Report correction", privacyAdmin:"This member has chosen to keep contact details visible only to administrators.", privacyLimited:"This profile has more details than this preview is allowed to show.", social:"Social links", external:"External links are user-provided and are not identity verification.", view:"View", openGuide:"Open profile guide", guideTitle:"Profile guide", close:"Close profile", generation:"Generation" };
  const cfg = getNetworkConfig(network ?? null);
  const visibilityRank = { public: 0, member: 1, admin: 2 } as const;
  const previewRank = visibilityRank[visibility];
  const visibleAtPreview = (required?: "public" | "member" | "admin" | null) => previewRank >= visibilityRank[required || "member"];
  const showProfileDetails = visibleAtPreview(member.profile_visibility || "member");
  const showContactDetails = canViewPrivateContact && visibleAtPreview(member.contact_visibility || "admin");
  const visibleEvents = (events || []).filter(e => visibleAtPreview(e.visibility || "member"));
  const visibleMemories = (memories || []).filter(m => visibleAtPreview(m.visibility || "member"));
  const relationshipLabel = viewerMemberId ? relationshipLabelToViewer(members, relationships, viewerMemberId, member.id) : null;
  const relationshipToViewer = viewerMemberId && relationshipLabel ? relationshipSentence(member.full_name, relationshipLabel, language) : null;
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
          <div className="drawer-head-title">{onBack && <button className="btn small profile-back" aria-label={copy.back} onClick={onBack}><ArrowLeft size={16}/> {copy.back}</button>}
          <strong>
            {cfg.network_template === "family"
              ? t("familyProfile")
              : `${cfg.entity_label} Profile`}
          </strong></div>
          <div className="drawer-head-actions">
            {onOpenGuide&&<button className="btn small icon-only profile-guide-button" aria-label={copy.openGuide} title={copy.guideTitle} onClick={()=>onOpenGuide("profiles")}><BookOpen size={16}/></button>}
            <button className="btn small icon-only" aria-label={copy.close} onClick={onClose}><X size={16} /></button>
          </div>
        </div>
        <div className="profile-hero">
<IdentityAvatar member={member} size="lg" />
          <div>
            <h2 style={{ margin: "0 0 5px", fontSize: 22 }}>
              {member.full_name}
            </h2>
            <div className="person-meta nx6-profile-relationship-summary">
              {relationshipToViewer || (simple && cfg.network_template === "family" ? copy.member : cfg.network_template === "family" ? `${copy.generation} ${member.generation_level}` : `${cfg.level_label} ${member.generation_level}`)}
            </div>
            {relationshipLabel && <div className={`profile-relationship-badge ${relationshipLabel === "You" ? "you" : ""}`}>{relationBadge(relationshipLabel, language)}</div>}
          </div>
        </div>
        <div className="nx6-profile-tabs" role="tablist" aria-label={copy.sections}>
          <button role="tab" aria-selected={tab==="overview"} className={tab==="overview"?"active":""} onClick={()=>setTab("overview")}>{copy.overview}</button>
          <button role="tab" aria-selected={tab==="story"} className={tab==="story"?"active":""} onClick={()=>setTab("story")}>{copy.story} <span>{visibleEvents.length+visibleMemories.length}</span></button>
          <button role="tab" aria-selected={tab==="family"} className={tab==="family"?"active":""} onClick={()=>setTab("family")}>{copy.family} <span>{related.length}</span></button>
        </div>
        <div className="nx6-profile-body">
        {tab==="overview"&&<>
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
              {copy.privacyAdmin}
            </div>
          )}
        {!showProfileDetails && (
          <div className="privacy-note">
            {copy.privacyLimited}
          </div>
        )}
        {(() => { const links=[
          {label:"Facebook",url:safeExternalUrl(member.facebook_url),show:showProfileDetails&&(visibility!=="public"||member.facebook_public)},
          {label:"Instagram",url:safeExternalUrl(member.instagram_url),show:showProfileDetails&&(visibility!=="public"||member.instagram_public)},
          {label:member.other_social_label||"Website",url:safeExternalUrl(member.other_social_url),show:showProfileDetails&&(visibility!=="public"||member.other_social_public)}
        ].filter(x=>x.url&&x.show); return links.length?<div className="profile-social-links"><div className="detail-label"><Link2 size={12}/> {copy.social}</div><div className="social-link-chips">{links.map(x=><a key={x.label} href={x.url} target="_blank" rel="noopener noreferrer nofollow" className="social-link-chip">{x.label}<ExternalLink size={12}/></a>)}</div><div className="person-meta">{copy.external}</div></div>:null })()}
        {showProfileDetails && member.bio && (
          <>
            <h3 style={{ fontSize: 14 }}>{copy.about}</h3>
            <p className="nx6-profile-about">{member.bio}</p>
          </>
        )}
        </>}
        {tab==="story"&&<>
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
        </>}
        {tab==="family"&&<>
        <h3 style={{ fontSize: 14, marginTop: 4 }}>{t("familyConnections")}</h3>
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
                  {viewerMemberId ? localizeRelationshipLabel(relationshipLabelToViewer(members, relationships, viewerMemberId, other.id) || type, language) : type} · {other.profession || copy.member}
                </div>
              </div>
              <button className="btn small relationship-view-button" onClick={() => onSelect(other)}>
                {copy.view} {other.full_name.split(/\s+/)[0]} <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
        {!canEdit && viewerMemberId && <div className="profile-correction-note"><AlertCircle size={16}/><span><b>{copy.correctionTitle}</b> {copy.correctionBody}</span>{onReportCorrection&&<button className="btn small" onClick={onReportCorrection}>{copy.correction}</button>}</div>}
        </>}
        </div>
        <div className="form-actions nx6-profile-actions">
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
