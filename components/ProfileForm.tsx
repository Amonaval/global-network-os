"use client";
import { useEffect, useState } from "react";
import {
  Member,
  Submission,
  ProfileVisibility,
  ContactVisibility,
} from "../lib/types";
import { uploadProfilePhoto } from "../lib/storage";
import { isSupabaseConfigured } from "../lib/supabase";
import { getNetworkConfig, NetworkSettings } from "../lib/network";
import { getAuthUser } from "../lib/auth";
import { getNetworkRepository } from "../lib/repository";

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
  const set = (k: string, v: string) => setForm((x) => ({ ...x, [k]: v }));
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
    try {
      let photo = form.photo_url;
      if (file) {
        if (isSupabaseConfigured) photo = await uploadProfilePhoto(file);
        else
          photo = await new Promise<string>((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve(String(r.result || ""));
            r.onerror = () => reject(new Error("Could not read the photo."));
            r.readAsDataURL(file);
          });
      }
      const photoForSave = file ? photo : member ? undefined : photo;
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
          },
        );
        window.dispatchEvent(
          new CustomEvent("living-network-profile-updated", {
            detail: updated,
          }),
        );
      } else
        await onSubmit({
          id:
            globalThis.crypto?.randomUUID?.() ||
            "00000000-0000-4000-8000-" +
              Math.random().toString(16).slice(2).padEnd(12, "0").slice(0, 12),
          member_id: member?.id,
          ...form,
          photo_url: photoForSave,
          status: "pending",
          created_at: new Date().toISOString(),
          profile_visibility: form.profile_visibility as ProfileVisibility,
          contact_visibility: form.contact_visibility as ContactVisibility,
        });
      onClose();
    } catch (x: any) {
      setError(x.message || "Could not save the profile.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="modal-overlay">
      <form className="modal" onSubmit={submit}>
        <div className="drawer-head">
          <h2 style={{ margin: 0 }}>
            {member
              ? `Update ${cfg.entity_label}`
              : `Submit ${cfg.entity_label}`}
          </h2>
          <button type="button" className="btn small" onClick={onClose}>
            Close
          </button>
        </div>
        <p className="page-subtitle">
          {directEnabled && !governedChanged
            ? "Low-risk profile fields save immediately. Identity and visibility changes require review."
            : "This change will be submitted for administrator review."}
        </p>
        <div className="form-grid" style={{ marginTop: 18 }}>
          {[
            ["full_name", "Full name"],
            ["profession", "Profession"],
            ["city", "City"],
            ["country", "Country"],
            ["phone", "Phone"],
            ["email", "Email"],
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
            <label>Profile details visible to</label>
            <select
              className="select"
              value={form.profile_visibility}
              onChange={(e) => set("profile_visibility", e.target.value)}
            >
              <option value="public">All members</option>
              <option value="member">Members</option>
              <option value="admin">Admins only</option>
            </select>
          </div>
          <div className="field">
            <label>Contact visible to</label>
            <select
              className="select"
              value={form.contact_visibility}
              onChange={(e) => set("contact_visibility", e.target.value)}
            >
              <option value="member">Members</option>
              <option value="admin">Admins only</option>
            </select>
          </div>
          <div className="field full">
            <label>Profile photo</label>
            <input
              className="text-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <div className="person-meta">JPG, PNG or WebP · maximum 5 MB.</div>
            {form.photo_url && !file && (
              <img
                src={form.photo_url}
                alt="Current profile"
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginTop: 5,
                }}
              />
            )}
          </div>
          <div className="field full">
            <label>Bio</label>
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
            Full name and visibility are governed fields, so this update will be
            reviewed.
          </div>
        )}
        <div className="form-actions">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" type="submit" disabled={busy}>
            {busy
              ? "Saving…"
              : directEnabled && !governedChanged
                ? "Save Profile"
                : "Submit for Review"}
          </button>
        </div>
      </form>
    </div>
  );
}
