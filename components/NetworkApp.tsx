"use client";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  Search,
  TreePine,
  Users,
  ShieldCheck,
  Upload,
  Download,
  Plus,
  X,
  UserRoundPen,
  RotateCcw,
  MapPinned,
  GitBranch,
  BookOpen,
  HeartHandshake,
  Eye,
  LogOut,
  Database,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ClipboardCheck,
  ExternalLink,
  CalendarDays,
  Settings2,
} from "lucide-react";
import TreeView from "./TreeView";
import ProfileDrawer from "./ProfileDrawer";
import ImportModal from "./ImportModal";
import ProfileForm from "./ProfileForm";
import AuthPanel from "./AuthPanel";
import RelationshipModal from "./RelationshipModal";
import SetupScreen from "./SetupScreen";
import InvitationModal from "./InvitationModal";
import {
  loadState,
  saveState,
  loadDemoState,
  downloadText,
} from "../lib/store";
import {
  AuditEntry,
  ChangeRequest,
  LifeEvent,
  Member,
  Relationship,
  Submission,
  Memory,
  Notification,
} from "../lib/types";
import { isSupabaseConfigured } from "../lib/supabase";
import { getNetworkRepository } from "../lib/repository";
import { getAuthUser, signOut } from "../lib/auth";
import {
  loadLocalNetwork,
  saveLocalNetwork,
  NetworkSettings,
  getNetworkConfig,
} from "../lib/network";
import RelationshipExplorer from "./RelationshipExplorer";
import LifeEventEditor from "./LifeEventEditor";
import CommunityHub from "./CommunityHub";
import AnalyticsPanel from "./AnalyticsPanel";
import TimelineView from "./TimelineView";
import UpcomingWidget, { UpcomingMilestone } from "./UpcomingWidget";
import { validateImportRows, validateNetwork } from "../lib/validation";
const MapView = dynamic(() => import("./MapView"), { ssr: false });
const repository = getNetworkRepository();
type View = "tree" | "directory" | "map" | "community" | "timeline" | "admin";
type Visibility = "public" | "member" | "admin";
const esc = (v: string) => `"${String(v ?? "").replaceAll('"', '""')}"`;
const uuid = () =>
  globalThis.crypto?.randomUUID?.() ||
  "00000000-0000-4000-8000-" +
    Math.random().toString(16).slice(2).padEnd(12, "0").slice(0, 12);

