"use client";
import {useLanguage} from "../lib/i18n";
import { useEffect, useState } from "react";
import {
  Member,
  Submission,
  ProfileVisibility,
  ContactVisibility,
} from "../lib/types";
import { uploadProfilePhoto,removeStoredMedia } from "../lib/storage";
import { isSupabaseConfigured } from "../lib/supabase";
import { getNetworkConfig, NetworkSettings } from "../lib/network";
import { getAuthUser } from "../lib/auth";
import { getNetworkRepository } from "../lib/repository";
import {AVATAR_STYLES,avatarLabels,IdentityAvatar,normalizeSocialUrl} from "../lib/identity";

export default function ProfileForm({
  member,
  network,
  onClose,
  onSubmit,
}: {
  member?: Member;
  network?: NetworkSettings | null;
  onClose: () => void;
  onSubmit: (s: Submission) => Promise<void> | void;
}) {
 const {t:tr}=useLanguage();
  const cfg = getNetworkConfig(network ?? null);
  const [form, setForm] = useState({
    full_name: member?.full_name || "",
    profession: member?.profession || "",
    city: member?.city || "",
    country: member?.country || "India",
    bio: member?.bio || "",
    phone: member?.phone || "",
    email: member?.email || "",
    photo_url: member?.photo_url || "",
    avatar_style: member?.avatar_style || "initials",
    facebook_url: member?.facebook_url || "",
    facebook_public: member?.facebook_public ?? false,
    instagram_url: member?.instagram_url || "",
    instagram_public: member?.instagram_public ?? false,
    other_social_url: member?.other_social_url || "",
    other_social_label: member?.other_social_label || "Website",
    other_social_public: member?.other_social_public ?? false,
    profile_visibility: member?.profile_visibility || "member",
    contact_visibility: member?.contact_visibility || "admin",
  });
  const [file, setFile] = useState<File | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [isOwnProfile, setIsOwnProfile] = useState(false);
  useEffect(() => {
    if (!isSupabaseConfigured || !member) return;
    getAuthUser()
      .then((u) => setIsOwnProfile(u?.member_id === member.id))
      .catch(() => setIsOwnProfile(false));
  }, [member?.id]);
  const set = (k: string, v: string | boolean) => setForm((x) => ({ ...x, [k]: v }));
  const directEnabled =
    !!member && isOwnProfile && cfg.self_edit_mode === "safe_fields_direct";
  const governedChanged =
    !!member &&
    (form.full_name !== member.full_name ||
      form.profile_visibility !== (member.profile_visibility || "member") ||
      form.contact_visibility !== (member.contact_visibility || "admin"));
  async function submit(e: any) {
    e.preventDefault();
    setBusy(true);
    setError("");
    let newlyUploaded: string | null = null;
    try {
      let photo = form.photo_url;
      if (file) {
        if (isSupabaseConfigured) { photo = await uploadProfilePhoto(file,member?.id); newlyUploaded = photo; }
        else
          photo = await new Promise<string>((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve(String(r.result || ""));
            r.onerror = () => reject(new Error("Could not read the photo."));
            r.readAsDataURL(file);
          });
      }
      const photoForSave = file ? photo : member ? undefined : photo;
      const facebook_url=normalizeSocialUrl(form.facebook_url,"facebook");
      const instagram_url=normalizeSocialUrl(form.instagram_url,"instagram");
      const other_social_url=normalizeSocialUrl(form.other_social_url,"other");
      if (directEnabled && !governedChanged) {
        const updated = await getNetworkRepository().updateOwnProfileSafeFields(
          {
            profession: form.profession,
            city: form.city,
            country: form.country,
            bio: form.bio,
            phone: form.phone,
            email: form.email,
            photo_url: photoForSave,
            avatar_style: form.avatar_style as any,
            facebook_url, facebook_public: !!facebook_url && form.facebook_public,
            instagram_url, instagram_public: !!instagram_url && form.instagram_public,
            other_social_url, other_social_label: form.other_social_label.trim() || "Website",
            other_social_public: !!other_social_url && form.other_social_public,
          },
        );
        window.dispatchEvent(
          new CustomEvent("living-network-profile-updated", {
            detail: updated,
          }),
        );
        if (newlyUploaded && member?.photo_url && member.photo_url !== newlyUploaded) {
          removeStoredMedia(member.photo_url,"profile-photos").catch(()=>{});
        }
      } else
        await onSubmit({
          id:
            globalThis.crypto?.randomUUID?.() ||
            "00000000-0000-4000-8000-" +
              Math.random().toString(16).slice(2).padEnd(12, "0").slice(0, 12),
          member_id: member?.id,
          ...form,
          photo_url: photoForSave,
          facebook_url, instagram_url, other_social_url,
          status: "pending",
          created_at: new Date().toISOString(),
          profile_visibility: form.profile_visibility as ProfileVisibility,
          contact_visibility: form.contact_visibility as ContactVisibility,
        });
      onClose();
    } catch (x: any) {
      if (newlyUploaded) removeStoredMedia(newlyUploaded,"profile-photos").catch(()=>{});
      setError(x.message || "Could not save the profile.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="modal-overlay" onMouseDown={(event)=>event.target===event.currentTarget&&onClose()}>
      <form className="modal" onSubmit={submit}>
        <div className="drawer-head">
          <h2 style={{ margin: 0 }}>
            {member
              ? `Update ${cfg.entity_label}`
              : cfg.network_template === "family"
                ? tr("AddARelativeTxt")
                : `Submit ${cfg.entity_label}`}
          </h2>
          <button type="button" className="btn small" onClick={onClose}>
            {tr("CloseTxt")}{" "}</button>
        </div>
        <p className="page-subtitle">
          {directEnabled && !governedChanged
            ? tr("LowRiskProfileFieldsSaveImmediatelyIdentityTxt")
            : tr("ThisChangeWillBeSubmittedForAdministratorTxt")}
        </p>
        <div className="form-grid" style={{ marginTop: 18 }}>
          {[
            ["full_name", tr("FullNameTxt")],
            ["profession", tr("ProfessionTxt")],
            ["city", tr("CityTxt")],
            ["country", tr("CountryTxt")],
            ["phone", tr("PhoneTxt")],
            ["email", tr("EmailTxt")],
          ].map(([k, label]) => (
            <div className="field" key={k}>
              <label>{label}</label>
              <input
                className="text-input"
                value={(form as any)[k]}
                onChange={(e) => set(k, e.target.value)}
              />
            </div>
          ))}
          <div className="field">
            <label>{tr("ProfileDetailsVisibleToTxt")}</label>
            <select
              className="select"
              value={form.profile_visibility}
              onChange={(e) => set("profile_visibility", e.target.value)}
            >
              <option value="public">{tr("AllMembersTxt")}</option>
              <option value="member">{tr("MembersTxt")}</option>
              <option value="admin">{tr("AdminsOnlyTxt")}</option>
            </select>
          </div>
          <div className="field">
            <label>{tr("ContactVisibleToTxt")}</label>
            <select
              className="select"
              value={form.contact_visibility}
              onChange={(e) => set("contact_visibility", e.target.value)}
            >
              <option value="member">{tr("MembersTxt")}</option>
              <option value="admin">{tr("AdminsOnlyTxt")}</option>
            </select>
          </div>
          <div className="field full">
            <label>{tr("ProfilePhotoTxt")}</label>
            {cfg.photo_upload_enabled ? (<>
              <input className="text-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <div className="person-meta">{tr("JPGPNGOrWebPMaximum100KBTxt")}</div>
              {form.photo_url && !file && <img src={form.photo_url} alt="Current profile" style={{width:72,height:72,borderRadius:"50%",objectFit:"cover",marginTop:5}} />}
            </>) : <div className="person-meta">{tr("PhotoUploadsAreDisabledByYourFamilyTxt")}</div>}
          </div>
          <div className="field full identity-editor">
            <label>{tr("LightweightAvatarTxt")}</label>
            <div className="avatar-choice-row">{AVATAR_STYLES.map(style=><button type="button" key={style} className={`avatar-choice ${form.avatar_style===style?"selected":""}`} onClick={()=>set("avatar_style",style)} aria-pressed={form.avatar_style===style}><IdentityAvatar member={{full_name:form.full_name||tr("FamilyMember2Txt"),avatar_style:style}} size="sm"/><span>{avatarLabels[style]}</span></button>)}</div>
            <div className="person-meta">{tr("UsedWheneverNoProfilePhotoIsAvailableTxt")}</div>
          </div>
          <div className="field full social-links-editor">
            <label>{tr("SocialLinksTxt")}{" "}<span className="optional-label">{tr("OptionalTxt")}</span></label>
            <p className="person-meta">{tr("WeOnlyStoreTheLinkFamilyNetworkTxt")}</p>
            {[{key:"facebook",label:tr("FacebookTxt"),placeholder:"https://facebook.com/your-profile"},{key:"instagram",label:tr("InstagramTxt"),placeholder:"https://instagram.com/your-profile"},{key:"other_social",label:tr("OtherProfileWebsiteTxt"),placeholder:"https://example.com/your-profile"}].map(x=><div className="social-link-row" key={x.key}><div><span>{x.label}</span>{x.key==="other_social"&&<input className="text-input social-label-input" aria-label={tr("OtherLinkLabelTxt")} value={form.other_social_label} onChange={e=>set("other_social_label",e.target.value)} placeholder={tr("WebsiteTxt")}/>}</div><input className="text-input" type="url" inputMode="url" placeholder={x.placeholder} value={(form as any)[`${x.key}_url`]} onChange={e=>set(`${x.key}_url`,e.target.value)}/><label className="social-public-toggle"><input type="checkbox" checked={(form as any)[`${x.key}_public`]} disabled={!String((form as any)[`${x.key}_url`]||"").trim()} onChange={e=>set(`${x.key}_public`,e.target.checked)}/><span>{tr("ShowOnPublicProfileTxt")}</span></label></div>)}
            <div className="privacy-note compact">{tr("ASocialLinkIsJustALinkTxt")}</div>
          </div>
          <div className="field full">
            <label>{tr("BioTxt")}</label>
            <textarea
              className="textarea"
              rows={4}
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
            />
          </div>
        </div>
        {error && (
          <div
            className="notice"
            style={{ background: "#fff0f0", color: "#9b2c2c", marginTop: 14 }}
          >
            {error}
          </div>
        )}
        {directEnabled && governedChanged && (
          <div className="notice warning-notice" style={{ marginTop: 14 }}>
            {tr("FullNameAndVisibilityAreGovernedFieldsTxt")}{" "}</div>
        )}
        <div className="form-actions">
          <button type="button" className="btn" onClick={onClose}>
            {tr("CancelTxt")}{" "}</button>
          <button className="btn primary" type="submit" disabled={busy}>
            {busy
              ? tr("SavingTxt")
              : directEnabled && !governedChanged
                ? tr("SaveProfile2Txt")
                : tr("SubmitForReviewTxt")}
          </button>
        </div>
      </form>
    </div>
  );
}
