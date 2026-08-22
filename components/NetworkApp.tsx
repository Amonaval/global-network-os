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
  ArrowRight,
  Menu,
  Home,
} from "lucide-react";
import TreeView from "./TreeView";
import ProfileDrawer from "./ProfileDrawer";
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
import ParticipationCenter from "./ParticipationCenter";
import FamilyHome from "./FamilyHome";
import FamilySwitcher from "./FamilySwitcher";
import FamilyAdminCenter from "./FamilyAdminCenter";
import { createFamily as createSharedFamily } from "../lib/remote";
import { validateImportRows, validateNetwork } from "../lib/validation";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "../lib/i18n";
const MapView = dynamic(() => import("./MapView"), { ssr: false });
const ImportModal = dynamic(() => import("./ImportModal"), { ssr: false });
const repository = getNetworkRepository();
type View = "home" | "tree" | "directory" | "map" | "community" | "timeline" | "participation" | "admin";
type Visibility = "public" | "member" | "admin";
const esc = (v: string) => `"${String(v ?? "").replaceAll('"', '""')}"`;
const uuid = () =>
  globalThis.crypto?.randomUUID?.() ||
  "00000000-0000-4000-8000-" +
    Math.random().toString(16).slice(2).padEnd(12, "0").slice(0, 12);

