"use client";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import {
  Search,
  TreePine,
  Users,
  UsersRound,
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
  BrainCircuit,
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
  Rocket,
  Sparkles,
  PlayCircle,
} from "lucide-react";
import TreeView from "./TreeView";
import ProfileDrawer from "./ProfileDrawer";
import ProfileForm from "./ProfileForm";
import AuthPanel from "./AuthPanel";
import RelationshipModal from "./RelationshipModal";
import SetupScreen from "./SetupScreen";
import AlumniNetworkApp from "./AlumniNetworkApp";
import TemplateNetworkApp from "./TemplateNetworkApp";
import NetworkTopbar from "./shared/NetworkTopbar";
import NetworkAccountMenu from "./shared/NetworkAccountMenu";
import NetworkIntelligenceCenter from "./shared/NetworkIntelligenceCenter";
import type {NetworkAffiliatedEntity,NetworkActivity} from "../core/network-os/contracts";
import type {NetworkEntityRelationship} from "../capabilities/template-product/remote";
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
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { getNetworkRepository } from "../lib/repository";
import { getAuthUser, signOut } from "../lib/auth";
import {
  loadLocalNetwork,
  saveLocalNetwork,
  NetworkSettings,
  getNetworkConfig,
  resolveNetworkVerticalKind,
} from "../lib/network";
import RelationshipExplorer from "./RelationshipExplorer";
import { getStrictLineageIds, immediateFamilyForViewer } from "../lib/relationship-intelligence";
import LifeEventEditor from "./LifeEventEditor";
import CommunityHub from "./CommunityHub";
import CommunityNetwork from "./CommunityNetwork";
import AnalyticsPanel from "./AnalyticsPanel";
import TimelineView from "./TimelineView";
import UpcomingWidget, { UpcomingMilestone } from "./UpcomingWidget";
import ParticipationCenter from "./ParticipationCenter";
import FamilyHome from "./FamilyHome";
import NxReviewPanel from "./NxReviewPanel";
import {useNxEnabled} from "../lib/nx-review";
import MyNetworksHome from "./MyNetworksHome";
import NetworkSwitcher from "./shared/NetworkSwitcher";
import FamilyAdminCenter from "./FamilyAdminCenter";
import FamilyIntakeAdmin from "./FamilyIntakeAdmin";
import QuickFamilyStart from "./QuickFamilyStart";
import FounderLaunchConsole from "./FounderLaunchConsole";
import GuidePortal from "./GuidePortal";
import FeatureGuide from "./FeatureGuide";
import {GUIDE_ENTRIES} from "../lib/user-guide-content";
import type {GuideAudience} from "../lib/guide-types";
import {getRenderableVerticalRuntime, localizedSurfaceLabel} from "../app-shell/vertical-runtime";
import {getVerticalDefinition} from "../app-shell/vertical-registry";
// CR2.2 compatibility marker: "Preview detailed family guide" is superseded by the first-class Explore & Guide portal.
// S1-D compatibility marker for historical help-modal regression gate: event.target===event.currentTarget&&setShowGuide(false)
import { createFamily as createSharedFamily, fetchEffectivePlatformFeatures, fetchMyFeatureAnnouncements, FeatureAnnouncement, markFeatureAnnouncementSeen, setMyExperienceLevel, requestFamilyCreation, fetchMyFamilyCreationRequests, FamilyCreationRequest, fetchFamilyCreationPolicy, joinFamilyByCode, fetchMyClaimableProfiles, ClaimableFamilyProfile, claimProfileByVerifiedEmail, setActiveNetwork, addMyselfToFamily, fetchPlaygroundFeatures, enterFamilyLobby, leaveCurrentFamily, fetchMyNetworks, NetworkMembership } from "../lib/remote";
import {buildTrustedPersonIdentity} from "../capabilities/trusted-identity/runtime";
import type {TrustedPersonIdentity} from "../core/identity/trusted-person";
import type {NetworkMembership as NeutralNetworkMembership} from "../core/network/contracts";
import { validateImportRows, validateNetwork } from "../lib/validation";
import {createAlumniNetwork,fetchClaimableAlumniProfiles,claimAlumniProfile,acceptAlumniInvitation,type ClaimableAlumniProfile} from "../verticals/alumni/data/remote";
import {createTemplateNetwork,joinProductizedNetworkByCode} from "../capabilities/template-product/remote";
import {PRODUCTIZED_NETWORK_CONFIGS,isProductizedVerticalKind,type ProductizedVerticalKind} from "../templates/productized/config";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "../lib/i18n";
import {defaultFeatureMap, EffectiveFeatureMap, ExperienceLevel, FeatureKey, isFeatureAvailable, EXPERIENCE_LABELS, EXPERIENCE_RANK, FEATURE_BY_KEY} from "../lib/features";
const MapView = dynamic(() => import("./MapView"), { ssr: false });
const ImportModal = dynamic(() => import("./ImportModal"), { ssr: false });
const repository = getNetworkRepository();
type View = "home" | "intelligence" | "tree" | "directory" | "map" | "community" | "umbrella" | "timeline" | "participation" | "admin" | "founder" | "guide";
type Visibility = "public" | "member" | "admin";
const esc = (v: string) => `"${String(v ?? "").replaceAll('"', '""')}"`;
const uuid = () =>
  globalThis.crypto?.randomUUID?.() ||
  "00000000-0000-4000-8000-" +
    Math.random().toString(16).slice(2).padEnd(12, "0").slice(0, 12);

