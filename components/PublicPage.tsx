"use client";
import { useEffect, useState } from "react";
import { TreePine, Users, GitBranch, ExternalLink } from "lucide-react";
import { supabase } from "../lib/supabase";
import { trackPublicParticipation } from "../lib/remote";

type PublicMember = {
  id: string;
  full_name: string;
  generation_level: number;
  profession: string | null;
  city: string | null;
  country: string | null;
  bio: string | null;
  date_of_death: string | null;
};

type NetworkInfo = {
  name: string;
  description: string;
  entity_label: string;
  entity_label_plural: string;
  level_label: string;
  level_label_plural: string;
};

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map(x => x[0]).join("").toUpperCase();
}

export default function PublicPage() {
  const [network, setNetwork] = useState<NetworkInfo | null>(null);
  const [members, setMembers] = useState<PublicMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [embed, setEmbed] = useState(false);

  useEffect(() => {
    if (!supabase) { setError("This network is not configured for shared access."); setLoading(false); return; }
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const isEmbed = params.get("embed") === "1";
        setEmbed(isEmbed);
        const [ni, mi] = await Promise.all([
          supabase.rpc("get_public_network_info"),
          supabase.rpc("get_public_family_members"),
        ]);
        if (ni.error) throw ni.error;
        if (mi.error) throw mi.error;
        setNetwork((ni.data || [])[0] ?? null);
        setMembers((mi.data || []) as PublicMember[]);
        trackPublicParticipation(isEmbed ? "embed_view" : "public_view", undefined, params.get("source") || (isEmbed ? "embed" : "direct")).catch(() => {});
      } catch (e: any) {
        setError(e.message || "Could not load public network data.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = query
    ? members.filter(m =>
        `${m.full_name} ${m.profession || ""} ${m.city || ""}`.toLowerCase().includes(query.toLowerCase())
      )
    : members;

  const genCount = new Set(members.map(m => m.generation_level)).size;
  const entityLabel = network?.entity_label ?? "Member";
  const entityLabelPlural = network?.entity_label_plural ?? "Members";
  const levelLabel = network?.level_label ?? "Generation";

  if (loading) {
    return (
      <div className="loading-screen">
        <TreePine size={30} />
        <div><b>Loading…</b><div className="page-subtitle">Fetching public directory</div></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="landing">
        <div className="landing-card">
          <div className="brand-mark"><TreePine size={24} /></div>
          <h1>Hierarchy Network</h1>
          <p className="page-subtitle">{error}</p>
          <a href="/" className="btn primary" style={{ display: "inline-block", marginTop: 12 }}>Back to sign-in</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Public header — no navigation */}
      {!embed && <header style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="brand-mark"><TreePine size={18} /></div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>{network?.name || "Hierarchy Network"}</span>
          <span className="mode-pill shared" style={{ fontSize: 10 }}>Public</span>
        </div>
        <a href="/" className="btn small" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <ExternalLink size={13} /> Sign in
        </a>
      </header>}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 60px" }}>
        {/* Network description */}
        {network?.description && (
          <p className="page-subtitle" style={{ marginBottom: 24 }}>{network.description}</p>
        )}

        {/* Stats row */}
        <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
          <div className="card stat" style={{ minWidth: 120 }}>
            <div className="stat-label">{entityLabelPlural}</div>
            <div className="stat-number">{members.length}</div>
          </div>
          <div className="card stat" style={{ minWidth: 120 }}>
            <div className="stat-label">{network?.level_label_plural ?? "Generations"}</div>
            <div className="stat-number">{genCount}</div>
          </div>
          <div className="card stat" style={{ minWidth: 120 }}>
            <div className="stat-label">In memoriam</div>
            <div className="stat-number">{members.filter(m => !!m.date_of_death).length}</div>
          </div>
        </div>

        {/* Search */}
        {members.length > 0 && (
          <>
            <div className="page-head" style={{ marginBottom: 12 }}>
              <div>
                <h1 className="page-title">{entityLabelPlural} Directory</h1>
                <p className="page-subtitle">Members who have made their profile publicly visible.</p>
              </div>
            </div>
            <div className="search-bar" style={{ marginBottom: 16 }}>
              <Users size={16} color="#7a8496" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={`Search ${entityLabelPlural.toLowerCase()}…`}
              />
            </div>
            <p className="page-subtitle" style={{ marginBottom: 14 }}>{filtered.length} {entityLabelPlural.toLowerCase()} shown</p>
          </>
        )}

        {/* Member grid */}
        {members.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: "center" }}>
            <p className="page-subtitle">No public profiles are available yet.</p>
            <p className="page-subtitle">Members can set their visibility to Public from their profile settings.</p>
          </div>
        ) : (
          <div className="results-grid">
            {filtered.map(m => (
              <a className="person-card card public-person-link" key={m.id} href={`/public/member/${m.id}`}>
                <div className={`avatar ${m.date_of_death ? "grayscale" : ""}`}>
                  {initials(m.full_name)}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="person-name">
                    {m.full_name}
                    {m.date_of_death && <span className="person-meta"> · In memoriam</span>}
                  </div>
                  <div className="person-meta">
                    {m.profession || entityLabel}<br />
                    {[m.city, m.country].filter(Boolean).join(", ")}<br />
                    {levelLabel} {m.generation_level}
                  </div>
                  {m.bio && <p className="person-meta" style={{ marginTop: 6, whiteSpace: "pre-line" }}>{m.bio.slice(0, 120)}{m.bio.length > 120 ? "…" : ""}</p>}
                </div>
              </a>
            ))}
          </div>
        )}

        {/* CTA */}
        {!embed && <div className="card" style={{ marginTop: 40, padding: "28px 24px", textAlign: "center" }}>
          <GitBranch size={28} style={{ margin: "0 auto 10px", display: "block", color: "var(--muted)" }} />
          <h3 style={{ marginTop: 0 }}>Part of this network?</h3>
          <p className="page-subtitle">Sign in or accept an invitation to view the full hierarchy, relationship tree, and more.</p>
          <a href="/" className="btn primary" style={{ display: "inline-block", marginTop: 12 }}>Sign in to the full network</a>
        </div>}
      </div>
    </div>
  );
}