export default function NetworkApp() {
  const { t, language } = useLanguage();
  const moreLabel = language === "hi" ? "और" : language === "mr" ? "अधिक" : "More";
  const directoryCopy = language === "hi"
    ? { title:"परिवार के सदस्य", subtitle:"नाम, पेशे या स्थान से रिश्तेदार खोजें।", search:"परिवार में खोजें…", professions:"सभी पेशे", locations:"सभी स्थान", generations:"सभी पीढ़ियाँ", allLife:"जीवित + स्मृति में", living:"जीवित", memorial:"स्मृति में", clear:"हटाएँ", of:"में से", view:"प्रोफ़ाइल देखें", focus:"शाखा देखें" }
    : language === "mr"
      ? { title:"कुटुंब सदस्य", subtitle:"नाव, व्यवसाय किंवा ठिकाणाने नातेवाईक शोधा.", search:"कुटुंबात शोधा…", professions:"सर्व व्यवसाय", locations:"सर्व ठिकाणे", generations:"सर्व पिढ्या", allLife:"हयात + स्मरणार्थ", living:"हयात", memorial:"स्मरणार्थ", clear:"साफ करा", of:"पैकी", view:"प्रोफाइल पहा", focus:"शाखा पहा" }
      : { title:"Family Directory", subtitle:"Find relatives by name, profession or location.", search:"Search family members…", professions:"All professions", locations:"All locations", generations:"All generations", allLife:"Living + In memoriam", living:"Living", memorial:"In memoriam", clear:"Clear", of:"of", view:"View profile", focus:"View branch" };
  const helpCopy = language === "hi" ? { title:"परिवार उपयोग सहायता", close:"बंद करें", intro:"यहाँ सबसे जरूरी काम आसानी से किए जा सकते हैं:", items:["परिवार वृक्ष: खोजें, किसी व्यक्ति पर टैप करें और उनकी पारिवारिक शाखा देखें।","परिवार: नाम, शहर या पेशे से रिश्तेदार खोजें।","प्रोफ़ाइल: अपनी जानकारी, तस्वीर और रिश्ते देखें या अपडेट का अनुरोध करें।","Excel: मार्गदर्शित workbook डाउनलोड करें और जोड़ने से पहले हर व्यक्ति व रिश्ता जाँचें।","गोपनीयता: निजी संपर्क केवल परिवार द्वारा अनुमति प्राप्त लोगों को दिखते हैं।","और: स्थान, भाषा, सहायता, privacy preview और family settings यहाँ मिलते हैं।"] } : language === "mr" ? { title:"कुटुंब वापर मदत", close:"बंद करा", intro:"येथे महत्त्वाची कामे सहज करता येतात:", items:["कुटुंब वृक्ष: शोधा, व्यक्तीवर टॅप करा आणि त्यांची कौटुंबिक शाखा पहा.","कुटुंब: नाव, शहर किंवा व्यवसायाने नातेवाईक शोधा.","प्रोफाइल: आपली माहिती, छायाचित्र आणि नाती पहा किंवा बदल सुचवा.","Excel: मार्गदर्शित workbook डाउनलोड करा आणि जोडण्याआधी प्रत्येक व्यक्ती व नाते तपासा.","गोपनीयता: खाजगी संपर्क फक्त कुटुंबाने परवानगी दिलेल्या लोकांना दिसतात.","अधिक: ठिकाणे, भाषा, मदत, privacy preview आणि family settings येथे आहेत."] } : { title:"Family help", close:"Close", intro:"The most important things are easy to find:", items:["Family Tree: search, tap a person and explore their family branch.","Family: find relatives by name, city or profession.","Profile: view your information, photo and relationships or ask for an update.","Excel: download the guided workbook and review every person and relationship before adding them.","Privacy: private contact details are shown only to people your family allows.","More: find Places, language, Help, information preview and family settings here."] };
  const mapCopy = language === "hi" ? { title:"परिवार कहाँ रहता है", subtitle:"शहर के स्तर पर परिवार के स्थान। बड़े निशान उस शहर में अधिक सदस्यों को दिखाते हैं।", privacy:"गोपनीयता:", detail:"केवल शहर का स्थान दिखाया जाता है।", have:"सदस्यों के स्थान उपलब्ध हैं।" } : language === "mr" ? { title:"कुटुंब कुठे राहते", subtitle:"शहर पातळीवरील कौटुंबिक ठिकाणे. मोठे चिन्ह त्या शहरात अधिक सदस्य दाखवते.", privacy:"गोपनीयता:", detail:"फक्त शहराचे ठिकाण दाखवले जाते.", have:"सदस्यांची ठिकाणे उपलब्ध आहेत." } : { title:"Where our family lives", subtitle:"City-level family locations. Larger markers mean more relatives in that city.", privacy:"Privacy:", detail:"Only city-level locations are shown.", have:"members have locations." };
  const [network, setNetwork] = useState<NetworkSettings | null>(null),
    [view, setView] = useState<View>("home"),
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
    [showRelationships, setShowRelationships] = useState(false),
    [showMobileMenu, setShowMobileMenu] = useState(false);
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
      if (u?.role === "admin" || n?.membership_role === "owner" || n?.membership_role === "admin") {
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
  useEffect(() => {
    if (!showMobileMenu) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setShowMobileMenu(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [showMobileMenu]);
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
      const networkId = await createSharedFamily(settings.name, undefined, settings.description || "");
      settings = {...settings, network_id: networkId, membership_role: "owner"};
      await repository.saveNetworkSettings(settings);
      if (nextM.length) {
        await repository.upsertMembers(nextM);
        await repository.mergeRelationships(nextR);
      }
      await refresh();
      setNetwork(await repository.fetchNetworkSettings());
      setAuth(await getAuthUser());
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
              avatar_style: s.avatar_style, facebook_url:s.facebook_url, facebook_public:s.facebook_public, instagram_url:s.instagram_url, instagram_public:s.instagram_public, other_social_url:s.other_social_url, other_social_label:s.other_social_label, other_social_public:s.other_social_public,
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
        <div className="loading-mark"><TreePine size={30} /></div>
        <div>
          <b>Our Family</b>
          <div className="page-subtitle">{t("loading")}</div>
        </div>
      </div>
    );
  if (isSupabaseConfigured && !auth)
    return (
      <div className="landing family-signin-page">
        <div className="landing-card family-signin-card">
          <div className="brand-mark">
            <TreePine size={24} />
          </div>
          <span className="warm-kicker">A private place for your people</span>
          <h1>Welcome to your family</h1>
          <p>Sign in to explore your family tree, profiles, relationships and shared memories.</p>
          <button className="btn primary" onClick={() => setShowAuth(true)}>
            Join or sign in <ArrowRight size={16} />
          </button>
          <LanguageSwitcher />
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
  const canAdmin = !isSupabaseConfigured || network?.membership_role === "owner" || network?.membership_role === "admin" || auth?.role === "admin";
  const canSetupFamily = !isSupabaseConfigured || !!auth;
  if (setupNeeded)
    return (
      <>
        <SetupScreen
          shared={isSupabaseConfigured}
          canSetup={canSetupFamily}
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
          <span>{network?.name || "Our Family"}</span>
          <span
            className={`mode-pill ${isSupabaseConfigured ? "shared" : "demo"}`}
          >
            {isSupabaseConfigured ? (
              <>
                <Database size={12} /> {t("sharedFamily")}
              </>
            ) : (
              <>{t("localFamily")}</>
            )}
          </span>
        </div>
        <div className="top-actions">
          {isSupabaseConfigured && <FamilySwitcher onSwitched={async()=>{await hydrate(await getAuthUser());setView("home");}} onCreate={()=>setSetupNeeded(true)} />}
          <LanguageSwitcher compact />
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
            <option value="public">{t("publicPreview")}</option>
            <option value="member">{t("memberView")}</option>
            <option value="admin">{t("adminView")}</option>
          </select>
          <button className="btn small" onClick={() => setShowGuide(true)}>
            <BookOpen size={15} /> {t("guide")}
          </button>
          {isSupabaseConfigured && (
            <button
              className="btn small"
              onClick={() => {
                signOut();
                setAuth(null);
              }}
            >
              <LogOut size={15} /> {t("signOut")}
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
              ? t("myProfile")
              : cfg.network_template === "family"
                ? t("addRelative")
                : `Submit ${cfg.entity_label}`}
          </button>
        </div>
      </header>
      <div className="layout">
        <aside className="sidebar">
          <button className={`nav-btn ${view === "home" ? "active" : ""}`} onClick={() => setView("home")}><Home size={17} /> {language === "hi" ? "आज" : language === "mr" ? "आज" : "Home"}</button>
          <button
            className={`nav-btn ${view === "tree" ? "active" : ""}`}
            onClick={() => setView("tree")}
          >
            <TreePine size={17} /> {t("familyTree")}
          </button>
          <button
            className={`nav-btn ${view === "directory" ? "active" : ""}`}
            onClick={() => setView("directory")}
          >
            <Users size={17} /> {t("familyDirectory")}
          </button>
          <button
            className={`nav-btn ${view === "timeline" ? "active" : ""}`}
            onClick={() => setView("timeline")}
          >
            <CalendarDays size={17} /> {t("timeline")}
          </button>
          <button
            className={`nav-btn ${view === "map" ? "active" : ""}`}
            onClick={() => setView("map")}
          >
            <MapPinned size={17} /> {t("places")}
          </button>
          <button
            className={`nav-btn ${view === "community" ? "active" : ""}`}
            onClick={() => setView("community")}
          >
            <HeartHandshake size={17} /> {t("stories")}
          </button>
          <button
            className={`nav-btn ${view === "participation" ? "active" : ""}`}
            onClick={() => setView("participation")}
          >
            <GitBranch size={17} /> Participate
          </button>
          {canAdmin && (
            <button
              className={`nav-btn ${view === "admin" ? "active" : ""}`}
              onClick={() => setView("admin")}
            >
              <ShieldCheck size={17} /> {t("familySettings")}
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
              {isSupabaseConfigured ? t("sharedFamily") : t("localFamily")}
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
          {view !== "tree" && view !== "home" && <UpcomingWidget items={upcoming} onSelect={setSelected} />}
          {view === "home" && <FamilyHome members={members} events={allLifeEvents} networkName={network?.name} onSelect={setSelected} onGo={(v)=>setView(v)} onAddRelative={()=>setShowForm(true)} />}
          {view === "tree" && (
            <section className="tree-page">
              {cfg.network_template === "family" && (
                <div className="family-welcome">
                  <div className="family-welcome-copy">
                    <span className="family-welcome-kicker">
                      {t("yourFamilyTogether")}
                    </span>
                    <h1>{network?.name}</h1>
                    <p>{network?.description || t("welcomeCopy")}</p>
                    <div className="welcome-actions">
                      <button className="btn primary" onClick={() => setView("directory")}><Search size={15} /> {t("findSomeone")}</button>
                      <button className="btn warm" onClick={() => setShowForm(true)}><Plus size={15} /> {t("addRelative")}</button>
                    </div>
                  </div>
                  <div className="family-welcome-people">
                    <div className="family-faces" aria-label="Family members">
                      {members.slice(0, 4).map((member) => <span className="family-face" key={member.id}>{member.photo_url ? <img src={member.photo_url} alt="" /> : member.full_name.split(/\s+/).map((part) => part[0]).slice(0,2).join("")}</span>)}
                    </div>
                    <div className="family-welcome-stats">
                      <span><b>{members.length}</b> {t("people")}</span>
                      <span><b>{new Set(members.map((m) => m.generation_level)).size}</b> {t("generations")}</span>
                      <span><b>{relationships.length}</b> {t("connections")}</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="page-head">
                <div>
                  <h2 className="page-title">
                    {cfg.network_template === "family"
                      ? t("familyTree")
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
                  placeholder={t("searchFamily")}
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
              <div className="tree-upcoming"><UpcomingWidget items={upcoming} onSelect={setSelected} /></div>
            </section>
          )}
          {view === "directory" && (
            <section>
              <div className="page-head">
                <div>
                  <h1 className="page-title">
                    {cfg.network_template === "family"
                      ? directoryCopy.title
                      : `${cfg.entity_label_plural} Directory`}
                  </h1>
                  <p className="page-subtitle">
                    {directoryCopy.subtitle}
                  </p>
                </div>
                <button
                  className="btn primary"
                  onClick={() => setShowForm(true)}
                >
                  <Plus size={15} />{" "}
                  {cfg.network_template === "family"
                    ? t("addRelative")
                    : `Submit ${cfg.entity_label}`}
                </button>
              </div>
              <div className="search-bar">
                <Search size={18} color="#7a8496" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={directoryCopy.search}
                />
              </div>
              <div className="filters">
                <select
                  className="select"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                >
                  <option value="">{directoryCopy.professions}</option>
                  {professions.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
                <select
                  className="select"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  <option value="">{directoryCopy.locations}</option>
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
                    {directoryCopy.generations}
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
                  <option value="all">{directoryCopy.allLife}</option>
                  <option value="living">{directoryCopy.living}</option>
                  <option value="deceased">{directoryCopy.memorial}</option>
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
                  <RotateCcw size={14} /> {directoryCopy.clear}
                </button>
              </div>
              <p className="page-subtitle" style={{ marginBottom: 12 }}>
                {directoryResults.length} {directoryCopy.of} {members.length}{" "}
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
                          <span className="person-meta"> · {directoryCopy.memorial}</span>
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
                          {directoryCopy.view}
                        </button>
                        <button className="btn small" onClick={() => focus(m)}>
                          {directoryCopy.focus}
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
                  <h1 className="page-title">{mapCopy.title}</h1>
                  <p className="page-subtitle">
                    {mapCopy.subtitle}
                  </p>
                </div>
              </div>
              <div className="notice">
                <b>{mapCopy.privacy}</b> {mapCopy.detail} {located} {directoryCopy.of} {members.length} {mapCopy.have}
              </div>
              <MapView members={members} onSelect={setSelected} />
            </section>
          )}
          {view === "community" && (
            <CommunityHub
              members={members}
              auth={auth}
              network={network}
              onSelect={(m) => setSelected(m)}
              onNotify={notify}
            />
          )}
          {view === "participation" && (
            <ParticipationCenter
              members={members}
              auth={auth}
              onSelect={setSelected}
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
              {network && <FamilyAdminCenter network={network} members={members} relationships={relationships} memberCount={members.length} relationshipCount={relationships.length} changeRequests={changeRequests} onSaveSettings={updateLivingSetting} onOpenInvitations={()=>setShowInvitation(true)} onOpenParticipation={()=>setView("participation")} onExportCsv={exportCsv} onExportJson={exportJson} onPrint={()=>window.print()} onNotify={notify}/>}
              <details className="legacy-admin-details"><summary>Advanced administration & diagnostics</summary>
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
                <label className="living-setting">
                  <span><b>Allow photo uploads</b><small>Off by default for alpha. When enabled, every uploaded image is limited to 100 KB. When off, initials avatars are used.</small></span>
                  <input type="checkbox" checked={cfg.photo_upload_enabled} onChange={(e) => updateLivingSetting({photo_upload_enabled:e.target.checked})} />
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
              </details>
            </section>
          )}
        </main>
      </div>
      <nav className="mobile-bottom-nav has-admin">
        {(
          [
            ["home", language === "hi" ? "आज" : language === "mr" ? "आज" : "Home", <Home size={19} key="home" />],
            ["tree", t("familyTree"), <TreePine size={19} key="tree" />],
            ["directory", t("familyDirectory"), <Users size={19} key="family" />],
            ["community", t("stories"), <HeartHandshake size={19} key="stories" />],
          ] as const
        ).map(([v, label, icon]) => (
          <button
            key={v}
            className={view === v ? "active" : ""}
            onClick={() => setView(v)}
          >
            {icon}<span>{label}</span>
          </button>
        ))}
        <button className={showMobileMenu || view === "map" || view === "admin" ? "active" : ""} onClick={() => setShowMobileMenu(true)}><Menu size={19} /><span>{moreLabel}</span></button>
      </nav>
      {showMobileMenu && <div className="mobile-more-overlay" onMouseDown={(event) => event.target === event.currentTarget && setShowMobileMenu(false)}><section className="mobile-more-sheet" role="dialog" aria-modal="true" aria-label={moreLabel}>
        <div className="mobile-more-head"><div><span className="warm-kicker">{network?.name}</span><h2>{moreLabel}</h2></div><button className="icon-button" aria-label="Close" autoFocus onClick={() => setShowMobileMenu(false)}><X size={19} /></button></div>
        <button className="mobile-more-action" onClick={() => { setView("map"); setShowMobileMenu(false); }}><span><MapPinned />{t("places")}</span><ArrowRight /></button>
        <button className="mobile-more-action" onClick={() => { setView("participation"); setShowMobileMenu(false); }}><span><GitBranch />Participate</span><ArrowRight /></button>
        {canAdmin && <button className="mobile-more-action" onClick={() => { setView("admin"); setShowMobileMenu(false); }}><span><Settings2 />{t("familySettings")}</span><ArrowRight /></button>}
        <button className="mobile-more-action" onClick={() => { setShowGuide(true); setShowMobileMenu(false); }}><span><BookOpen />{t("guide")}</span><ArrowRight /></button>
        <div className="mobile-more-setting"><LanguageSwitcher /></div>
        <label className="mobile-more-setting"><span>{language === "hi" ? "कौन-सी जानकारी दिखाएँ" : language === "mr" ? "कोणती माहिती दाखवायची" : "Information preview"}</span><select className="select" value={visibility} onChange={(event) => setVisibility(event.target.value as Visibility)}><option value="public">{t("publicPreview")}</option><option value="member">{t("memberView")}</option><option value="admin">{t("adminView")}</option></select></label>
        {isSupabaseConfigured && <button className="mobile-more-action sign-out" onClick={() => { signOut(); setAuth(null); setShowMobileMenu(false); }}><span><LogOut />{t("signOut")}</span></button>}
      </section></div>}
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
            canAdmin ||
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
          <div className="modal family-help-modal" role="dialog" aria-modal="true" aria-labelledby="family-help-title">
            <div className="drawer-head">
              <h2 id="family-help-title" style={{ margin: 0 }}>{helpCopy.title}</h2>
              <button className="btn small" onClick={() => setShowGuide(false)}>
                {helpCopy.close}
              </button>
            </div>
            <p className="page-subtitle">{helpCopy.intro}</p>
            <div className="family-help-list">{helpCopy.items.map((item, index) => <div key={item}><span>{index + 1}</span><p>{item}</p></div>)}</div>
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