export default function NetworkApp() {
  const [network, setNetwork] = useState<NetworkSettings | null>(null),
    [view, setView] = useState<View>("tree"),
    [members, setMembers] = useState<Member[]>([]),
    [relationships, setRelationships] = useState<Relationship[]>([]),
    [submissions, setSubmissions] = useState<Submission[]>([]),
    [auth, setAuth] = useState<any>(null),
    [ready, setReady] = useState(false),
    [showAuth, setShowAuth] = useState(false),
    [setupNeeded, setSetupNeeded] = useState(false),
    [editingMember, setEditingMember] = useState<Member | undefined>();
  const [query, setQuery] = useState(""),
    [profession, setProfession] = useState(""),
    [city, setCity] = useState(""),
    [generation, setGeneration] = useState(""),
    [lifeStatus, setLifeStatus] = useState<"all" | "living" | "deceased">(
      "all",
    ),
    [selected, setSelected] = useState<Member | null>(null),
    [showImport, setShowImport] = useState(false),
    [showForm, setShowForm] = useState(false),
    [toast, setToast] = useState(""),
    [visibility, setVisibility] = useState<Visibility>("member"),
    [focusId, setFocusId] = useState<string | undefined>(undefined),
    [lineageOnly, setLineageOnly] = useState(false),
    [showDeceased, setShowDeceased] = useState(true),
    [showGuide, setShowGuide] = useState(false),
    [showRelationships, setShowRelationships] = useState(false);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]),
    [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [showInvitation, setShowInvitation] = useState(false),
    [showRelationshipExplorer, setShowRelationshipExplorer] = useState(false),
    [showLifeEventEditor, setShowLifeEventEditor] = useState(false),
    [editingLifeEvent, setEditingLifeEvent] = useState<LifeEvent | undefined>();
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>([]);
  const [allLifeEvents, setAllLifeEvents] = useState<LifeEvent[]>([]);
  const [serverDirectoryMembers, setServerDirectoryMembers] = useState<
    Member[] | null
  >(null);
  const [memories, setMemories] = useState<Memory[]>([]),
    [notifications, setNotifications] = useState<Notification[]>([]);
  const cfg = getNetworkConfig(network);
  const notify = (x: string) => {
    setToast(x);
    setTimeout(() => setToast(""), 3000);
  };
  const hydrate = async (u: any) => {
    setAuth(u);
    const n =
      repository.mode === "shared"
        ? await repository.fetchNetworkSettings()
        : loadLocalNetwork();
    setNetwork(n);
    setSetupNeeded(!n);
    if (n) {
      const s = await repository.fetchState(
        u?.role === "admin" ? "admin" : "member",
      );
      if (s) {
        setMembers(s.members);
        setRelationships(s.relationships);
        setSubmissions(s.submissions);
      }
      if (u?.role === "admin") {
        const g = await repository.fetchGovernance();
        setChangeRequests(g.changeRequests);
        setAuditLog(g.auditLog);
      }
      try {
        setMemories(await repository.fetchMemories());
        setNotifications(await repository.fetchNotifications());
        setAllLifeEvents(await repository.fetchNetworkTimeline());
      } catch {}
    }
  };
  useEffect(() => {
    (async () => {
      try {
        const u = isSupabaseConfigured ? await getAuthUser() : null;
        await hydrate(u);
      } catch (e: any) {
        notify(e.message || "Could not initialize the application.");
      } finally {
        setReady(true);
      }
    })();
  }, []);
  useEffect(() => {
    if (repository.mode === "local" && network)
      saveState({ members, relationships, submissions, lifeEvents });
  }, [members, relationships, submissions, network]);
  const refresh = async () => {
    const s = await repository.fetchState(
      auth?.role === "admin" ? "admin" : "member",
    );
    if (s) {
      setMembers(s.members);
      setRelationships(s.relationships);
      setSubmissions(s.submissions);
    }
    if (auth?.role === "admin") {
      const g = await repository.fetchGovernance();
      setChangeRequests(g.changeRequests);
      setAuditLog(g.auditLog);
    }
    try {
      setMemories(await repository.fetchMemories());
      setNotifications(await repository.fetchNotifications());
      setAllLifeEvents(await repository.fetchNetworkTimeline());
    } catch {}
  };
  useEffect(() => {
    const updated = () =>
      refresh().catch(() => notify("Profile saved, but refresh failed."));
    window.addEventListener("living-network-profile-updated", updated);
    return () =>
      window.removeEventListener("living-network-profile-updated", updated);
  }, [auth?.role]);
  useEffect(() => {
    if (!selected) {
      setLifeEvents([]);
      return;
    }
    (async () => {
      try {
        setLifeEvents(await repository.fetchLifeEvents(selected.id));
      } catch (e: any) {
        notify(e.message || "Could not load timeline.");
      }
    })();
  }, [selected]);
  const saveLifeEvent = async (e: LifeEvent) => {
    try {
      if (repository.mode === "shared") {
        const input = {
          member_id: e.member_id,
          event_type: e.event_type,
          title: e.title,
          event_date: e.event_date || undefined,
          location: e.location,
          description: e.description,
          visibility: e.visibility,
        };
        if (e.id)
          await repository.updateLifeEvent(e.id, {
            event_type: e.event_type,
            title: e.title,
            event_date: e.event_date || undefined,
            location: e.location,
            description: e.description,
            visibility: e.visibility,
          });
        else await repository.createLifeEvent(input);
      } else {
        if (e.id)
          await repository.updateLifeEvent(e.id, {
            event_type: e.event_type,
            title: e.title,
            event_date: e.event_date || undefined,
            location: e.location,
            description: e.description,
            visibility: e.visibility,
          });
        else await repository.createLifeEvent(e);
      }
      setLifeEvents(await repository.fetchLifeEvents(e.member_id));
      setAllLifeEvents(await repository.fetchNetworkTimeline());
      notify(e.id ? "Life event updated." : "Life event added.");
    } catch (x: any) {
      notify(x.message || "Could not save life event.");
      throw x;
    }
  };
  const deleteLifeEvent = async (id: string) => {
    try {
      await repository.deleteLifeEvent(id);
      if (selected)
        setLifeEvents(await repository.fetchLifeEvents(selected.id));
      setAllLifeEvents(await repository.fetchNetworkTimeline());
      notify("Life event deleted.");
    } catch (x: any) {
      notify(x.message || "Could not delete life event.");
      throw x;
    }
  };
  const createNetwork = async (
    settings: NetworkSettings,
    mode: "empty" | "demo" | "import",
    ms: Member[] = [],
    rs: Relationship[] = [],
  ) => {
    if (repository.mode === "shared" && auth?.role !== "admin")
      throw new Error("Only an administrator can create the shared network.");
    let nextM = ms,
      nextR = rs;
    if (mode === "demo") {
      const d = loadDemoState();
      nextM = d.members;
      nextR = d.relationships;
      setSubmissions(d.submissions);
    }
    if (validateNetwork(nextM, nextR).errors.length)
      throw new Error(
        "The selected starting data contains integrity errors. Fix the data before creating the network.",
      );
    if (repository.mode === "shared") {
      await repository.saveNetworkSettings(settings);
      if (nextM.length) {
        await repository.upsertMembers(nextM);
        await repository.mergeRelationships(nextR);
      }
      await refresh();
      setNetwork(await repository.fetchNetworkSettings());
      await repository.logAudit("network_initialized", {
        mode,
        member_count: nextM.length,
        relationship_count: nextR.length,
      });
    } else {
      const n = saveLocalNetwork(settings);
      setNetwork(n);
      setMembers(nextM);
      setRelationships(nextR);
      setSetupNeeded(false);
      if (mode === "empty") setSubmissions([]);
    }
    setSetupNeeded(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    notify(`${settings.name} is ready.`);
  };
  const professions = useMemo(
    () =>
      Array.from(
        new Set(members.map((m) => m.profession).filter(Boolean)),
      ).sort(),
    [members],
  );
  const cities = useMemo(
    () =>
      Array.from(new Set(members.map((m) => m.city).filter(Boolean))).sort(),
    [members],
  );
  const lineageIds = useMemo(() => {
    if (!focusId) return new Set<string>();
    const keep = new Set([focusId]);
    const parents = (id: string) =>
      relationships
        .filter(
          (r) => r.related_person_id === id && r.relationship_type === "parent",
        )
        .map((r) => r.person_id);
    const children = (id: string) =>
      relationships
        .filter((r) => r.person_id === id && r.relationship_type === "parent")
        .map((r) => r.related_person_id);
    const spouses = (id: string) =>
      relationships
        .filter(
          (r) =>
            r.relationship_type === "spouse" &&
            (r.person_id === id || r.related_person_id === id),
        )
        .map((r) => (r.person_id === id ? r.related_person_id : r.person_id));
    let level = [focusId];
    while (level.length) {
      const n = level.flatMap(parents).filter((x) => !keep.has(x));
      n.forEach((x) => keep.add(x));
      level = n;
    }
    level = [focusId];
    while (level.length) {
      const n = level.flatMap(children).filter((x) => !keep.has(x));
      n.forEach((x) => keep.add(x));
      level = n;
    }
    parents(focusId).forEach((p) => children(p).forEach((s) => keep.add(s)));
    Array.from(keep).forEach((id) => spouses(id).forEach((s) => keep.add(s)));
    return keep;
  }, [focusId, relationships]);
  const base = useMemo(
    () =>
      lineageOnly && focusId
        ? members.filter((m) => lineageIds.has(m.id))
        : members,
    [members, lineageOnly, focusId, lineageIds],
  );
  const filtered = useMemo(
    () =>
      base.filter((m) => {
        const q = query.toLowerCase();
        return (
          (!q ||
            `${m.full_name} ${m.profession || ""} ${m.city || ""} ${m.country || ""}`
              .toLowerCase()
              .includes(q)) &&
          (!profession || m.profession === profession) &&
          (!city || m.city === city) &&
          (!generation || String(m.generation_level) === generation) &&
          (lifeStatus === "all" ||
            (lifeStatus === "deceased" ? !!m.date_of_death : !m.date_of_death))
        );
      }),
    [base, query, profession, city, generation, lifeStatus],
  );
  useEffect(() => {
    if (view !== "directory" || repository.mode !== "shared") return;
    const hasFilter =
      !!query.trim() ||
      !!profession ||
      !!city ||
      !!generation ||
      lifeStatus !== "all";
    if (!hasFilter) {
      setServerDirectoryMembers(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const rows = await repository.searchMembers({
          query,
          profession,
          city,
          generation: generation ? Number(generation) : undefined,
          lifeStatus,
          limit: 200,
        });
        if (!cancelled) setServerDirectoryMembers(rows);
      } catch (e: any) {
        if (!cancelled) {
          setServerDirectoryMembers(null);
          notify(
            e.message ||
              "Server-side search failed; showing current network data.",
          );
        }
      }
    }, 220);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [view, query, profession, city, generation, lifeStatus]);
  const directoryResults = serverDirectoryMembers || filtered;
  const validationReport = useMemo(
    () => validateNetwork(members, relationships),
    [members, relationships],
  );
  const deceased = members.filter((m) => !!m.date_of_death).length,
    located = members.filter(
      (m) => Number.isFinite(m.latitude) && Number.isFinite(m.longitude),
    ).length;
  const upcoming = useMemo<UpcomingMilestone[]>(() => {
    if (cfg.network_template !== "family" || !cfg.family_milestones_enabled)
      return [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const byId = new Map(members.map((m) => [m.id, m]));
    const events: LifeEvent[] = [
      ...allLifeEvents.filter(
        (e) =>
          ["marriage", "family", "milestone"].includes(e.event_type) &&
          e.event_date,
      ),
      ...members
        .filter((m) => !m.date_of_death && m.date_of_birth)
        .map(
          (m) =>
            ({
              id: `birthday-${m.id}`,
              member_id: m.id,
              event_type: "birth",
              title: "Birthday",
              event_date: m.date_of_birth!,
              visibility: "member",
              created_at: m.date_of_birth!,
            }) as LifeEvent,
        ),
    ];
    return events
      .flatMap((event) => {
        const member = byId.get(event.member_id);
        if (!member || !event.event_date) return [];
        const source = new Date(`${event.event_date}T00:00:00`),
          nextDate = new Date(
            now.getFullYear(),
            source.getMonth(),
            source.getDate(),
          );
        if (nextDate < now) nextDate.setFullYear(nextDate.getFullYear() + 1);
        const daysAway = Math.round(
          (nextDate.getTime() - now.getTime()) / 86400000,
        );
        return daysAway <= 30 ? [{ event, member, nextDate, daysAway }] : [];
      })
      .sort((a, b) => a.daysAway - b.daysAway);
  }, [
    members,
    allLifeEvents,
    cfg.network_template,
    cfg.family_milestones_enabled,
  ]);
  const focus = (m: Member) => {
    setSelected(null);
    setView("tree");
    setFocusId(m.id);
    setLineageOnly(true);
    setQuery("");
  };
  const clearFocus = () => {
    setFocusId(undefined);
    setLineageOnly(false);
  };
  const importData = async (ms: Member[], rs: Relationship[]) => {
    try {
      const report = validateImportRows(ms, rs, members, relationships);
      if (report.errors.length)
        throw new Error(
          report.errors
            .slice(0, 8)
            .map((x) => x.message)
            .join("\n"),
        );
      if (repository.mode === "shared") {
        if (auth?.role !== "admin")
          throw new Error("Admin access is required for bulk import.");
        await repository.upsertMembers(ms);
        await repository.mergeRelationships(rs);
        await repository.logAudit("hierarchy_import", {
          member_count: ms.length,
          relationship_count: rs.length,
          warnings: report.warnings.length,
        });
        await refresh();
      } else {
        setMembers((current) => {
          const byId = new Map(current.map((m) => [m.id, m]));
          ms.forEach((m) => byId.set(m.id, m));
          return Array.from(byId.values());
        });
        setRelationships((current) => {
          const byKey = new Map(
            current.map((r) => [
              `${r.relationship_type}|${r.person_id}|${r.related_person_id}`,
              r,
            ]),
          );
          rs.forEach((r) =>
            byKey.set(
              `${r.relationship_type}|${r.person_id}|${r.related_person_id}`,
              r,
            ),
          );
          return Array.from(byKey.values());
        });
        clearFocus();
      }
      notify(
        `Validated and imported ${ms.length} members and ${rs.length} relationships.${report.warnings.length ? ` ${report.warnings.length} warning(s) were reviewed.` : ""}`,
      );
    } catch (e: any) {
      notify(e.message || "Import failed.");
    }
  };
  const submitProfile = async (s: Submission) => {
    try {
      if (repository.mode === "shared") await repository.createSubmission(s);
      else
        setChangeRequests((x) => [
          {
            id: uuid(),
            action: s.member_id ? "update_member" : "create_member",
            target_member_id: s.member_id,
            payload: { submission_id: s.id },
            status: "pending",
            created_at: s.created_at,
          },
          ...x,
        ]);
      setSubmissions((x) => [s, ...x]);
      notify(
        "Profile submitted for admin review and recorded as a change request.",
      );
    } catch (e: any) {
      notify(e.message || "Submission failed.");
    }
  };
  const approve = async (s: Submission) => {
    try {
      if (repository.mode === "shared") {
        if (auth?.role !== "admin") throw new Error("Admin access required.");
        let id = s.member_id;
        if (id)
          await repository.updateMember(id, {
            full_name: s.full_name,
            profession: s.profession,
            city: s.city,
            country: s.country,
            bio: s.bio,
            phone: s.phone,
            email: s.email,
            photo_url: s.photo_url,
            profile_visibility: s.profile_visibility || "member",
            contact_visibility: s.contact_visibility || "admin",
            profile_status: "approved",
          });
        else {
          id = uuid();
          await repository.upsertMembers([
            {
              id,
              full_name: s.full_name,
              profession: s.profession,
              city: s.city,
              country: s.country,
              bio: s.bio,
              phone: s.phone,
              email: s.email,
              photo_url: s.photo_url,
              generation_level: 5,
              profile_visibility: s.profile_visibility || "member",
              contact_visibility: s.contact_visibility || "admin",
              profile_status: "approved",
            },
          ]);
        }
        await repository.updateSubmission(s.id, "approved");
        const request = changeRequests.find(
          (r) => r.payload?.submission_id === s.id,
        );
        if (request)
          await repository.updateChangeRequest(
            request.id,
            "approved",
            "Profile submission approved.",
          );
        await refresh();
      } else {
        if (s.member_id)
          setMembers((ms) =>
            ms.map((m) =>
              m.id === s.member_id
                ? { ...m, ...s, profile_status: "approved" }
                : m,
            ),
          );
        else
          setMembers((ms) => [
            ...ms,
            {
              id: uuid(),
              full_name: s.full_name,
              profession: s.profession,
              city: s.city,
              country: s.country,
              bio: s.bio,
              phone: s.phone,
              email: s.email,
              generation_level: 5,
              profile_visibility: s.profile_visibility || "member",
              contact_visibility: s.contact_visibility || "admin",
              profile_status: "approved",
            },
          ]);
        setSubmissions((xs) =>
          xs.map((x) => (x.id === s.id ? { ...x, status: "approved" } : x)),
        );
        setChangeRequests((xs) =>
          xs.map((r) =>
            r.payload?.submission_id === s.id
              ? { ...r, status: "approved" }
              : r,
          ),
        );
      }
      notify("Submission approved.");
    } catch (e: any) {
      notify(e.message || "Approval failed.");
    }
  };
  const reject = async (s: Submission) => {
    try {
      if (repository.mode === "shared") {
        if (auth?.role !== "admin") throw new Error("Admin access required.");
        await repository.updateSubmission(s.id, "rejected");
        const request = changeRequests.find(
          (r) => r.payload?.submission_id === s.id,
        );
        if (request)
          await repository.updateChangeRequest(
            request.id,
            "rejected",
            "Profile submission rejected.",
          );
        await refresh();
      } else {
        setSubmissions((xs) =>
          xs.map((x) => (x.id === s.id ? { ...x, status: "rejected" } : x)),
        );
        setChangeRequests((xs) =>
          xs.map((r) =>
            r.payload?.submission_id === s.id
              ? { ...r, status: "rejected" }
              : r,
          ),
        );
      }
      notify("Submission rejected.");
    } catch (e: any) {
      notify(e.message || "Rejection failed.");
    }
  };
  const saveRel = async (r: Relationship) => {
    try {
      const report = validateNetwork(members, [...relationships, r]);
      if (report.errors.length) throw new Error(report.errors[0].message);
      if (repository.mode === "shared") {
        if (auth?.role !== "admin") throw new Error("Admin access required.");
        await repository.addRelationship(r);
      }
      setRelationships((rs) => [...rs, r]);
      notify("Relationship added and validated.");
    } catch (e: any) {
      notify(e.message || "Could not add relationship.");
    }
  };
  const removeRel = async (r: Relationship) => {
    try {
      if (repository.mode === "shared") {
        if (auth?.role !== "admin") throw new Error("Admin access required.");
        await repository.deleteRelationship(r.id);
      }
      setRelationships((rs) => rs.filter((x) => x.id !== r.id));
      notify("Relationship removed.");
    } catch (e: any) {
      notify(e.message || "Could not remove relationship.");
    }
  };
  const updateLivingSetting = async (patch: Partial<NetworkSettings>) => {
    if (!network) return;
    try {
      const next = { ...network, ...patch };
      if (repository.mode === "shared")
        await repository.saveNetworkSettings(next);
      else saveLocalNetwork(next);
      setNetwork(next);
      notify("Living Network settings saved.");
    } catch (e: any) {
      notify(e.message || "Could not save settings.");
    }
  };
  const exportCsv = () => {
    const h = [
      "id",
      "full_name",
      "generation_level",
      "profession",
      "city",
      "country",
      "date_of_birth",
      "date_of_death",
      "photo_url",
      "bio",
      "phone",
      "email",
      "latitude",
      "longitude",
      "profile_status",
    ];
    downloadText(
      `${(network?.name || "network").replace(/\W+/g, "-").toLowerCase()}-members.csv`,
      [
        h.join(","),
        ...members.map((m) =>
          h.map((k) => esc(String((m as any)[k] ?? ""))).join(","),
        ),
      ].join("\n"),
      "text/csv",
    );
  };
  const exportJson = () =>
    downloadText(
      `${(network?.name || "network").replace(/\W+/g, "-").toLowerCase()}.json`,
      JSON.stringify({ network, members, relationships }, null, 2),
      "application/json",
    );
  const exportSvg = () => {
    const width = 1400,
      height = Math.max(900, Math.ceil(members.length / 4) * 150);
    const byGen = new Map<number, Member[]>();
    members.forEach((m) => {
      const a = byGen.get(m.generation_level) || [];
      a.push(m);
      byGen.set(m.generation_level, a);
    });
    const rows = [...byGen.entries()].sort((a, b) => a[0] - b[0]);
    let body = "";
    rows.forEach(([g, ms], ri) =>
      ms.forEach((m, ci) => {
        const x = 80 + ci * 320,
          y = 80 + ri * 150;
        body += `<g><rect x=\"${x}\" y=\"${y}\" width=280 height=100 rx=14 fill=\"#ffffff\" stroke=\"#d9dfeb\"/><text x=\"${x + 18}\" y=\"${y + 32}\" font-family=\"Arial,sans-serif\" font-size=18 font-weight=700 fill=\"#172033\">${String(m.full_name).replace(/[&<>]/g, (c) => (({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }) as any)[c])}</text><text x=\"${x + 18}\" y=\"${y + 57}\" font-family=\"Arial,sans-serif\" font-size=13 fill=\"#596579\">Generation ${g}</text><text x=\"${x + 18}\" y=\"${y + 79}\" font-family=\"Arial,sans-serif\" font-size=12 fill=\"#596579\">${String([m.city, m.country].filter(Boolean).join(", ")).replace(/[&<>]/g, (c) => (({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }) as any)[c])}</text></g>`;
      }),
    );
    const svg = `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"${width}\" height=\"${height}\" viewBox=\"0 0 ${width} ${height}\"><rect width=\"100%\" height=\"100%\" fill=\"#f6f8fb\"/><text x=\"40\" y=\"40\" font-family=\"Arial,sans-serif\" font-size=24 font-weight=700 fill=\"#172033\">${network?.name || "Hierarchy Network"}</text>${body}</svg>`;
    downloadText(
      `${(network?.name || "network").replace(/\W+/g, "-").toLowerCase()}-hierarchy.svg`,
      svg,
      "image/svg+xml",
    );
  };
  if (!ready)
    return (
      <div className="loading-screen">
        <TreePine size={30} />
        <div>
          <b>Hierarchy Network</b>
          <div className="page-subtitle">Starting…</div>
        </div>
      </div>
    );
  if (isSupabaseConfigured && !auth)
    return (
      <div className="landing">
        <div className="landing-card">
          <div className="brand-mark">
            <TreePine size={24} />
          </div>
          <h1>Hierarchy Network</h1>
          <p>Private shared hierarchy. Sign in to view the official network.</p>
          <button className="btn primary" onClick={() => setShowAuth(true)}>
            Sign In / Create Account
          </button>
        </div>
        {showAuth && (
          <AuthPanel
            onDone={async () => {
              setShowAuth(false);
              try {
                await hydrate(await getAuthUser());
              } catch (e: any) {
                notify(e.message || "Could not sign in.");
              }
            }}
          />
        )}
      </div>
    );
  const canAdmin = !isSupabaseConfigured || auth?.role === "admin";
  if (setupNeeded)
    return (
      <>
        <SetupScreen
          shared={isSupabaseConfigured}
          canSetup={canAdmin}
          onCreate={createNetwork}
        />
        {toast && (
          <div
            style={{
              position: "fixed",
              bottom: 20,
              right: 20,
              zIndex: 100,
              padding: "12px 15px",
              background: "#172033",
              color: "#fff",
              borderRadius: 10,
              fontSize: 13,
            }}
          >
            {toast}
          </div>
        )}
      </>
    );
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <TreePine size={20} />
          </div>
          <span>{network?.name || "Hierarchy Network"}</span>
          <span
            className={`mode-pill ${isSupabaseConfigured ? "shared" : "demo"}`}
          >
            {isSupabaseConfigured ? (
              <>
                <Database size={12} /> Shared
              </>
            ) : (
              <>Local</>
            )}
          </span>
        </div>
        <div className="top-actions">
          {isSupabaseConfigured && (
            <span className="person-meta">
              {auth?.email} · {auth?.role}
            </span>
          )}
          <select
            className="select"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as Visibility)}
          >
            <option value="public">Preview: Public</option>
            <option value="member">View: Member</option>
            <option value="admin">View: Admin</option>
          </select>
          <button className="btn small" onClick={() => setShowGuide(true)}>
            <BookOpen size={15} /> Guide
          </button>
          {isSupabaseConfigured && (
            <button
              className="btn small"
              onClick={() => {
                signOut();
                setAuth(null);
              }}
            >
              <LogOut size={15} /> Sign out
            </button>
          )}
          <button
            className="btn small"
            onClick={() => {
              if (auth?.member_id) {
                const mine = members.find((m) => m.id === auth.member_id);
                if (mine) {
                  setSelected(mine);
                  setEditingMember(mine);
                } else {
                  setEditingMember(undefined);
                  setShowForm(true);
                }
              } else setShowForm(true);
            }}
          >
            <UserRoundPen size={15} />{" "}
            {auth?.member_id
              ? "My Profile"
              : cfg.network_template === "family"
                ? "Add Relative"
                : `Submit ${cfg.entity_label}`}
          </button>
        </div>
      </header>
      <div className="layout">
        <aside className="sidebar">
          <button
            className={`nav-btn ${view === "tree" ? "active" : ""}`}
            onClick={() => setView("tree")}
          >
            <TreePine size={17} /> Hierarchy
          </button>
          <button
            className={`nav-btn ${view === "directory" ? "active" : ""}`}
            onClick={() => setView("directory")}
          >
            <Users size={17} /> Directory
          </button>
          <button
            className={`nav-btn ${view === "timeline" ? "active" : ""}`}
            onClick={() => setView("timeline")}
          >
            <CalendarDays size={17} /> Timeline
          </button>
          <button
            className={`nav-btn ${view === "map" ? "active" : ""}`}
            onClick={() => setView("map")}
          >
            <MapPinned size={17} /> Location Map
          </button>
          <button
            className={`nav-btn ${view === "community" ? "active" : ""}`}
            onClick={() => setView("community")}
          >
            <HeartHandshake size={17} /> Community
          </button>
          {canAdmin && (
            <button
              className={`nav-btn ${view === "admin" ? "active" : ""}`}
              onClick={() => setView("admin")}
            >
              <ShieldCheck size={17} /> Administration
            </button>
          )}
          <div
            style={{
              margin: "22px 10px",
              paddingTop: 16,
              borderTop: "1px solid var(--line)",
              fontSize: 11,
              color: "var(--muted)",
              lineHeight: 1.7,
            }}
          >
            <strong>
              {isSupabaseConfigured ? "Shared network" : "Local network"}
            </strong>
            <br />
            {members.length} {cfg.entity_label_plural.toLowerCase()} ·{" "}
            {new Set(members.map((m) => m.generation_level)).size}{" "}
            {cfg.level_label_plural.toLowerCase()}
            <br />
            {relationships.length} relationships
            <br />
            {deceased} in memoriam · {located} mapped
          </div>
        </aside>
        <main className="main">
          <UpcomingWidget items={upcoming} onSelect={setSelected} />
          {view === "tree" && (
            <section>
              {cfg.network_template === "family" && (
                <div className="family-welcome">
                  <div>
                    <span className="family-welcome-kicker">
                      Your family, together
                    </span>
                    <h1>{network?.name}</h1>
                    <p>
                      Explore the generations, find someone you love, and help
                      preserve the stories that connect you.
                    </p>
                  </div>
                  <div className="family-welcome-stats">
                    <span>
                      <b>{members.length}</b> people
                    </span>
                    <span>
                      <b>
                        {new Set(members.map((m) => m.generation_level)).size}
                      </b>{" "}
                      generations
                    </span>
                    <span>
                      <b>{relationships.length}</b> connections
                    </span>
                  </div>
                </div>
              )}
              <div className="page-head">
                <div>
                  <h2 className="page-title">
                    {cfg.network_template === "family"
                      ? "Family Tree"
                      : "Hierarchy"}
                  </h2>
                  <p className="page-subtitle">
                    Find a person, tap their card, or focus on one branch to
                    explore comfortably.
                  </p>
                </div>
                <div className="card-actions">
                  <button
                    className="btn small"
                    onClick={() => setShowDeceased((x) => !x)}
                  >
                    <HeartHandshake size={14} />{" "}
                    {showDeceased ? "Hide deceased" : "Show deceased"}
                  </button>
                  {focusId && (
                    <button className="btn small" onClick={clearFocus}>
                      <GitBranch size={14} /> Full Tree
                    </button>
                  )}
                  <button
                    className="btn small"
                    disabled={!focusId}
                    onClick={() => setLineageOnly((x) => !x)}
                  >
                    <Eye size={14} />{" "}
                    {lineageOnly ? "Focused lineage" : "Lineage focus"}
                  </button>
                </div>
              </div>
              <div className="search-bar">
                <Search size={18} color="#7a8496" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, profession or location…"
                />
                {query && (
                  <button className="btn small" onClick={() => setQuery("")}>
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="notice">
                {filtered.length} members shown ·{" "}
                {focusId
                  ? `Focused branch: ${lineageIds.size} connected people.`
                  : "Full community hierarchy."}
              </div>
              <TreeView
                members={filtered.filter(
                  (m) => showDeceased || !m.date_of_death,
                )}
                relationships={relationships.filter((r) => {
                  const shown = new Set(
                    filtered
                      .filter((m) => showDeceased || !m.date_of_death)
                      .map((m) => m.id),
                  );
                  return (
                    shown.has(r.person_id) && shown.has(r.related_person_id)
                  );
                })}
                query={query || profession || city}
                focusMemberId={focusId}
                onSelect={setSelected}
                network={network}
              />
            </section>
          )}
          {view === "directory" && (
            <section>
              <div className="page-head">
                <div>
                  <h1 className="page-title">
                    {cfg.network_template === "family"
                      ? "Family Directory"
                      : `${cfg.entity_label_plural} Directory`}
                  </h1>
                  <p className="page-subtitle">
                    Find relatives by name, profession or location.
                  </p>
                </div>
                <button
                  className="btn primary"
                  onClick={() => setShowForm(true)}
                >
                  <Plus size={15} />{" "}
                  {cfg.network_template === "family"
                    ? "Add Relative"
                    : `Submit ${cfg.entity_label}`}
                </button>
              </div>
              <div className="search-bar">
                <Search size={18} color="#7a8496" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search members…"
                />
              </div>
              <div className="filters">
                <select
                  className="select"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                >
                  <option value="">All professions</option>
                  {professions.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
                <select
                  className="select"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  <option value="">All locations</option>
                  {cities.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <select
                  className="select"
                  value={generation}
                  onChange={(e) => setGeneration(e.target.value)}
                >
                  <option value="">
                    All {cfg.level_label_plural.toLowerCase()}
                  </option>
                  {Array.from(new Set(members.map((m) => m.generation_level)))
                    .sort((a, b) => a - b)
                    .map((g) => (
                      <option key={g} value={g}>
                        {cfg.level_label} {g}
                      </option>
                    ))}
                </select>
                <select
                  className="select"
                  value={lifeStatus}
                  onChange={(e) => setLifeStatus(e.target.value as any)}
                >
                  <option value="all">Living + In memoriam</option>
                  <option value="living">Living</option>
                  <option value="deceased">In memoriam</option>
                </select>
                <button
                  className="btn small"
                  onClick={() => {
                    setQuery("");
                    setProfession("");
                    setCity("");
                    setGeneration("");
                    setLifeStatus("all");
                  }}
                >
                  <RotateCcw size={14} /> Clear
                </button>
              </div>
              <p className="page-subtitle" style={{ marginBottom: 12 }}>
                {directoryResults.length} of {members.length}{" "}
                {cfg.entity_label_plural.toLowerCase()}
                {repository.mode === "shared" && serverDirectoryMembers
                  ? " · server search"
                  : ""}
              </p>
              <div className="results-grid">
                {directoryResults.map((m) => (
                  <div className="person-card card" key={m.id}>
                    <div
                      className={`avatar ${m.date_of_death ? "grayscale" : ""}`}
                    >
                      {m.photo_url ? (
                        <img
                          src={m.photo_url}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        m.full_name
                          .split(/\s+/)
                          .slice(0, 2)
                          .map((x) => x[0])
                          .join("")
                          .toUpperCase()
                      )}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="person-name">
                        {m.full_name}
                        {m.date_of_death && (
                          <span className="person-meta"> · In memoriam</span>
                        )}
                      </div>
                      <div className="person-meta">
                        {m.profession || cfg.entity_label}
                        <br />
                        {[m.city, m.country].filter(Boolean).join(", ")}
                        <br />
                        {cfg.level_label} {m.generation_level}
                      </div>
                      <div className="card-actions">
                        <button
                          className="btn small primary"
                          onClick={() => setSelected(m)}
                        >
                          View Profile
                        </button>
                        <button className="btn small" onClick={() => focus(m)}>
                          Focus Lineage
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
          {view === "timeline" && (
            <TimelineView
              events={allLifeEvents}
              members={members}
              network={network}
              onSelect={setSelected}
            />
          )}
          {view === "map" && (
            <section>
              <div className="page-head">
                <div>
                  <h1 className="page-title">Location Map</h1>
                  <p className="page-subtitle">
                    City-level locations. Marker size represents the number of
                    members in a city.
                  </p>
                </div>
              </div>
              <div className="notice">
                <b>Privacy:</b> only city-level coordinates are shown. {located}{" "}
                of {members.length} members have coordinates.
              </div>
              <MapView members={members} onSelect={setSelected} />
            </section>
          )}
          {view === "community" && (
            <CommunityHub
              members={members}
              auth={auth}
              onSelect={(m) => setSelected(m)}
              onNotify={notify}
            />
          )}
          {view === "admin" && canAdmin && (
            <section>
              <div className="page-head">
                <div>
                  <h1 className="page-title">Administration</h1>
                  <p className="page-subtitle">
                    Manage shared data, relationships, approvals and P4.1
                    governance.
                  </p>
                </div>
              </div>
              <div className="admin-grid">
                <div className="card stat">
                  <div className="stat-label">Members</div>
                  <div className="stat-number">{members.length}</div>
                </div>
                <div className="card stat">
                  <div className="stat-label">Relationships</div>
                  <div className="stat-number">{relationships.length}</div>
                </div>
                <div className="card stat">
                  <div className="stat-label">Pending profiles</div>
                  <div className="stat-number">
                    {submissions.filter((s) => s.status === "pending").length}
                  </div>
                </div>
                <div className="card stat">
                  <div className="stat-label">Integrity</div>
                  <div className="stat-number" style={{ fontSize: 18 }}>
                    {validationReport.valid
                      ? "Healthy"
                      : `${validationReport.errors.length} errors`}
                  </div>
                </div>
              </div>
              <div className="card governance-card">
                <div className="governance-head">
                  <div>
                    <h3 style={{ margin: 0 }}>Living Network</h3>
                    <p className="page-subtitle">
                      Field-aware participation and family-module milestones.
                    </p>
                  </div>
                  <Settings2 size={18} />
                </div>
                <label className="living-setting">
                  <span>
                    <b>Direct-save safe self edits</b>
                    <small>
                      Profession, location, bio, contact details and owned photo
                      only.
                    </small>
                  </span>
                  <input
                    type="checkbox"
                    checked={cfg.self_edit_mode === "safe_fields_direct"}
                    onChange={(e) =>
                      updateLivingSetting({
                        self_edit_mode: e.target.checked
                          ? "safe_fields_direct"
                          : "review",
                      })
                    }
                  />
                </label>
                {cfg.network_template === "family" && (
                  <label className="living-setting">
                    <span>
                      <b>Upcoming family milestones</b>
                      <small>
                        Birthdays and family events in the next 30 days.
                      </small>
                    </span>
                    <input
                      type="checkbox"
                      checked={cfg.family_milestones_enabled}
                      onChange={(e) =>
                        updateLivingSetting({
                          family_milestones_enabled: e.target.checked,
                        })
                      }
                    />
                  </label>
                )}
              </div>
              <div className="card governance-card">
                <div className="governance-head">
                  <div>
                    <h3 style={{ margin: 0 }}>Public Page</h3>
                    <p className="page-subtitle">
                      A shareable read-only directory for members who have set
                      their profile visibility to Public. No sign-in required.
                    </p>
                  </div>
                  <Eye size={18} />
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <code
                    style={{
                      fontSize: 12,
                      padding: "6px 10px",
                      background: "var(--bg)",
                      borderRadius: 6,
                      border: "1px solid var(--line)",
                      flex: 1,
                      minWidth: 0,
                      wordBreak: "break-all",
                    }}
                  >
                    {typeof window !== "undefined"
                      ? window.location.origin
                      : ""}
                    /public
                  </code>
                  <button
                    className="btn small"
                    onClick={() => {
                      if (typeof window !== "undefined")
                        navigator.clipboard
                          ?.writeText(window.location.origin + "/public")
                          .then(() => notify("Public URL copied."));
                    }}
                  >
                    Copy
                  </button>
                  <a
                    className="btn small"
                    href="/public"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink size={13} /> Preview
                  </a>
                </div>
                <p className="page-subtitle" style={{ marginTop: 10 }}>
                  Members control visibility from their own profile. Profiles
                  set to "Members" or "Admins only" are hidden from this page.
                </p>
              </div>
              <div className="card governance-card">
                <div className="governance-head">
                  <div>
                    <h3 style={{ margin: 0 }}>Data Integrity</h3>
                    <p className="page-subtitle">
                      P4.1 validates self-links, duplicate relationships, orphan
                      references, generation order, cycles and duplicate
                      identity signals.
                    </p>
                  </div>
                  {validationReport.valid ? (
                    <div className="validation-good">
                      <CheckCircle2 size={16} /> No blocking errors
                    </div>
                  ) : (
                    <div className="validation-bad">
                      <ShieldAlert size={16} /> {validationReport.errors.length}{" "}
                      errors
                    </div>
                  )}
                </div>
                {validationReport.warnings.length > 0 && (
                  <div className="notice warning-notice">
                    <AlertTriangle size={15} />{" "}
                    {validationReport.warnings.length} warning(s), including
                    possible duplicate identities or mixed-generation spouses.
                  </div>
                )}
                {validationReport.errors.slice(0, 6).map((x, i) => (
                  <div className="validation-issue error" key={i}>
                    <b>{x.code}</b>
                    <span>{x.message}</span>
                  </div>
                ))}
                {validationReport.warnings.slice(0, 6).map((x, i) => (
                  <div className="validation-issue warning" key={`w${i}`}>
                    <b>{x.code}</b>
                    <span>{x.message}</span>
                  </div>
                ))}
                {validationReport.errors.length +
                  validationReport.warnings.length ===
                  0 && (
                  <div className="empty compact">
                    The current hierarchy passed the P4.1 integrity checks.
                  </div>
                )}
              </div>
              <div className="card governance-card">
                <div className="governance-head">
                  <div>
                    <h3 style={{ margin: 0 }}>Change Requests</h3>
                    <p className="page-subtitle">
                      Profile submissions are now represented in the generalized
                      change-request model.
                    </p>
                  </div>
                  <ClipboardCheck size={18} />
                </div>
                {changeRequests.length === 0 && (
                  <div className="empty compact">No change requests yet.</div>
                )}
                {changeRequests.slice(0, 12).map((r) => (
                  <div className="governance-row" key={r.id}>
                    <div>
                      <b>{r.action.replaceAll("_", " ")}</b>
                      <div className="person-meta">
                        {r.status} · {new Date(r.created_at).toLocaleString()}
                        {r.target_member_id ? ` · ${r.target_member_id}` : ""}
                      </div>
                    </div>
                    <span className={`status-pill ${r.status}`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
              <div className="card governance-card">
                <div className="governance-head">
                  <div>
                    <h3 style={{ margin: 0 }}>Audit Log</h3>
                    <p className="page-subtitle">
                      Administrative and contribution actions are recorded in
                      the database.
                    </p>
                  </div>
                  <ShieldCheck size={18} />
                </div>
                {auditLog.length === 0 && (
                  <div className="empty compact">No audit events yet.</div>
                )}
                {auditLog.slice(0, 12).map((a) => (
                  <div className="governance-row" key={a.id}>
                    <div>
                      <b>{a.action.replaceAll("_", " ")}</b>
                      <div className="person-meta">
                        {new Date(a.created_at).toLocaleString()} ·{" "}
                        {a.actor_id || "system"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="card governance-card">
                <h3 style={{ marginTop: 0 }}>Member Invitations</h3>
                <p className="page-subtitle">
                  Invite an existing hierarchy member to claim their profile and
                  create an account.
                </p>
                <div className="card-actions">
                  <button
                    className="btn primary"
                    onClick={() => setShowInvitation(true)}
                  >
                    Create Invitation Link
                  </button>
                </div>
              </div>
              <AnalyticsPanel onNotify={notify} />
              <div className="card governance-card">
                <h3 style={{ marginTop: 0 }}>Shared Data</h3>
                <p className="page-subtitle">
                  Imports merge/upsert records and never silently delete
                  existing relationships. Database rules now reject self-links
                  and parent/child cycles. Non-UUID source IDs remain safely
                  mapped to UUIDs.
                </p>
                <div className="card-actions">
                  <button
                    className="btn primary"
                    onClick={() => setShowImport(true)}
                  >
                    <Upload size={15} /> Import CSV / XLSX / XML
                  </button>
                  <button className="btn" onClick={exportCsv}>
                    <Download size={15} /> Export CSV
                  </button>
                  <button className="btn" onClick={exportJson}>
                    <Download size={15} /> Export JSON
                  </button>
                  <button className="btn" onClick={exportSvg}>
                    <Download size={15} /> Export SVG
                  </button>
                  <button className="btn" onClick={() => window.print()}>
                    <Download size={15} /> Print / PDF
                  </button>
                </div>
              </div>
              <div className="card governance-card">
                <h3 style={{ marginTop: 0 }}>Profile Submissions</h3>
                {submissions.length === 0 && (
                  <p className="page-subtitle">No submissions yet.</p>
                )}
                {submissions.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      padding: "13px 0",
                      borderBottom: "1px solid var(--line)",
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong>{s.full_name}</strong>
                      <div className="person-meta">
                        {[s.profession, s.city].filter(Boolean).join(" · ")} ·{" "}
                        {s.status}
                      </div>
                    </div>
                    {s.status === "pending" && (
                      <div className="card-actions">
                        <button
                          className="btn small primary"
                          onClick={() => approve(s)}
                        >
                          Approve
                        </button>
                        <button
                          className="btn small danger"
                          onClick={() => reject(s)}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
      <nav className="mobile-bottom-nav">
        {(
          [
            ["tree", "Hierarchy"],
            ["directory", "Directory"],
            ["timeline", "Timeline"],
            ["map", "Map"],
            ["community", "Community"],
          ] as const
        ).map(([v, label]) => (
          <button
            key={v}
            className={view === v ? "active" : ""}
            onClick={() => setView(v)}
          >
            {label}
          </button>
        ))}
        {canAdmin && (
          <button
            className={view === "admin" ? "active" : ""}
            onClick={() => setView("admin")}
          >
            Admin
          </button>
        )}
      </nav>
      {showInvitation && (
        <InvitationModal
          members={members.filter((m) => m.profile_status === "approved")}
          onClose={() => setShowInvitation(false)}
          onDone={notify}
        />
      )}{" "}
      {selected && (
        <ProfileDrawer
          member={selected}
          members={members}
          relationships={relationships}
          visibility={visibility}
          network={network}
          canViewPrivateContact={
            !isSupabaseConfigured ||
            auth?.role === "admin" ||
            selected.id === auth?.member_id
          }
          onClose={() => setSelected(null)}
          onSelect={setSelected}
          onFocus={focus}
          canEdit={canAdmin || selected?.id === auth?.member_id}
          onEdit={() => {
            setEditingMember(selected);
            setShowForm(true);
          }}
          onManageRelationships={() => setShowRelationships(true)}
          onExploreRelationship={() => setShowRelationshipExplorer(true)}
          events={lifeEvents}
          memories={memories.filter((m) => m.member_id === selected.id)}
          onAddEvent={() => {
            setEditingLifeEvent(undefined);
            setShowLifeEventEditor(true);
          }}
          onEditEvent={(e) => {
            setEditingLifeEvent(e);
            setShowLifeEventEditor(true);
          }}
        />
      )}{" "}
      {showRelationships && selected && (
        <RelationshipModal
          member={selected}
          members={members}
          relationships={relationships}
          network={network}
          onClose={() => setShowRelationships(false)}
          onSave={saveRel}
          onDelete={removeRel}
        />
      )}{" "}
      {showImport && (
        <ImportModal
          existingMembers={members}
          existingRelationships={relationships}
          onClose={() => setShowImport(false)}
          onImport={importData}
        />
      )}{" "}
      {showForm && (
        <ProfileForm
          member={editingMember}
          network={network}
          onClose={() => {
            setShowForm(false);
            setEditingMember(undefined);
          }}
          onSubmit={submitProfile}
        />
      )}{" "}
      {showRelationshipExplorer && selected && (
        <RelationshipExplorer
          members={members}
          relationships={relationships}
          from={selected}
          onClose={() => setShowRelationshipExplorer(false)}
          onSelect={(m) => {
            setShowRelationshipExplorer(false);
            setSelected(m);
          }}
        />
      )}{" "}
      {showLifeEventEditor && selected && (
        <LifeEventEditor
          member={selected}
          event={editingLifeEvent}
          onClose={() => setShowLifeEventEditor(false)}
          onSave={saveLifeEvent}
          onDelete={deleteLifeEvent}
        />
      )}{" "}
      {showGuide && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="drawer-head">
              <h2 style={{ margin: 0 }}>User Guide</h2>
              <button className="btn small" onClick={() => setShowGuide(false)}>
                Close
              </button>
            </div>
            <p>
              <b>Network:</b> this installation can represent any named
              hierarchy, not only a family. The name is chosen during first-run
              setup.
            </p>
            <p>
              <b>Data:</b> start empty, load the fixed 150-member demo, or
              import CSV/XLSX/XML. No random records are generated.
            </p>
            <p>
              <b>IDs:</b> imported source IDs are treated as external
              references. PostgreSQL always receives UUIDs.
            </p>
            <p>
              <b>Integrity:</b> P4.1 validates duplicate identities, orphan
              links, self-links, generation order and parent/child cycles before
              imports and relationship changes.
            </p>
            <p>
              <b>Privacy:</b> regular members cannot directly read phone/email
              from the member table. The app retrieves a role-aware database
              projection; administrators can view private contact fields.
            </p>
            <p>
              <b>Governance:</b> profile submissions create generalized change
              requests and important actions are recorded in the audit log.
            </p>
            <p>
              <b>Hierarchy:</b> solid lines are parent/child; dashed lines are
              spouse; siblings are derived from shared parents.
            </p>
            <p>
              <b>Lineage:</b> choose a person, then Focus Lineage. The focused
              set contains ancestors, descendants, siblings and relevant
              spouses.
            </p>
            <p>
              <b>Relationship intelligence:</b> open a profile and choose How am
              I related? to find the shortest recorded path and a plain-language
              kinship when the graph supports it.
            </p>
            <p>
              <b>Life timeline:</b> profiles can contain simple life events such
              as marriages, moves, milestones and family moments. Visibility is
              controlled per event.
            </p>
            <p>
              <b>Map:</b> locations are city-level. Markers are grouped by city
              and sized by member count.
            </p>
            <p>
              <b>In memoriam:</b> a date of death marks a person as deceased;
              hiding them never deletes their relationships.
            </p>
            <p>
              <b>Community:</b> members can share simple memories and stories.
              Administrators can attach memories to another member; visibility
              controls determine who can see them.
            </p>
            <p>
              <b>Updates:</b> approvals and other account activity can appear in
              the Community updates panel.
            </p>
            <p>
              <b>Shared mode:</b> Supabase is the canonical database. Vercel
              only hosts the Next.js application.
            </p>
          </div>
        </div>
      )}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 100,
            padding: "12px 15px",
            background: "#172033",
            color: "#fff",
            borderRadius: 10,
            fontSize: 13,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