export default function NetworkApp() {
 const {t:tr}=useLanguage();
  const nx1=useNxEnabled("NX-1");
  const { t, language } = useLanguage();
  const moreLabel = language === "hi" ? "और" : language === "mr" ? "अधिक" : "More";
  const directoryCopy = language === "hi"
    ? { title:"परिवार के सदस्य", subtitle:"नाम, पेशे या स्थान से रिश्तेदार खोजें।", search:"परिवार में खोजें…", professions:"सभी पेशे", locations:"सभी स्थान", generations:"सभी पीढ़ियाँ", allLife:"जीवित + स्मृति में", living:"जीवित", memorial:"स्मृति में", clear:"हटाएँ", of:"में से", view:"प्रोफ़ाइल देखें", focus:"शाखा देखें" }
    : language === "mr"
      ? { title:"कुटुंब सदस्य", subtitle:"नाव, व्यवसाय किंवा ठिकाणाने नातेवाईक शोधा.", search:"कुटुंबात शोधा…", professions:"सर्व व्यवसाय", locations:"सर्व ठिकाणे", generations:"सर्व पिढ्या", allLife:"हयात + स्मरणार्थ", living:"हयात", memorial:"स्मरणार्थ", clear:"साफ करा", of:"पैकी", view:"प्रोफाइल पहा", focus:"शाखा पहा" }
      : { title:tr("FindFamilyTxt"), subtitle:tr("FindRelativesByNameProfessionOrLocationTxt"), search:"Search family members…", professions:"All professions", locations:"All locations", generations:"All generations", allLife:"Living + In memoriam", living:"Living", memorial:"In memoriam", clear:"Clear", of:"of", view:"View profile", focus:"View branch" };
  const helpCopy = language === "hi" ? { title:"परिवार उपयोग सहायता", close:"बंद करें", intro:"यहाँ सबसे जरूरी काम आसानी से किए जा सकते हैं:", items:["परिवार वृक्ष: खोजें, किसी व्यक्ति पर टैप करें और उनकी पारिवारिक शाखा देखें।","परिवार: नाम, शहर या पेशे से रिश्तेदार खोजें।","प्रोफ़ाइल: अपनी जानकारी, तस्वीर और रिश्ते देखें या अपडेट का अनुरोध करें।","Excel: मार्गदर्शित workbook डाउनलोड करें और जोड़ने से पहले हर व्यक्ति व रिश्ता जाँचें।","गोपनीयता: निजी संपर्क केवल परिवार द्वारा अनुमति प्राप्त लोगों को दिखते हैं।","और: स्थान, भाषा, सहायता, privacy preview और family settings यहाँ मिलते हैं।"] } : language === "mr" ? { title:"कुटुंब वापर मदत", close:"बंद करा", intro:"येथे महत्त्वाची कामे सहज करता येतात:", items:["कुटुंब वृक्ष: शोधा, व्यक्तीवर टॅप करा आणि त्यांची कौटुंबिक शाखा पहा.","कुटुंब: नाव, शहर किंवा व्यवसायाने नातेवाईक शोधा.","प्रोफाइल: आपली माहिती, छायाचित्र आणि नाती पहा किंवा बदल सुचवा.","Excel: मार्गदर्शित workbook डाउनलोड करा आणि जोडण्याआधी प्रत्येक व्यक्ती व नाते तपासा.","गोपनीयता: खाजगी संपर्क फक्त कुटुंबाने परवानगी दिलेल्या लोकांना दिसतात.","अधिक: ठिकाणे, भाषा, मदत, privacy preview आणि family settings येथे आहेत."] } : { title:tr("QuickStartFamilyHelpTxt"), close:"Close", intro:"The easiest way to use the app:", items:["1. Home: see what matters today and use See my family.","2. Family: starts with your direct lineage on mobile. Tap a person to view their profile; switch to Full Tree only when you want every branch.","3. Me: check your own profile and ask for corrections when something is wrong.","4. Joining: use a private invitation link, the short Family Code from your admin, or claim a profile that matches your verified email.","5. Creating: choose Create my family, then use the guided Excel workbook or start with a few relatives. Excel previews data before anything is added.","6. Explore first: Sample Family is read-only, so you can learn the app without creating real data.","Privacy: private contact details and family-only data stay behind family access rules."] };
  const mapCopy = language === "hi" ? { title:"परिवार कहाँ रहता है", subtitle:"शहर के स्तर पर परिवार के स्थान। बड़े निशान उस शहर में अधिक सदस्यों को दिखाते हैं।", privacy:"गोपनीयता:", detail:"केवल शहर का स्थान दिखाया जाता है।", have:"सदस्यों के स्थान उपलब्ध हैं।" } : language === "mr" ? { title:"कुटुंब कुठे राहते", subtitle:"शहर पातळीवरील कौटुंबिक ठिकाणे. मोठे चिन्ह त्या शहरात अधिक सदस्य दाखवते.", privacy:"गोपनीयता:", detail:"फक्त शहराचे ठिकाण दाखवले जाते.", have:"सदस्यांची ठिकाणे उपलब्ध आहेत." } : { title:tr("WhereOurFamilyLivesTxt"), subtitle:tr("CityLevelFamilyLocationsLargerMarkersMeanTxt"), privacy:"Privacy:", detail:"Only city-level locations are shown.", have:"members have locations." };
  const [network, setNetwork] = useState<NetworkSettings | null>(null),
    [view, setView] = useState<View>("home"),
    [members, setMembers] = useState<Member[]>([]),
    [relationships, setRelationships] = useState<Relationship[]>([]),
    [submissions, setSubmissions] = useState<Submission[]>([]),
    [auth, setAuth] = useState<any>(null),
    [ready, setReady] = useState(false),
    [showAuth, setShowAuth] = useState(false),
    [passwordRecovery, setPasswordRecovery] = useState(false),
    [setupNeeded, setSetupNeeded] = useState(false),
    [pendingFamilyRequest, setPendingFamilyRequest] = useState<FamilyCreationRequest | null>(null),
    [familyCreationApprovalRequired,setFamilyCreationApprovalRequired]=useState(true),
    [claimableProfiles,setClaimableProfiles]=useState<ClaimableFamilyProfile[]>([]),
    [claimableAlumniProfiles,setClaimableAlumniProfiles]=useState<ClaimableAlumniProfile[]>([]),
    [myFamilies,setMyFamilies]=useState<NetworkMembership[]>([]),
    [trustedIdentity,setTrustedIdentity]=useState<TrustedPersonIdentity|null>(null),
    [showMyNetworks,setShowMyNetworks]=useState(false),
    [alumniDemo,setAlumniDemo]=useState(false),
    [productizedDemo,setProductizedDemo]=useState<ProductizedVerticalKind|null>(null),
    [pendingAlumniInvite,setPendingAlumniInvite]=useState<string>(""),
    [demoPreview,setDemoPreview]=useState(false),
    [demoViewerId,setDemoViewerId]=useState<string | undefined>(undefined),
    [editingMember, setEditingMember] = useState<Member | undefined>();
  const [platformFeatures,setPlatformFeatures]=useState<EffectiveFeatureMap>(()=>defaultFeatureMap(!isSupabaseConfigured)),
    [playgroundFeatures,setPlaygroundFeatures]=useState<EffectiveFeatureMap>(()=>defaultFeatureMap(true)),
    [experiencePreview,setExperiencePreview]=useState<ExperienceLevel|null>(null),
    [featureAnnouncements,setFeatureAnnouncements]=useState<FeatureAnnouncement[]>([]);
  const [query, setQuery] = useState(""),
    [profession, setProfession] = useState(""),
    [city, setCity] = useState(""),
    [generation, setGeneration] = useState(""),
    [lifeStatus, setLifeStatus] = useState<"all" | "living" | "deceased">(
      "all",
    ),
    [selected, setSelected] = useState<Member | null>(null),
    [showImport, setShowImport] = useState(false),
    [showFamilyIntake,setShowFamilyIntake]=useState(false),
    [showForm, setShowForm] = useState(false),
    [quickStartDismissed,setQuickStartDismissed]=useState(false),
    [familyReady,setFamilyReady]=useState<string | null>(null),
    [toast, setToast] = useState(""),
    [visibility, setVisibility] = useState<Visibility>("member"),
    [focusId, setFocusId] = useState<string | undefined>(undefined),
    [lineageOnly, setLineageOnly] = useState(false),
    [showDeceased, setShowDeceased] = useState(true),
    [showGuide, setShowGuide] = useState(false),
    [guideKey, setGuideKey] = useState(""),
    [showRelationships, setShowRelationships] = useState(false),
    [showMobileMenu, setShowMobileMenu] = useState(false),
    [largeText, setLargeText] = useState(false),
    [selectedHistory, setSelectedHistory] = useState<Member[]>([]);
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
  const activeVerticalKind = resolveNetworkVerticalKind(network);
  const verticalRuntime = getRenderableVerticalRuntime(activeVerticalKind);
  const appComposition = verticalRuntime.app;
  const appLocale = language === "hi" ? "hi" : language === "mr" ? "mr" : "en";
  const viewerMemberId = demoPreview ? demoViewerId : auth?.member_id;
  const immediateFamily = useMemo(() => viewerMemberId ? immediateFamilyForViewer(members, relationships, viewerMemberId).slice(0, 8) : [], [members, relationships, viewerMemberId]);
  const familyIntelligenceEntities = useMemo<NetworkAffiliatedEntity[]>(()=>members.map(m=>({entity:{id:m.id,networkId:network?.id||"family",kind:"person",label:m.full_name,metadata:{profession:m.profession||"",city:m.city||"",country:m.country||""}},affiliations:{generation:[String(m.generation_level)],city:m.city?[m.city]:[],country:m.country?[m.country]:[],profession:m.profession?[m.profession]:[]}})),[members,network?.id]);
  const familyIntelligenceRelationships = useMemo<NetworkEntityRelationship[]>(()=>relationships.map(r=>({id:r.id,fromEntityId:r.person_id,toEntityId:r.related_person_id,fromLabel:members.find(m=>m.id===r.person_id)?.full_name||r.person_id,toLabel:members.find(m=>m.id===r.related_person_id)?.full_name||r.related_person_id,relationshipType:r.relationship_type,label:r.relationship_type})),[relationships,members]);
  const familyIntelligenceActivities = useMemo<NetworkActivity[]>(()=>allLifeEvents.slice(0,30).map(e=>({id:e.id,type:e.event_type==="milestone"?"milestone":"memory",title:e.title,body:e.description||"",place:e.location||null,startsAt:e.event_date||null})),[allLifeEvents]);
  useEffect(() => {
    try { setLargeText(localStorage.getItem("family-large-text") === "1"); } catch {}
  }, []);
  const toggleLargeText = () => setLargeText(current => {
    const next = !current;
    try { localStorage.setItem("family-large-text", next ? "1" : "0"); } catch {}
    return next;
  });
  const notify = (x: string) => {
    setToast(x);
    setTimeout(() => setToast(""), 3000);
  };
  const hydrate = async (u: any) => {
    setAuth(u);
    if(repository.mode === "shared" && u){try{setTrustedIdentity(await buildTrustedPersonIdentity(u))}catch{setTrustedIdentity(null)}}else setTrustedIdentity(null);
    if(repository.mode === "shared") {
      try {
        const demoRows=await fetchPlaygroundFeatures();
        const demoMap=defaultFeatureMap(true);
        demoRows.forEach(row=>{const key=row.feature_key as FeatureKey;if(demoMap[key]) demoMap[key]={key,rollout_state:"released",enabled:row.enabled};});
        setPlaygroundFeatures(demoMap);
      } catch { setPlaygroundFeatures(defaultFeatureMap(true)); }
      try {
        const rows=await fetchEffectivePlatformFeatures();
        const map=defaultFeatureMap(false);
        rows.forEach(row=>{
          const key=row.feature_key as FeatureKey;
          if(map[key]) map[key]={key,rollout_state:row.rollout_state,enabled:row.enabled};
        });
        setPlatformFeatures(map);
      } catch {
        // Migration 026 may not be applied yet. Keep safe compatibility defaults.
        setPlatformFeatures(defaultFeatureMap(false));
      }
      try{setFeatureAnnouncements(await fetchMyFeatureAnnouncements())}catch{setFeatureAnnouncements([])}
    } else {setPlatformFeatures(defaultFeatureMap(true));setFeatureAnnouncements([])}
    if(repository.mode === "shared" && u){try{setMyFamilies(await fetchMyNetworks())}catch{setMyFamilies([])}}else setMyFamilies([]);
    const n =
      repository.mode === "shared"
        ? await repository.fetchNetworkSettings()
        : loadLocalNetwork();
    setNetwork(n);
    setSetupNeeded(!n);
    if(repository.mode === "shared" && u && !n){
      try{setFamilyCreationApprovalRequired(await fetchFamilyCreationPolicy())}catch{setFamilyCreationApprovalRequired(true)}
      try{setClaimableProfiles(await fetchMyClaimableProfiles())}catch{setClaimableProfiles([])}
      try{setClaimableAlumniProfiles(await fetchClaimableAlumniProfiles())}catch{setClaimableAlumniProfiles([])}
      try{
        const requests=await fetchMyFamilyCreationRequests();
        setPendingFamilyRequest(requests.find(item=>item.status==="pending")||null);
      }catch{setPendingFamilyRequest(null)}
    } else { setPendingFamilyRequest(null); setClaimableProfiles([]); setClaimableAlumniProfiles([]); }
    if (n && resolveNetworkVerticalKind(n)==="family") {
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
  useEffect(()=>{if(typeof window!=="undefined"){setPendingAlumniInvite(new URLSearchParams(window.location.search).get("alumniInvite")||"")}},[]);
  useEffect(() => {
    if(!supabase)return;
    const {data:{subscription}}=supabase.auth.onAuthStateChange((event)=>{
      if(event==="PASSWORD_RECOVERY"){setPasswordRecovery(true);setShowAuth(false);}
      if(event==="SIGNED_OUT"){setAuth(null);setPasswordRecovery(false);setView("home");}
    });
    return ()=>subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (repository.mode === "local" && network)
      saveState({ members, relationships, submissions, lifeEvents, memories });
  }, [members, relationships, submissions, lifeEvents, memories, network]);
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
      refresh().catch(() => notify(tr("ProfileSavedButRefreshFailedTxt")));
    window.addEventListener("living-network-profile-updated", updated);
    return () =>
      window.removeEventListener("living-network-profile-updated", updated);
  }, [auth?.role]);
  useEffect(() => {
    if (!selected || demoPreview) {
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
  }, [selected, demoPreview]);
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
      notify(tr("LifeEventDeletedTxt"));
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
    let demoSeed: ReturnType<typeof loadDemoState> | null = null;
    if (mode === "demo") {
      demoSeed = loadDemoState();
      nextM = demoSeed.members;
      nextR = demoSeed.relationships;
      setSubmissions(demoSeed.submissions);
      setMemories(demoSeed.memories);
      setAllLifeEvents(demoSeed.lifeEvents);
    }
    if (validateNetwork(nextM, nextR).errors.length)
      throw new Error(
        "The selected starting data contains integrity errors. Fix the data before creating the network.",
      );
    if (repository.mode === "shared") {
      if(!auth?.platform_owner && familyCreationApprovalRequired){
        await requestFamilyCreation(settings.name, settings.description || "");
        const requests=await fetchMyFamilyCreationRequests();
        setPendingFamilyRequest(requests.find(item=>item.status==="pending")||null);
        notify(tr("FamilyRequestSentToThePlatformOwnerTxt"));
        return;
      }
      const networkId = await createSharedFamily(settings.name, undefined, settings.description || "");
      // create_family already creates the network settings row and owner membership.
      // Activate the returned family explicitly, then refresh auth before any admin-only work.
      await setActiveNetwork(networkId);
      let creatorAuth = await getAuthUser();
      if (creatorAuth?.active_network_id !== networkId || creatorAuth?.family_role !== "owner") {
        // One retry protects fresh sessions where profile/membership visibility settles a moment later.
        await setActiveNetwork(networkId);
        creatorAuth = await getAuthUser();
      }
      settings = {...settings, network_id: networkId, membership_role: "owner"};
      setAuth(creatorAuth);
      setNetwork(settings);

      let persistedDemoEvents: LifeEvent[] = [];
      let persistedDemoMemories: Memory[] = [];
      if (mode === "demo" && demoSeed) {
        const idMap = new Map<string,string>();
        nextM = demoSeed.members.map(m => { const id = globalThis.crypto?.randomUUID?.() || uuid(); idMap.set(m.id,id); return {...m,id}; });
        nextR = demoSeed.relationships.map(r => ({...r,id:globalThis.crypto?.randomUUID?.() || uuid(),person_id:idMap.get(r.person_id)!,related_person_id:idMap.get(r.related_person_id)!}));
        persistedDemoEvents = demoSeed.lifeEvents.map(e => ({...e,id:globalThis.crypto?.randomUUID?.() || uuid(),member_id:idMap.get(e.member_id)!}));
        persistedDemoMemories = demoSeed.memories.map(m => ({...m,id:globalThis.crypto?.randomUUID?.() || uuid(),member_id:m.member_id?idMap.get(m.member_id):undefined,related_member_ids:(m.related_member_ids||[]).map(id=>idMap.get(id)!).filter(Boolean)}));
      }

      if (nextM.length) {
        await repository.upsertMembers(nextM);
        if (nextR.length) await repository.mergeRelationships(nextR);
      }
      if (mode === "demo") {
        for (const e of persistedDemoEvents) await repository.createLifeEvent({member_id:e.member_id,event_type:e.event_type,title:e.title,event_date:e.event_date,location:e.location,description:e.description,visibility:e.visibility});
        for (const m of persistedDemoMemories) await repository.createMemory({member_id:m.member_id,title:m.title,story:m.story,related_member_ids:m.related_member_ids,visibility:m.visibility});
      }

      // Hydrate with the creator's freshly-resolved family role instead of the stale pre-create auth closure.
      const state = await repository.fetchState("admin");
      if (state) {
        setMembers(state.members);
        setRelationships(state.relationships);
        setSubmissions(state.submissions);
      }
      const savedNetwork = await repository.fetchNetworkSettings();
      if (savedNetwork) setNetwork({...savedNetwork, membership_role: "owner"});
      try {
        const governance = await repository.fetchGovernance();
        setChangeRequests(governance.changeRequests);
        setAuditLog(governance.auditLog);
      } catch {}
      // Audit telemetry must never turn a successfully-created family into a failed onboarding screen.
      try {
        await repository.logAudit("network_initialized", {
          mode,
          member_count: nextM.length,
          relationship_count: nextR.length,
        });
      } catch {}
    } else {
      const n = saveLocalNetwork(settings);
      setNetwork(n);
      setMembers(nextM);
      setRelationships(nextR);
      setSetupNeeded(false);
      if (mode === "empty") setSubmissions([]);
    }
    setSetupNeeded(false);
    setDemoPreview(false);
    setFamilyReady(settings.name);
    window.scrollTo({ top: 0, behavior: "smooth" });
    notify(`${settings.name} is ready.`);
  };
  const addMyselfFirst = async (name:string,gender:Member["gender"]) => {
    if (repository.mode === "shared") { await addMyselfToFamily(name,gender); await hydrate(await getAuthUser()); }
    else { const id=uuid(); const m:Member={id,full_name:name,generation_level:3,profile_status:"approved",gender,profile_visibility:"member",contact_visibility:"admin"}; await repository.upsertMembers([m]); setMembers(x=>[...x,m]); setFocusId(id); }
    notify(tr("YouReInNowAddThePeopleTxt"));
  };
  const addCloseRelative = async (name:string,relationship:string,gender:Member["gender"]) => {
    const viewerId=viewerMemberId || auth?.member_id; if(!viewerId) throw new Error("Add yourself first.");
    const viewer=members.find(m=>m.id===viewerId); if(!viewer) throw new Error("Your family profile is still loading.");
    const id=uuid();
    const generation=relationship==="father"||relationship==="mother"?Math.max(1,viewer.generation_level-1):relationship==="son"||relationship==="daughter"?viewer.generation_level+1:viewer.generation_level;
    const m:Member={id,full_name:name,generation_level:generation,profile_status:"approved",gender,profile_visibility:"member",contact_visibility:"admin"};
    await repository.upsertMembers([m]);
    const r:Relationship={id:uuid(),person_id:relationship==="father"||relationship==="mother"?id:viewerId,related_person_id:relationship==="father"||relationship==="mother"?viewerId:id,relationship_type:relationship==="husband"||relationship==="wife"?"spouse":"parent"};
    await repository.addRelationship(r);
    await refresh(); notify(`${name} added to your close family.`);
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
  const lineageIds = useMemo(() => focusId ? getStrictLineageIds(relationships, focusId) : new Set<string>(), [focusId, relationships]);
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
              title: tr("BirthdayTxt"),
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
  const openMember = (m: Member) => {
    if (selected && selected.id !== m.id) setSelectedHistory(history => [...history.slice(-7), selected]);
    setSelected(m);
  };
  const backProfile = () => {
    setSelectedHistory(history => {
      const previous = history[history.length - 1];
      if (previous) setSelected(previous); else setSelected(null);
      return history.slice(0, -1);
    });
  };
  const focus = (m: Member) => {
    setSelectedHistory(history => selected ? [...history.slice(-7), selected] : history);
    setSelected(null);
    setView("tree");
    setFocusId(m.id);
    setLineageOnly(true);
    setQuery("");
  };
  const openFamilyView = () => {
    setView("tree");
    const mobile = typeof window !== "undefined" && !!window.matchMedia?.("(max-width: 800px)").matches;
    const shouldFocusMine = !!viewerMemberId && (demoPreview || (isSupabaseConfigured && ((auth?.experience_level || "simple") === "simple" || mobile)));
    if (shouldFocusMine) {
      setFocusId(viewerMemberId);
      setLineageOnly(true);
      setQuery("");
    }
  };
  const clearFocus = () => {
    setFocusId(undefined);
    setLineageOnly(false);
  };
  const showMyLineage = () => {
    if (!viewerMemberId) return;
    setFocusId(viewerMemberId);
    setLineageOnly(true);
    setQuery("");
    setProfession("");
    setCity("");
    setGeneration("");
    setLifeStatus("all");
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
        const familyAdmin = network?.membership_role === "owner" || network?.membership_role === "admin" || auth?.family_role === "owner" || auth?.family_role === "admin" || auth?.role === "admin";
        if (!familyAdmin)
          throw new Error("Family administrator access is required for bulk import.");
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
        tr("ProfileSubmittedForAdminReviewAndRecordedTxt"),
      );
    } catch (e: any) {
      notify(e.message || "Submission failed.");
    }
  };
  const approve = async (s: Submission) => {
    try {
      if (repository.mode === "shared") {
        if (!(network?.membership_role === "owner" || network?.membership_role === "admin" || auth?.family_role === "owner" || auth?.family_role === "admin" || auth?.role === "admin")) throw new Error("Family Owner or co-admin access required.");
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
            avatar_style: s.avatar_style, facebook_url:s.facebook_url, facebook_public:s.facebook_public, instagram_url:s.instagram_url, instagram_public:s.instagram_public, other_social_url:s.other_social_url, other_social_label:s.other_social_label, other_social_public:s.other_social_public,
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
      notify(tr("SubmissionApprovedTxt"));
    } catch (e: any) {
      notify(e.message || "Approval failed.");
    }
  };
  const reject = async (s: Submission) => {
    try {
      if (repository.mode === "shared") {
        if (!(network?.membership_role === "owner" || network?.membership_role === "admin" || auth?.family_role === "owner" || auth?.family_role === "admin" || auth?.role === "admin")) throw new Error("Family Owner or co-admin access required.");
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
      notify(tr("SubmissionRejectedTxt"));
    } catch (e: any) {
      notify(e.message || "Rejection failed.");
    }
  };
  const saveRel = async (r: Relationship) => {
    try {
      const report = validateNetwork(members, [...relationships, r]);
      if (report.errors.length) throw new Error(report.errors[0].message);
      if (repository.mode === "shared") {
        if (!(network?.membership_role === "owner" || network?.membership_role === "admin" || auth?.family_role === "owner" || auth?.family_role === "admin" || auth?.role === "admin")) throw new Error("Family Owner or co-admin access required.");
        await repository.addRelationship(r);
      }
      setRelationships((rs) => [...rs, r]);
      notify(tr("RelationshipAddedAndValidatedTxt"));
    } catch (e: any) {
      notify(e.message || "Could not add relationship.");
    }
  };
  const removeRel = async (r: Relationship) => {
    try {
      if (repository.mode === "shared") {
        if (!(network?.membership_role === "owner" || network?.membership_role === "admin" || auth?.family_role === "owner" || auth?.family_role === "admin" || auth?.role === "admin")) throw new Error("Family Owner or co-admin access required.");
        await repository.deleteRelationship(r.id);
      }
      setRelationships((rs) => rs.filter((x) => x.id !== r.id));
      notify(tr("RelationshipRemovedTxt"));
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
      notify(tr("LivingNetworkSettingsSavedTxt"));
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
  const enterVerticalPlayground = (variant:"public"|"setup") => {
    if(!appComposition.playground.enabled)return;
    const settings=variant==="public"?appComposition.playground.publicNetworkSettings:appComposition.playground.setupNetworkSettings;
    if(!settings)return;
    const d = loadDemoState();
    const preferred=appComposition.playground.preferredViewerIdentityId;
    const viewer=d.members.find(m=>m.id===preferred)?.id || d.members[Math.floor(d.members.length/2)]?.id;
    setNetwork(settings as unknown as NetworkSettings);
    setMembers(d.members);
    setRelationships(d.relationships);
    setSubmissions(d.submissions);
    setMemories(d.memories);
    setAllLifeEvents(d.lifeEvents);
    if(variant==="public")setPlatformFeatures(defaultFeatureMap(true));
    setDemoViewerId(viewer);
    setDemoPreview(true);
    setFocusId(viewer);
    setLineageOnly(true);
    setSetupNeeded(false);
    setView(appComposition.playground.startView as View);
  };
  const enterPublicPlayground = () => enterVerticalPlayground("public");
  const enterSetupPlayground = () => enterVerticalPlayground("setup");

  if (!ready)
    return (
      <div className="loading-screen">
        <div className="loading-mark"><TreePine size={30} /></div>
        <div>
          <b>{tr("SetupBrandTxt")}</b>
          <div className="page-subtitle">{t("LoadingFamilyTxt")}</div>
        </div>
      </div>
    );
  if (isSupabaseConfigured && passwordRecovery)
    return (
      <div className="landing family-signin-page">
        <div className="landing-card family-signin-card recovery-card">
          <div className="brand-mark"><TreePine size={24} /></div>
          <span className="warm-kicker">{tr("AccountRecoveryTxt")}</span>
          <h1>{tr("ChooseANewPasswordTxt")}</h1>
          <p>{tr("YourResetLinkIsValidCreateATxt")}</p>
        </div>
        <AuthPanel initialMode="reset" onDone={()=>{}} onResetDone={async()=>{setPasswordRecovery(false);try{await hydrate(await getAuthUser());notify(tr("PasswordUpdatedSuccessfullyTxt"))}catch(e:any){notify(e.message||tr("PasswordChangedPleaseSignInAgainTxt"));setAuth(null)}}} />
      </div>
    );
  if (isSupabaseConfigured && !auth && !demoPreview)
    return (
      <div className="landing family-signin-page">
        <div className="landing-card family-signin-card">
          <div className="brand-mark">
            <TreePine size={24} />
          </div>
          <span className="warm-kicker">{tr("APrivatePlaceForYourPeopleTxt")}</span>
          <h1>{tr("WelcomeToYourFamilyTxt")}</h1>
          <p>{tr("SignInToExploreYourFamilyTreeTxt")}</p>
          <div className="family-signin-actions">
            <button className="btn primary" onClick={() => setShowAuth(true)}>
              {tr("JoinOrSignInTxt")}{" "}<ArrowRight size={16} />
            </button>
            <button className="btn" onClick={enterPublicPlayground}>
              <PlayCircle size={16} /> {tr("TryPlaygroundNoLoginTxt")}{" "}</button>
          </div>
          <p className="playground-note">{tr("PlaygroundIsReadOnlyAndTemporaryNothingTxt")}</p>
          <LanguageSwitcher />
        </div>
        {showAuth && (
          <AuthPanel
            onDone={async () => {
              setShowAuth(false);
              try {
                await hydrate(await getAuthUser());
              } catch (e: any) {
                notify(e.message || tr("CouldNotSignInTxt"));
              }
            }}
          />
        )}
      </div>
    );
  const openMyNetworksHome=async()=>{
    if(!auth){setSetupNeeded(true);return;}
    try{const identity=await buildTrustedPersonIdentity(await getAuthUser());setTrustedIdentity(identity);setShowMyNetworks(true);setSetupNeeded(false);}catch(e:any){notify(e.message||"Could not load your networks.")}
  };
  const openMembershipFromHome=async(membership:NeutralNetworkMembership)=>{
    if(!membership.isActive)await setActiveNetwork(membership.network.id);
    setShowMyNetworks(false);setProductizedDemo(null);setAlumniDemo(false);setDemoPreview(false);
    await hydrate(await getAuthUser());setView("home");
  };
  const openNetworkPlayground=(kind:any)=>{
    setShowMyNetworks(false);setSetupNeeded(false);setDemoPreview(false);
    if(kind==="family"){enterSetupPlayground();return;}
    if(kind==="alumni"){const alumni=getVerticalDefinition("alumni");setAlumniDemo(true);setProductizedDemo(null);setNetwork({id:"alumni-playground",name:"Sample Alumni Network",description:tr("ReadOnlySampleAlumniCommunityTxt"),entity_label:alumni.legacyNetworkLabels.entityLabel,entity_label_plural:alumni.legacyNetworkLabels.entityLabelPlural,level_label:alumni.legacyNetworkLabels.levelLabel,level_label_plural:alumni.legacyNetworkLabels.levelLabelPlural,parent_label:alumni.legacyNetworkLabels.parentLabel,child_label:alumni.legacyNetworkLabels.childLabel,peer_label:alumni.legacyNetworkLabels.peerLabel,network_template:"alumni",vertical_kind:"alumni",membership_role:"member"});setMembers([]);setRelationships([]);setSubmissions([]);return;}
    if(isProductizedVerticalKind(kind)){const def=getVerticalDefinition(kind);const pc=PRODUCTIZED_NETWORK_CONFIGS[kind];setProductizedDemo(kind);setAlumniDemo(false);setNetwork({id:`${kind}-playground`,name:pc.sampleName,description:pc.sampleDescription,entity_label:def.legacyNetworkLabels.entityLabel,entity_label_plural:def.legacyNetworkLabels.entityLabelPlural,level_label:def.legacyNetworkLabels.levelLabel,level_label_plural:def.legacyNetworkLabels.levelLabelPlural,parent_label:def.legacyNetworkLabels.parentLabel,child_label:def.legacyNetworkLabels.childLabel,peer_label:def.legacyNetworkLabels.peerLabel,network_template:kind,vertical_kind:kind,membership_role:"member"});setMembers([]);setRelationships([]);setSubmissions([]);}
  };
  const canAdmin = !demoPreview && (!isSupabaseConfigured || network?.membership_role === "owner" || network?.membership_role === "admin" || auth?.role === "admin");
  const isPlatformOwner = !isSupabaseConfigured || !!auth?.platform_owner;
  if(showMyNetworks && trustedIdentity) return <MyNetworksHome identity={trustedIdentity} onOpenNetwork={openMembershipFromHome} onAddNetwork={()=>{setShowMyNetworks(false);setNetwork(null);setSetupNeeded(true)}} onExploreDemo={openNetworkPlayground}/>;
  // Vertical handoff must happen before any Family-only feature evaluation.
  // G5 bugfix: evaluating Alumni surface keys through lib/features (the Family compatibility facade)
  // throws by design. Alumni owns its own feature catalog/runtime and UI workspace.
  if(network && activeVerticalKind==="alumni" && !setupNeeded) return <AlumniNetworkApp network={network} auth={auth} demo={alumniDemo} onNetworkChanged={async()=>{setAlumniDemo(false);await hydrate(await getAuthUser());setView("home")}} onOpenNetworkLobby={openMyNetworksHome} onSignOut={async()=>{await signOut();setAuth(null);setNetwork(null);setSetupNeeded(true)}}/>;
  // G8: productized verticals hand off before Family-only feature evaluation, exactly like Alumni.
  if(network && isProductizedVerticalKind(activeVerticalKind) && !setupNeeded) return <TemplateNetworkApp network={network} auth={auth} kind={activeVerticalKind} demo={productizedDemo===activeVerticalKind} onNetworkChanged={async()=>{setProductizedDemo(null);await hydrate(await getAuthUser());setView("home")}} onOpenNetworkLobby={openMyNetworksHome} onSignOut={async()=>{await signOut();setAuth(null);setNetwork(null);setSetupNeeded(true)}}/>;
  const experience:ExperienceLevel = demoPreview ? "explorer" : (experiencePreview || (!isSupabaseConfigured ? "explorer" : (auth?.experience_level || "simple")));
  // Defensive guard for transient setup/switch states: Family feature runtime never receives another vertical's key.
  const hasFeature=(key:FeatureKey)=>activeVerticalKind==="family"&&isFeatureAvailable(key,demoPreview?playgroundFeatures:platformFeatures,experience,canAdmin);
  const refreshFeatureState=async()=>{
    if(!isSupabaseConfigured)return;
    try{
      const rows=await fetchEffectivePlatformFeatures();
      const map=defaultFeatureMap(false);
      rows.forEach(row=>{const key=row.feature_key as FeatureKey;if(map[key])map[key]={key,rollout_state:row.rollout_state,enabled:row.enabled}});
      setPlatformFeatures(map);
      try{setFeatureAnnouncements(await fetchMyFeatureAnnouncements())}catch{}
    }catch(e:any){notify(e.message||"Could not refresh feature availability.")}
  };
  const activeAnnouncement=featureAnnouncements.find(item=>hasFeature(item.feature_key as FeatureKey));
  const openAnnouncedFeature=(key:FeatureKey)=>{
    const target=appComposition.whatsNew.featureToView[key] || (key.startsWith("admin.") ? "admin" : appComposition.whatsNew.defaultView);
    setView(target as View);
  };
  const dismissAnnouncement=async()=>{
    if(!activeAnnouncement)return;
    const current=activeAnnouncement;
    setFeatureAnnouncements(v=>v.filter(x=>!(x.feature_key===current.feature_key&&x.announcement_version===current.announcement_version)));
    try{await markFeatureAnnouncementSeen(current.feature_key,current.announcement_version)}catch{}
  };
  const changeMyExperience=async(level:ExperienceLevel)=>{
    if(canAdmin){setExperiencePreview(level);return;}
    try{
      await setMyExperienceLevel(level);
      setAuth((current:any)=>current?{...current,experience_level:level}:current);
      setShowMobileMenu(false);
      setView("home");
      notify(level==="simple"?"Simple view is on.":level==="connected"?"More family features are now visible.":"All member features are now visible.");
    }catch(e:any){notify(e.message||"Could not change your view.")}
  };
  const guideAudience:GuideAudience = isPlatformOwner ? "platform_owner" : canAdmin ? "family_admin" : auth ? "member" : "anonymous";
  const guideByView=appComposition.guide.guideByView as Partial<Record<View,string>>;
  const openGuide=(key:string)=>{setGuideKey(key);setView("guide");setShowMobileMenu(false);};
  const openGuideFeature=(action?:string)=>{
    if(!action)return;
    if(action==="playground"){enterPublicPlayground();return;}
    if(action==="add-relative"){setShowForm(true);return;}
    if(action==="import"){setShowImport(true);return;}
    if(action==="setup"){setSetupNeeded(true);return;}
    const target=appComposition.guide.actionToView[action];
    if(target)setView(target as View);
  };
  const tryGuideInPlayground=(key?:string)=>{enterPublicPlayground();if(key){const action=GUIDE_ENTRIES.find(e=>e.key===key)?.action;const target=action?appComposition.guide.actionToView[action]:undefined;window.setTimeout(()=>{if(target&&appComposition.guide.playgroundViewIds.includes(target))setView(target as View)},0)}};
  const openMyProfile=()=>{
    if(auth?.member_id){
      const mine=members.find(m=>m.id===auth.member_id);
      if(mine){openMember(mine);setEditingMember(mine);return;}
    }
    setEditingMember(undefined);setShowForm(true);
  };
  const surfaceIcon=(token:string,size=17):ReactNode=>{
    if(token==="home")return <Home size={size}/>;
    if(token==="intelligence")return <BrainCircuit size={size}/>;
    if(token==="tree")return <TreePine size={size}/>;
    if(token==="memories")return <HeartHandshake size={size}/>;
    if(token==="directory")return <Users size={size}/>;
    if(token==="history")return <CalendarDays size={size}/>;
    if(token==="places")return <MapPinned size={size}/>;
    if(token==="community")return <UsersRound size={size}/>;
    if(token==="contribute")return <GitBranch size={size}/>;
    if(token==="admin")return <Settings2 size={size}/>;
    return <ArrowRight size={size}/>;
  };
  const memberNav:[View,string,ReactNode,FeatureKey,string?][]=appComposition.primaryNavigation.map(surface=>[surface.viewId as View,localizedSurfaceLabel(surface,appLocale),surfaceIcon(surface.iconToken),surface.featureKey as FeatureKey,surface.minimumExperience]);
  const visibleMemberNav=memberNav.filter(item=>{
    if(!hasFeature(item[3])) return false;
    const minimum=item[4] as ExperienceLevel|undefined;
    if(!minimum)return true;
    return EXPERIENCE_RANK[experience]>=EXPERIENCE_RANK[minimum];
  });
  const mobileBottomSurfaces=appComposition.mobileBottomViewIds.map(id=>appComposition.primaryNavigation.find(surface=>surface.viewId===id)).filter(Boolean) as typeof appComposition.primaryNavigation[number][];
  const mobileMoreSurfaces=appComposition.mobileMoreNavigation.filter(surface=>{
    if(surface.adminOnly&&!canAdmin)return false;
    return !surface.featureKey||hasFeature(surface.featureKey as FeatureKey);
  });
  const canSetupFamily = !isSupabaseConfigured || !!auth;
  if (setupNeeded)
    return (
      <>
        {pendingFamilyRequest ? <div className="landing family-approval-page"><div className="landing-card family-approval-card"><div className="brand-mark"><TreePine size={24}/></div><span className="warm-kicker">{tr("FamilyRequestSentTxt")}</span><h1>{pendingFamilyRequest.name}</h1><p>{tr("YourFamilySpaceIsWaitingForApprovalTxt")}</p><div className="notice"><b>{tr("StatusTxt")}</b> {tr("WaitingForApprovalTxt")}</div><div className="card-actions"><button className="btn primary" onClick={async()=>{try{await hydrate(await getAuthUser());notify(tr("ApprovalStatusRefreshedTxt"))}catch(e:any){notify(e.message||tr("CouldNotRefreshApprovalStatusTxt"))}}}>{tr("CheckApprovalStatusTxt")}</button><button className="btn" onClick={enterSetupPlayground}>{tr("ExploreSampleTxt")}</button><button className="btn" onClick={async()=>{await signOut();setAuth(null);setPendingFamilyRequest(null);setSetupNeeded(true)}}><LogOut size={15}/> {tr("SignOutTxt")}</button></div></div></div> : <SetupScreen
          shared={isSupabaseConfigured}
          canSetup={canSetupFamily}
          approvalRequired={isSupabaseConfigured&&!isPlatformOwner&&familyCreationApprovalRequired}
          claimableProfiles={claimableProfiles}
          existingFamilies={myFamilies}
          onOpenFamily={async(id)=>{setProductizedDemo(null);setAlumniDemo(false);await setActiveNetwork(id);await hydrate(await getAuthUser());setView("home")}}
          onSignOut={async()=>{await signOut();setAuth(null);setNetwork(null);setMembers([]);setRelationships([]);setSetupNeeded(true)}}
          onClaimProfile={async(memberId)=>{await claimProfileByVerifiedEmail(memberId);await hydrate(await getAuthUser());setView("home");notify(tr("WelcomeToYourFamily2Txt"))}}
          onJoinCode={async(code)=>{await joinFamilyByCode(code);await hydrate(await getAuthUser());setView("home");notify(tr("FamilyJoinedWelcomeTxt"))}}
          onExploreDemo={enterSetupPlayground}
          claimableAlumniProfiles={claimableAlumniProfiles}
          alumniInviteToken={pendingAlumniInvite}
          onAcceptAlumniInvite={pendingAlumniInvite?async()=>{await acceptAlumniInvitation(pendingAlumniInvite);window.history.replaceState({},"",window.location.pathname);setPendingAlumniInvite("");setAlumniDemo(false);await hydrate(await getAuthUser());setView("home");notify(tr("AlumniInvitationAcceptedTxt"))}:undefined}
          onClaimAlumniProfile={async(profileId)=>{await claimAlumniProfile(profileId);await hydrate(await getAuthUser());setView("home");notify(tr("WelcomeToYourAlumniNetworkTxt"))}}
          onCreateAlumni={async(name,institution,description)=>{const id=await createAlumniNetwork(name,institution,description);await setActiveNetwork(id);setAlumniDemo(false);await hydrate(await getAuthUser());setView("home");notify(`${name} is ready.`)}}
          onExploreAlumniDemo={()=>{const alumni=getVerticalDefinition("alumni");setAlumniDemo(true);setDemoPreview(false);setNetwork({id:"alumni-playground",name:"Sample Alumni Network",description:tr("ReadOnlySampleAlumniCommunityTxt"),entity_label:alumni.legacyNetworkLabels.entityLabel,entity_label_plural:alumni.legacyNetworkLabels.entityLabelPlural,level_label:alumni.legacyNetworkLabels.levelLabel,level_label_plural:alumni.legacyNetworkLabels.levelLabelPlural,parent_label:alumni.legacyNetworkLabels.parentLabel,child_label:alumni.legacyNetworkLabels.childLabel,peer_label:alumni.legacyNetworkLabels.peerLabel,network_template:"alumni",vertical_kind:"alumni",membership_role:"member"});setSetupNeeded(false);setMembers([]);setRelationships([]);setSubmissions([]);}}
          onCreateProductized={async(kind,name,contextValue,description)=>{const id=await createTemplateNetwork(kind,name,contextValue,description);await setActiveNetwork(id);setProductizedDemo(null);setAlumniDemo(false);setDemoPreview(false);await hydrate(await getAuthUser());setView("home");notify(`${name} is ready.`)}}
          onExploreProductizedDemo={(kind)=>{const def=getVerticalDefinition(kind);const pc=PRODUCTIZED_NETWORK_CONFIGS[kind];setProductizedDemo(kind);setAlumniDemo(false);setDemoPreview(false);setNetwork({id:`${kind}-playground`,name:pc.sampleName,description:pc.sampleDescription,entity_label:def.legacyNetworkLabels.entityLabel,entity_label_plural:def.legacyNetworkLabels.entityLabelPlural,level_label:def.legacyNetworkLabels.levelLabel,level_label_plural:def.legacyNetworkLabels.levelLabelPlural,parent_label:def.legacyNetworkLabels.parentLabel,child_label:def.legacyNetworkLabels.childLabel,peer_label:def.legacyNetworkLabels.peerLabel,network_template:kind,vertical_kind:kind,membership_role:"member"});setSetupNeeded(false);setMembers([]);setRelationships([]);setSubmissions([]);}}
          onJoinProductizedCode={async(code)=>{await joinProductizedNetworkByCode(code);setProductizedDemo(null);setAlumniDemo(false);setDemoPreview(false);await hydrate(await getAuthUser());setView("home");notify(tr("NetworkJoinedWelcomeTxt"))}}
          onOpenGuide={()=>{enterPublicPlayground();setGuideKey("");setView("guide")}}
          onCreate={createNetwork}
        />}
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
    <div className={`app-shell ${largeText ? "large-text" : ""}`}>
      <NxReviewPanel/>
      <NetworkTopbar
        icon={<TreePine size={20}/>}
        title={network?.name || tr("SetupBrandTxt")}
        badges={canAdmin?[{label:isSupabaseConfigured?t("SharedFamilyTxt"):t("PrivatePreviewTxt"),tone:isSupabaseConfigured?"shared":"demo",icon:isSupabaseConfigured?<Database size={12}/>:undefined}]:[]}
        middle={demoPreview?<div className="demo-preview-banner"><Sparkles size={14}/><span>{tr("PlaygroundYouAreTxt")}{" "}{members.find(m=>m.id===demoViewerId)?.full_name.split(/\s+/)[0] || tr("ASampleFamilyMemberTxt")} {tr("ForThisVisitNothingIsSavedTxt")}</span><button className="btn small" onClick={async()=>{setDemoPreview(false);setDemoViewerId(undefined);setFocusId(undefined);setLineageOnly(false);setNetwork(null);setMembers([]);setRelationships([]);setSetupNeeded(true)}}>{tr("BackToNetworkSelectionTxt")}</button></div>:undefined}
        actions={<div className={`nx6-top-actions ${experience==="simple"&&!canAdmin?"simple-top-actions":""}`}>
          {isSupabaseConfigured && !demoPreview && auth && <NetworkSwitcher label={tr("SwitchNetworkTxt")} onSwitched={async()=>{await hydrate(await getAuthUser());setView("home");}} onCreate={()=>{setNetwork(null);setSetupNeeded(true)}}/>}
          <LanguageSwitcher compact />
          {canAdmin && <select className="select nx6-privacy-preview" aria-label={tr("PreviewProfilePrivacyAsTxt")} value={visibility} onChange={(e) => setVisibility(e.target.value as Visibility)}><option value="public">{tr("PublicPreviewTxt")}</option><option value="member">{tr("MemberPreviewTxt")}</option><option value="admin">{tr("AdminPreviewTxt")}</option></select>}
          <NetworkAccountMenu label={demoPreview?"Explore":auth?.email?.split("@")[0]||tr("MeTxt")} subtitle={demoPreview?"Playground":network?.membership_role||auth?.family_role||tr("FamilyMemberTxt")} items={[
            ...((canAdmin || experience!==tr("Simple3Txt"))?[{key:"profile",label:t("MyProfileTxt"),icon:<UserRoundPen size={16}/>,onClick:openMyProfile,hint:"Your family profile"}]:[]),
            ...(nx1&&isSupabaseConfigured&&!demoPreview&&auth?[{key:"networks",label:tr("MyNetworksTxt"),icon:<UsersRound size={16}/>,onClick:()=>void openMyNetworksHome(),hint:"All your private network contexts"}]:[]),
            {key:"guide",label:tr("ExploreGuideTxt"),icon:<BookOpen size={16}/>,onClick:()=>{setGuideKey("");setView("guide")},hint:"Learn what this network can do"},
            ...(isSupabaseConfigured&&auth?[{key:"signout",label:t("SignOutTxt"),icon:<LogOut size={16}/>,onClick:()=>{signOut();setAuth(null)},danger:true}]:[]),
          ]}/>
        </div>}
      />
      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-section-label">{language === "hi" ? "मेरा परिवार" : language === "mr" ? "माझे कुटुंब" : tr("MyFamilyTxt")}</div>
          {visibleMemberNav.map(([navView,label,icon])=><button
            key={navView}
            className={`nav-btn ${view === navView ? "active" : ""}`}
            onClick={() => navView === "tree" ? openFamilyView() : setView(navView)}
          >{icon} {label}</button>)}
          {(!demoPreview || !!auth) && hasFeature("core.profile") && <button className={`nav-btn ${selected?.id===auth?.member_id ? "active" : ""}`} onClick={openMyProfile}><UserRoundPen size={17}/> {language === "hi" ? "मैं" : language === "mr" ? "मी" : tr("MeTxt")}</button>}
          {hasFeature("core.guide")&&<button className={`nav-btn guide-nav ${view === "guide" ? "active" : ""}`} onClick={() => {setGuideKey("");setView("guide")}}><BookOpen size={17}/> {tr("ExploreGuideTxt")}</button>}
          {canAdmin && hasFeature("admin.center") && <div className="admin-nav-separator">
            <div className="sidebar-section-label">{language === "hi" ? "परिवार प्रबंधन" : language === "mr" ? "कुटुंब व्यवस्थापन" : tr("FamilyManagementTxt")}</div>
            <button className={`nav-btn admin-nav ${view === "admin" ? "active" : ""}`} onClick={() => setView("admin")}><ShieldCheck size={17}/> {language === "hi" ? "परिवार संभालें" : language === "mr" ? "कुटुंब सांभाळा" : tr("ManageFamilyTxt")}</button>
          </div>}
          {isPlatformOwner && isSupabaseConfigured && <div className="admin-nav-separator founder-nav-area">
            <div className="sidebar-section-label">{tr("PlatformTxt")}</div>
            <button className={`nav-btn founder-nav ${view === "founder" ? "active" : ""}`} onClick={() => setView("founder")}><Rocket size={17}/> {tr("LaunchControlTxt")}</button>
          </div>}
          {canAdmin && <div className="experience-preview">
            <label>{language === "hi" ? "सदस्य अनुभव देखें" : language === "mr" ? "सदस्य अनुभव पहा" : tr("PreviewMemberExperienceTxt")}</label>
            <select className="select" value={experience} onChange={e=>setExperiencePreview(e.target.value as ExperienceLevel)}>
              {(Object.keys(EXPERIENCE_LABELS) as ExperienceLevel[]).map(level=><option key={level} value={level}>{EXPERIENCE_LABELS[level].label}</option>)}
            </select>
            <small>{EXPERIENCE_LABELS[experience].description}</small>
            {isPlatformOwner && <span className="founder-preview-note">{tr("FounderTestFeaturesAreVisibleToYouTxt")}</span>}
          </div>}
          <div className="sidebar-family-summary">
            <strong>{members.length} {language === "hi" ? "परिवार सदस्य" : language === "mr" ? "कुटुंब सदस्य" : tr("FamilyMembers2Txt")}</strong>
            <span>{new Set(members.map((m) => m.generation_level)).size} {language === "hi" ? "पीढ़ियाँ" : language === "mr" ? "पिढ्या" : tr("GenerationsTxt")}</span>
          </div>
          {!canAdmin && <div className="member-experience-card"><small>{language==='hi'?'आपका दृश्य':language==='mr'?'आपले दृश्य':tr("YourViewTxt")}</small><strong>{experience==='simple'?(language==='hi'?'सरल':language==='mr'?'सोपे':tr("Simple2Txt")):experience==='connected'?(language==='hi'?'और परिवार':language==='mr'?'अधिक कुटुंब':tr("MoreFamilyTxt")):(language==='hi'?'सब सुविधाएँ':language==='mr'?'सर्व सुविधा':tr("EverythingTxt"))}</strong><button className="text-action" onClick={()=>changeMyExperience(experience==='simple'?'connected':experience==='connected'?'explorer':'simple')}>{experience==='explorer'?(language==='hi'?'सरल दृश्य पर जाएँ':language==='mr'?'सोप्या दृश्यावर जा':tr("UseSimpleViewTxt")):(language==='hi'?'और देखें':language==='mr'?'अधिक पहा':tr("ExploreMoreTxt"))} <ArrowRight size={14}/></button></div>}
        </aside>
        <main className="main">
          {view!=="guide" && view!=="founder" && <FeatureGuide entry={GUIDE_ENTRIES.find(e=>e.key===guideByView[view])} onOpenGuide={openGuide} onOpenFeature={openGuideFeature} onTryPlayground={tryGuideInPlayground} rememberKey={`view-${view}`}/>}
          {familyReady && view==="home" && <div className="family-ready-celebration"><div className="family-ready-icon"><Sparkles size={22}/></div><div><span className="warm-kicker">{tr("YourFamilyIsReadyTxt")}</span><h2>{familyReady}</h2><p>{tr("StartWithYourselfAndThePeopleClosestTxt")}</p></div><div className="family-ready-actions">{hasFeature("contribute.branch_intake")&&<button className="btn primary small" onClick={()=>{setFamilyReady(null);setShowFamilyIntake(true)}}>{tr("BuildTogetherRecommendedTxt")}</button>}<button className="btn small" onClick={()=>{setFamilyReady(null);if(!viewerMemberId)window.scrollTo({top:0,behavior:"smooth"})}}>{tr("AddMyselfCloseFamilyTxt")}</button><button className="btn small" onClick={()=>{setFamilyReady(null);setShowImport(true)}}>{tr("ImportExcelCSVTxt")}</button><button className="icon-button" aria-label={tr("DismissTxt")} onClick={()=>setFamilyReady(null)}><X size={16}/></button></div></div>}
          {activeAnnouncement && view!=="founder" && <div className="whats-new-card"><div className="whats-new-icon"><Sparkles size={20}/></div><div><span className="warm-kicker">{appComposition.whatsNew.kicker}</span><h3>{FEATURE_BY_KEY[activeAnnouncement.feature_key as FeatureKey]?.label||appComposition.whatsNew.fallbackTitle}</h3><p>{FEATURE_BY_KEY[activeAnnouncement.feature_key as FeatureKey]?.description||appComposition.whatsNew.fallbackDescription}</p></div><div className="whats-new-actions"><button className="btn primary small" onClick={()=>{openAnnouncedFeature(activeAnnouncement.feature_key as FeatureKey);dismissAnnouncement()}}>{tr("TryItTxt")}</button><button className="btn small" onClick={dismissAnnouncement}>{tr("GotItTxt")}</button></div></div>}
          {hasFeature("celebrate.special_days") && view !== "tree" && view !== "home" && <UpcomingWidget items={upcoming} onSelect={openMember} />}
          {view === "home" && canAdmin && !demoPreview && !quickStartDismissed && members.length < 5 && <QuickFamilyStart viewer={viewerMemberId?members.find(m=>m.id===viewerMemberId):undefined} suggestedName={auth?.email?.split("@")[0]||""} onAddMyself={addMyselfFirst} onAddRelative={addCloseRelative} onImport={()=>setShowImport(true)} onBuildTogether={hasFeature("contribute.branch_intake")?()=>setShowFamilyIntake(true):undefined} onDismiss={()=>setQuickStartDismissed(true)}/>}
          {view === "intelligence" && <NetworkIntelligenceCenter kind="family" entities={familyIntelligenceEntities} relationships={familyIntelligenceRelationships} activities={familyIntelligenceActivities} dimensionKeys={["generation","city","country","profession"]} onGo={target=>{if(target==="connections")setView("tree");else if(target==="contribute")setView("participation");else if(target==="community")setView("community");else if(target==="directory")setView("directory");else if(target==="explorer")setView("tree");}} onEntityOpen={entity=>{const member=members.find(m=>m.id===entity.entity.id);if(member)openMember(member)}}/>}
          {view === "home" && <FamilyHome members={members} relationships={relationships} events={allLifeEvents} memories={demoPreview?memories:undefined} networkName={network?.name} viewerMemberId={viewerMemberId} onSelect={openMember} onGo={(v)=>{if(v==="community"&&!hasFeature("remember.memories"))return;if(v==="participation"&&!hasFeature("contribute.help_family"))return;setView(v)}} onAddRelative={()=>setShowForm(true)} showMemories={hasFeature("remember.memories")} showSpecialDays={hasFeature("celebrate.special_days")} showContributions={hasFeature("contribute.help_family")} showSharing={hasFeature("share.family")} showFamilyPulse={hasFeature("remember.family_pulse")} showQuietDigest={hasFeature("remember.quiet_digest")} canAddRelative={canAdmin||experience!==tr("Simple3Txt")} simple={experience==="simple"} readOnly={demoPreview} />}
          {view === "tree" && (
            <section className="tree-page">
              {cfg.network_template === "family" && (
                <div className="family-welcome">
                  <div className="family-welcome-copy">
                    <span className="family-welcome-kicker">
                      {t("FamTogetherTitleTxt")}
                    </span>
                    <h1>{network?.name}</h1>
                    <p>{network?.description || t("FamWelcomeDescTxt")}</p>
                    <div className="welcome-actions">
                      <button className="btn primary" onClick={() => setView("directory")}><Search size={15} /> {t("FindSomeoneTxt")}</button>
                      {(canAdmin||experience!==tr("Simple3Txt"))&&<button className="btn warm" onClick={() => setShowForm(true)}><Plus size={15} /> {t("AddRelativeTxt")}</button>}
                    </div>
                  </div>
                  <div className="family-welcome-people">
                    <div className="family-faces" aria-label={tr("FamilyMembersTxt")}>
                      {members.slice(0, 4).map((member) => <span className="family-face" key={member.id}>{member.photo_url ? <img src={member.photo_url} alt="" /> : member.full_name.split(/\s+/).map((part) => part[0]).slice(0,2).join("")}</span>)}
                    </div>
                    <div className="family-welcome-stats">
                      <span><b>{members.length}</b> {t("PeopleTxt")}</span>
                      <span><b>{new Set(members.map((m) => m.generation_level)).size}</b> {t("GenerationsTxt")}</span>
                      <span><b>{relationships.length}</b> {t("ConnectionsTxt")}</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="page-head">
                <div>
                  <h2 className="page-title">
                    {cfg.network_template === "family"
                      ? (lineageOnly && focusId ? tr("MyFamilyLineTxt") : t("FamTreeTxt"))
                      : tr("HierarchyTxt")}
                  </h2>
                  <p className="page-subtitle">
                    {tr("StartWithThePeopleClosestToYouTxt")}{" "}</p>
                </div>
                <div className="card-actions">
                  <button
                    className="btn small"
                    onClick={() => setShowDeceased((x) => !x)}
                  >
                    <HeartHandshake size={14} />{" "}
                    {showDeceased ? tr("HideDeceasedTxt") : tr("ShowDeceasedTxt")}
                  </button>
                  {focusId && selectedHistory.length > 0 && (
                    <button className="btn small" onClick={backProfile}>
                      <ArrowRight size={14} style={{transform:"rotate(180deg)"}} /> {tr("BackToProfileTxt")}{" "}</button>
                  )}
                  {focusId ? (
                    <button className="btn small" onClick={clearFocus}>
                      <GitBranch size={14} /> {tr("FullTreeTxt")}{" "}</button>
                  ) : viewerMemberId ? (
                    <button className="btn small" onClick={showMyLineage}>
                      <Eye size={14} /> {tr("MyLineageTxt")}{" "}</button>
                  ) : null}
                  {focusId && focusId !== viewerMemberId && (
                    <button className="btn small" onClick={showMyLineage}>
                      <Eye size={14} /> {tr("MyLineageTxt")}{" "}</button>
                  )}
                </div>
              </div>
              <div className="tree-mobile-view-switch" aria-label={tr("FamilyTreeViewTxt")}>
                {lineageOnly && focusId ? (
                  <button className="btn small" onClick={clearFocus}>
                    <GitBranch size={14} /> {tr("ViewFullTreeTxt")}{" "}</button>
                ) : (
                  <button className="btn small primary" onClick={showMyLineage} disabled={!viewerMemberId}>
                    <Eye size={14} /> {tr("ViewMyLineageTxt")}{" "}</button>
                )}
              </div>
              {viewerMemberId && immediateFamily.length > 0 && <div className="family-magic-strip">
                <div className="family-magic-head"><span><Sparkles size={15}/> {tr("YourClosestFamilyTxt")}</span><small>{tr("TapAnyoneToSeeHowTheyRelateTxt")}</small></div>
                <div className="family-magic-people">{immediateFamily.map(({member,label})=><button key={member.id} onClick={()=>openMember(member)}><span className="family-magic-avatar">{member.photo_url?<img src={member.photo_url} alt=""/>:member.full_name.split(/\s+/).map(x=>x[0]).slice(0,2).join("")}</span><span><b>{label}</b><small>{member.full_name}</small></span></button>)}</div>
              </div>}
              <div className="search-bar">
                <Search size={18} color="#7a8496" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("SearchFamilyPlaceholderTxt")}
                />
                {query && (
                  <button className="btn small" onClick={() => setQuery("")}>
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="notice">
                {filtered.length} {tr("MembersShownTxt")}{" "}
                {focusId
                  ? `Your family line: ${lineageIds.size} people.`
                  : tr("WholeFamilyTreeTxt")}
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
                viewerMemberId={viewerMemberId || undefined}
                compactLineage={lineageOnly && !!focusId}
                onSelect={openMember}
                network={network}
              />
              <div className="tree-upcoming"><UpcomingWidget items={upcoming} onSelect={openMember} /></div>
            </section>
          )}
          {view === "directory" && hasFeature("core.directory") && (
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
                    ? t("AddRelativeTxt")
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
                  ? tr("ServerSearchTxt")
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
                          onClick={() => openMember(m)}
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
          {view === "guide" && <GuidePortal audience={guideAudience} experience={experience} demo={demoPreview} featureVisible={(key)=>{try{return hasFeature(key as FeatureKey)}catch{return true}}} initialKey={guideKey} onOpenFeature={openGuideFeature} onTryPlayground={tryGuideInPlayground} onNotify={notify}/>}
          {view === "timeline" && hasFeature("remember.history") && (
            <TimelineView
              events={allLifeEvents}
              members={members}
              network={network}
              onSelect={openMember}
            />
          )}
          {view === "map" && hasFeature("connect.places") && (
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
              <MapView members={members} onSelect={openMember} />
            </section>
          )}
          {view === "umbrella" && hasFeature("connect.community") && (
            <CommunityNetwork members={members} auth={auth} familyName={network?.name} demo={demoPreview} showTrustedIntroductions={hasFeature("connect.trusted_introductions")} onNotify={notify}/>
          )}
          {view === "community" && hasFeature("remember.memories") && (
            <CommunityHub
              members={members}
              auth={auth}
              network={network}
              demoMemories={demoPreview?memories:undefined}
              readOnly={demoPreview}
              showQuietDigest={hasFeature("remember.quiet_digest")}
              onSelect={openMember}
              onNotify={notify}
            />
          )}
          {view === "participation" && hasFeature("contribute.help_family") && (
            <ParticipationCenter
              members={members}
              relationships={relationships}
              viewerMemberId={viewerMemberId}
              networkName={network?.name}
              auth={auth}
              demo={demoPreview}
              onSelect={openMember}
              onNotify={notify}
            />
          )}
          {view === "founder" && isPlatformOwner && isSupabaseConfigured && <><FeatureGuide entry={GUIDE_ENTRIES.find(e=>e.key===appComposition.guide.launchControlGuideKey)} onOpenGuide={openGuide} onOpenFeature={openGuideFeature}/><FounderLaunchConsole onChanged={refreshFeatureState} onNotify={notify}/></>}
          {view === "admin" && canAdmin && hasFeature("admin.center") && (
            <section>
              <div className="page-head">
                <div>
                  <h1 className="page-title">{tr("ManageFamilyTxt")}</h1>
                  <p className="page-subtitle">
                    {tr("ManageSharedDataRelationshipsApprovalsAndP4Txt")}{" "}</p>
                </div>
              </div>
              {network && <FamilyAdminCenter network={network} members={members} relationships={relationships} memberCount={members.length} relationshipCount={relationships.length} changeRequests={changeRequests} onSaveSettings={updateLivingSetting} onOpenInvitations={()=>setShowInvitation(true)} onOpenParticipation={()=>setView("participation")} onOpenFamilyIntake={hasFeature("contribute.branch_intake")?()=>setShowFamilyIntake(true):undefined} onExportCsv={exportCsv} onExportJson={exportJson} onPrint={()=>window.print()} onNotify={notify} onFeatureSettingsChanged={refreshFeatureState}/>}
              <details className="legacy-admin-details"><summary>{tr("AdvancedAdministrationAndDiagnosticsTxt")}</summary>
              <div className="admin-grid">
                <div className="card stat">
                  <div className="stat-label">{tr("MembersTxt")}</div>
                  <div className="stat-number">{members.length}</div>
                </div>
                <div className="card stat">
                  <div className="stat-label">{tr("Relationships3Txt")}</div>
                  <div className="stat-number">{relationships.length}</div>
                </div>
                <div className="card stat">
                  <div className="stat-label">{tr("PendingProfilesTxt")}</div>
                  <div className="stat-number">
                    {submissions.filter((s) => s.status === "pending").length}
                  </div>
                </div>
                <div className="card stat">
                  <div className="stat-label">{tr("IntegrityTxt")}</div>
                  <div className="stat-number" style={{ fontSize: 18 }}>
                    {validationReport.valid
                      ? tr("HealthyTxt")
                      : `${validationReport.errors.length} errors`}
                  </div>
                </div>
              </div>
              <div className="card governance-card">
                <div className="governance-head">
                  <div>
                    <h3 style={{ margin: 0 }}>{tr("LivingNetworkTxt")}</h3>
                    <p className="page-subtitle">
                      {tr("FieldAwareParticipationAndFamilyModuleMilestonesTxt")}{" "}</p>
                  </div>
                  <Settings2 size={18} />
                </div>
                <label className="living-setting">
                  <span>
                    <b>{tr("DirectSaveSafeSelfEditsTxt")}</b>
                    <small>
                      {tr("ProfessionLocationBioContactDetailsAndOwnedTxt")}{" "}</small>
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
                  <span><b>{tr("AllowPhotoUploadsTxt")}</b><small>{tr("OffByDefaultForAlphaWhenEnabledTxt")}</small></span>
                  <input type="checkbox" checked={cfg.photo_upload_enabled} onChange={(e) => updateLivingSetting({photo_upload_enabled:e.target.checked})} />
                </label>
                {cfg.network_template === "family" && (
                  <label className="living-setting">
                    <span>
                      <b>{tr("UpcomingFamilyMilestonesTxt")}</b>
                      <small>
                        {tr("BirthdaysAndFamilyEventsInTheNextTxt")}{" "}</small>
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
                    <h3 style={{ margin: 0 }}>{tr("PublicPageTxt")}</h3>
                    <p className="page-subtitle">
                      {tr("AShareableReadOnlyDirectoryForMembersTxt")}{" "}</p>
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
                    {tr("Public2Txt")}{" "}</code>
                  <button
                    className="btn small"
                    onClick={() => {
                      if (typeof window !== "undefined")
                        navigator.clipboard
                          ?.writeText(window.location.origin + "/public")
                          .then(() => notify(tr("PublicURLCopiedTxt")));
                    }}
                  >
                    {tr("CopyTxt")}{" "}</button>
                  <a
                    className="btn small"
                    href="/public"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink size={13} /> {tr("PreviewTxt")}{" "}</a>
                </div>
                <p className="page-subtitle" style={{ marginTop: 10 }}>
                  {tr("MembersControlVisibilityFromTheirOwnProfileTxt")}{" "}</p>
              </div>
              <div className="card governance-card">
                <div className="governance-head">
                  <div>
                    <h3 style={{ margin: 0 }}>{tr("DataIntegrityTxt")}</h3>
                    <p className="page-subtitle">
                      {tr("P41ValidatesSelfLinksDuplicateRelationshipsTxt")}{" "}</p>
                  </div>
                  {validationReport.valid ? (
                    <div className="validation-good">
                      <CheckCircle2 size={16} /> {tr("NoBlockingErrorsTxt")}{" "}</div>
                  ) : (
                    <div className="validation-bad">
                      <ShieldAlert size={16} /> {validationReport.errors.length}{" "}
                      {tr("ErrorsTxt")}{" "}</div>
                  )}
                </div>
                {validationReport.warnings.length > 0 && (
                  <div className="notice warning-notice">
                    <AlertTriangle size={15} />{" "}
                    {validationReport.warnings.length} {tr("WarningSIncludingPossibleDuplicateIdentitiesOrTxt")}{" "}</div>
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
                    {tr("TheCurrentHierarchyPassedTheP41Txt")}{" "}</div>
                )}
              </div>
              <div className="card governance-card">
                <div className="governance-head">
                  <div>
                    <h3 style={{ margin: 0 }}>{tr("ChangeRequestsTxt")}</h3>
                    <p className="page-subtitle">
                      {tr("ProfileSubmissionsAreNowRepresentedInTheTxt")}{" "}</p>
                  </div>
                  <ClipboardCheck size={18} />
                </div>
                {changeRequests.length === 0 && (
                  <div className="empty compact">{tr("NoChangeRequestsYetTxt")}</div>
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
                    <h3 style={{ margin: 0 }}>{tr("AuditLogTxt")}</h3>
                    <p className="page-subtitle">
                      {tr("AdministrativeAndContributionActionsAreRecordedInTxt")}{" "}</p>
                  </div>
                  <ShieldCheck size={18} />
                </div>
                {auditLog.length === 0 && (
                  <div className="empty compact">{tr("NoAuditEventsYetTxt")}</div>
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
                <h3 style={{ marginTop: 0 }}>{tr("MemberInvitationsTxt")}</h3>
                <p className="page-subtitle">
                  {tr("InviteAnExistingHierarchyMemberToClaimTxt")}{" "}</p>
                <div className="card-actions">
                  <button
                    className="btn primary"
                    onClick={() => setShowInvitation(true)}
                  >
                    {tr("CreateInvitationLinkTxt")}{" "}</button>
                </div>
              </div>
              <AnalyticsPanel onNotify={notify} />
              <div className="card governance-card">
                <h3 style={{ marginTop: 0 }}>{tr("SharedDataTxt")}</h3>
                <p className="page-subtitle">
                  {tr("ImportsMergeUpsertRecordsAndNeverSilentlyTxt")}{" "}</p>
                <div className="card-actions">
                  <button
                    className="btn primary"
                    onClick={() => setShowImport(true)}
                  >
                    <Upload size={15} /> {tr("ImportCSVXLSXXMLTxt")}{" "}</button>
                  <button className="btn" onClick={exportCsv}>
                    <Download size={15} /> {tr("ExportCSVTxt")}{" "}</button>
                  <button className="btn" onClick={exportJson}>
                    <Download size={15} /> {tr("ExportJSONTxt")}{" "}</button>
                  <button className="btn" onClick={exportSvg}>
                    <Download size={15} /> {tr("ExportSVGTxt")}{" "}</button>
                  <button className="btn" onClick={() => window.print()}>
                    <Download size={15} /> {tr("PrintPDFTxt")}{" "}</button>
                </div>
              </div>
              <div className="card governance-card">
                <h3 style={{ marginTop: 0 }}>{tr("ProfileSubmissionsTxt")}</h3>
                {submissions.length === 0 && (
                  <p className="page-subtitle">{tr("NoSubmissionsYetTxt")}</p>
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
                          {tr("ApproveTxt")}{" "}</button>
                        <button
                          className="btn small danger"
                          onClick={() => reject(s)}
                        >
                          {tr("RejectTxt")}{" "}</button>
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
        {mobileBottomSurfaces.filter(surface=>{if(surface.featureKey&&!hasFeature(surface.featureKey as FeatureKey))return false;const minimum=surface.minimumExperience as ExperienceLevel|undefined;return !minimum||EXPERIENCE_RANK[experience]>=EXPERIENCE_RANK[minimum]}).map(surface=><button key={surface.viewId} className={view === surface.viewId ? "active" : ""} onClick={() => surface.viewId === "tree" ? openFamilyView() : setView(surface.viewId as View)}>{surfaceIcon(surface.iconToken,19)}<span>{localizedSurfaceLabel(surface,appLocale)}</span></button>)}
        {(!demoPreview || !!auth) && <button className={selected?.id===auth?.member_id ? "active" : ""} onClick={openMyProfile}><UserRoundPen size={19}/><span>{language === "hi" ? "मैं" : language === "mr" ? "मी" : tr("MeTxt")}</span></button>}
        <button className={showMobileMenu || appComposition.mobileMoreActiveViewIds.includes(view) ? "active" : ""} onClick={() => setShowMobileMenu(true)}><Menu size={19}/><span>{moreLabel}</span></button>
      </nav>
      {showMobileMenu && <div className="mobile-more-overlay" onMouseDown={(event) => event.target === event.currentTarget && setShowMobileMenu(false)}><section className="mobile-more-sheet" role="dialog" aria-modal="true" aria-label={moreLabel}>
        <div className="mobile-more-head"><div><span className="warm-kicker">{network?.name}</span><h2>{moreLabel}</h2></div><button className="icon-button" aria-label={tr("CloseTxt")} autoFocus onClick={() => setShowMobileMenu(false)}><X size={19}/></button></div>
        {mobileMoreSurfaces.map(surface=><button key={surface.viewId} className="mobile-more-action" onClick={() => { setView(surface.viewId as View); setShowMobileMenu(false); }}><span>{surfaceIcon(surface.iconToken)}{localizedSurfaceLabel(surface,appLocale)}</span><ArrowRight /></button>)}
        {isPlatformOwner && isSupabaseConfigured && <button className="mobile-more-action" onClick={() => { setView("founder"); setShowMobileMenu(false); }}><span><Rocket />{tr("LaunchControlTxt")}</span><ArrowRight /></button>}
        {isSupabaseConfigured && auth && !demoPreview && <button className="mobile-more-action" onClick={() => { setSetupNeeded(true); setShowMobileMenu(false); }}><span><UsersRound />{tr("CreateJoinOrSwitchFamilyTxt")}</span><ArrowRight /></button>}
        {isSupabaseConfigured && auth && !demoPreview && <button className="mobile-more-action" onClick={async()=>{if(!window.confirm(`Leave ${network?.name||tr("ThisFamilyTxt")}? If you are its only account, the empty family will be archived.`))return;try{const action=await leaveCurrentFamily();setShowMobileMenu(false);await hydrate(await getAuthUser());notify(action==="archived"?"Family archived. You can create or join another family.":"You left the family.")}catch(e:any){notify(e.message||tr("CouldNotLeaveThisFamilyTxt"))}}}><span><LogOut />{tr("LeaveThisFamilyTxt")}</span><ArrowRight /></button>}
        <button className="mobile-more-action" onClick={() => { setGuideKey(""); setView("guide"); setShowMobileMenu(false); }}><span><BookOpen />{tr("ExploreGuideTxt")}</span><ArrowRight /></button>
        <button className="mobile-more-action" onClick={toggleLargeText}><span><BookOpen />{largeText ? (language==='hi'?'सामान्य टेक्स्ट':language==='mr'?'सामान्य मजकूर':tr("NormalTextSizeTxt")) : (language==='hi'?'बड़ा टेक्स्ट':language==='mr'?'मोठा मजकूर':tr("LargerTextTxt"))}</span><ArrowRight /></button>
        <div className="mobile-more-setting"><LanguageSwitcher /></div>
        {!canAdmin&&<label className="mobile-more-setting friendly-experience-setting"><span>{language==='hi'?'ऐप में कितना दिखे?':language==='mr'?'अॅपमध्ये किती दाखवायचे?':tr("HowMuchWouldYouLikeToSeeTxt")}</span><select className="select" value={experience} onChange={e=>changeMyExperience(e.target.value as ExperienceLevel)}><option value="simple">{language==='hi'?'सरल — बस जरूरी चीजें':language==='mr'?'सोपे — फक्त महत्त्वाचे':tr("SimpleJustTheEssentialsTxt")}</option><option value="connected">{language==='hi'?'और परिवार — यादें और खास दिन':language==='mr'?'अधिक कुटुंब — आठवणी आणि खास दिवस':tr("MoreFamilyMemoriesAndMomentsTxt")}</option><option value="explorer">{language==='hi'?'सब देखें — सभी सदस्य सुविधाएँ':language==='mr'?'सगळे पहा — सर्व सदस्य सुविधा':tr("EverythingAllMemberFeaturesTxt")}</option></select><small>{language==='hi'?'इसे कभी भी बदल सकते हैं।':language==='mr'?'हे कधीही बदलू शकता.':tr("YouCanChangeThisAnytimeTxt")}</small></label>}
        {canAdmin&&<label className="mobile-more-setting"><span>{language === "hi" ? "प्रोफ़ाइल गोपनीयता पूर्वावलोकन" : language === "mr" ? "प्रोफाइल गोपनीयता पूर्वावलोकन" : tr("PreviewProfilePrivacyAsTxt")}</span><select className="select" value={visibility} onChange={(event) => setVisibility(event.target.value as Visibility)}><option value="public">{tr("PublicVisitorTxt")}</option><option value="member">{tr("FamilyMemberTxt")}</option><option value="admin">{tr("FamilyAdminTxt")}</option></select></label>}
        {canAdmin&&<label className="mobile-more-setting"><span>{language==='hi'?'सदस्य अनुभव देखें':language==='mr'?'सदस्य अनुभव पहा':tr("PreviewMemberExperienceTxt")}</span><select className="select" value={experience} onChange={e=>setExperiencePreview(e.target.value as ExperienceLevel)}>{(Object.keys(EXPERIENCE_LABELS) as ExperienceLevel[]).map(level=><option key={level} value={level}>{EXPERIENCE_LABELS[level].label}</option>)}</select></label>}
        {isSupabaseConfigured && <button className="mobile-more-action sign-out" onClick={() => { signOut(); setAuth(null); setShowMobileMenu(false); }}><span><LogOut />{t("SignOutTxt")}</span></button>}
      </section></div>}
      {showFamilyIntake && network && !demoPreview && (
        <FamilyIntakeAdmin familyName={network.name} onClose={()=>setShowFamilyIntake(false)} onCommitted={async()=>{await refresh()}} onNotify={notify}/>
      )}{" "}
      {showInvitation && (
        <InvitationModal
          members={members.filter((m) => m.profile_status === "approved")}
          onClose={() => setShowInvitation(false)}
          onDone={notify}
          onOpenGuide={(key)=>{setShowInvitation(false);openGuide(key)}}
        />
      )}{" "}
      {selected && (
        <ProfileDrawer
          member={selected}
          members={members}
          relationships={relationships}
          visibility={visibility}
          network={network}
          viewerMemberId={viewerMemberId || undefined}
          simple={experience === "simple"}
          canViewPrivateContact={
            !isSupabaseConfigured ||
            selected.id === auth?.member_id ||
            canAdmin
          }
          onClose={() => { setSelected(null); setSelectedHistory([]); }}
          onBack={selectedHistory.length ? backProfile : undefined}
          onSelect={openMember}
          onFocus={focus}
          canEdit={canAdmin || selected?.id === auth?.member_id}
          onEdit={() => {
            setEditingMember(selected);
            setShowForm(true);
          }}
          onManageRelationships={canAdmin && hasFeature("advanced.relationships")?()=>setShowRelationships(true):undefined}
          onExploreRelationship={hasFeature("advanced.relationships")?()=>setShowRelationshipExplorer(true):undefined}
          onReportCorrection={!demoPreview && !!auth ? async()=>{
            const note=window.prompt(`What looks wrong about ${selected.full_name}?`, "Relationship or profile detail needs correction");
            if(!note?.trim()) return;
            try{
              await repository.createChangeRequest({action:"other",target_member_id:selected.id,payload:{kind:"family_correction",note:note.trim(),member_name:selected.full_name}});
              notify(tr("CorrectionSentToTheFamilyOwnerForTxt"));
            }catch(e:any){notify(e.message||tr("CouldNotSendTheCorrectionPleaseTryTxt"))}
          }:undefined}
          events={hasFeature("remember.history")?lifeEvents:[]}
          memories={hasFeature("remember.memories")?memories.filter((m) => m.member_id === selected.id):[]}
          onAddEvent={hasFeature("remember.history")?() => {
            setEditingLifeEvent(undefined);
            setShowLifeEventEditor(true);
          }:undefined}
          onOpenGuide={(key)=>{setSelected(null);setSelectedHistory([]);openGuide(key)}}
          onEditEvent={hasFeature("remember.history")?(e) => {
            setEditingLifeEvent(e);
            setShowLifeEventEditor(true);
          }:undefined}
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
          canRemoveFoundational={!isSupabaseConfigured || network?.membership_role === tr("Owner2Txt")}
          onOpenGuide={(key)=>{setShowRelationships(false);openGuide(key)}}
        />
      )}{" "}
      {showImport && (
        <ImportModal
          existingMembers={members}
          existingRelationships={relationships}
          onClose={() => setShowImport(false)}
          onImport={importData}
          onOpenGuide={(key)=>{setShowImport(false);openGuide(key)}}
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
