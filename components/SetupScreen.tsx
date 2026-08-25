"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, ArrowRight, BookOpen, Building2, FileSpreadsheet, Handshake, Heart, KeyRound, LogOut, PlayCircle, ShieldCheck, Sparkles, Store, TreePine, UsersRound } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";
import { Member, Relationship } from "../lib/types";
import { NetworkSettings } from "../lib/network";
import { getVerticalDefinition } from "../app-shell/vertical-registry";
import type {NetworkVerticalKind} from "../core/verticals/contracts";
import {PRODUCTIZED_NETWORK_CONFIGS,type ProductizedVerticalKind} from "../templates/productized/config";
import { useLanguage } from "../lib/i18n";
const ImportModal = dynamic(() => import("./ImportModal"), { ssr: false });

const SETUP_COPY = {
  en: { brand:"Our Family", madeFor:"Made for every generation", hero:"A beautiful home for your whole family.", heroCopy:"Bring names, relationships, photographs and memories together in a private family space that everyone can understand.", simple:"Simple for every relative", privacy:"Your family controls privacy", excel:"Easy Excel guidance included", step1:"Name your family", step2:"Add your people", begin:"Let’s begin", create:"Create your family space", intro:"Start with a familiar name. You can add photographs and more details after your family is created.", familyName:"What should we call your family?", familyPlaceholder:"e.g. The Nandra Family", familyHelp:"This is what relatives will see at the top of every page.", description:"Say something about your family", optional:"optional", descriptionPlaceholder:"A place for our family stories, relationships and memories…", continue:"Continue", back:"Back", howBegin:"How would you like to begin?", choose:"Choose the easiest option for you. Nothing is shared until you confirm it.", best:"Best for an existing list", useExcel:"Use our family Excel", useExcelCopy:"Download the guided template, fill it at your pace, then preview every person and relationship before import.", openExcel:"Open Excel guide", few:"Start with a few relatives", fewCopy:"Create the family now with only its name. Add people, Excel/CSV and relationships gradually after you enter.", createFamily:"Create family", sample:"Explore a sample family", sampleCopy:"See how a large, multi-generation family looks before adding your own information.", viewSample:"View sample", control:"Your information stays in your control.", controlCopy:"Private contact details and family-only photographs are never shown on public pages." },
  hi: { brand:"हमारा परिवार", madeFor:"हर पीढ़ी के लिए बनाया गया", hero:"आपके पूरे परिवार का सुंदर घर।", heroCopy:"नाम, रिश्ते, तस्वीरें और यादें एक सुरक्षित पारिवारिक स्थान पर साथ लाएँ, जिसे हर कोई आसानी से समझ सके।", simple:"हर रिश्तेदार के लिए आसान", privacy:"गोपनीयता आपके परिवार के नियंत्रण में", excel:"आसान Excel मार्गदर्शन", step1:"परिवार का नाम", step2:"सदस्य जोड़ें", begin:"चलिए शुरू करें", create:"अपना परिवार बनाएँ", intro:"एक परिचित नाम से शुरुआत करें। तस्वीरें और अधिक जानकारी बाद में जोड़ सकते हैं।", familyName:"आप अपने परिवार को क्या नाम देना चाहेंगे?", familyPlaceholder:"जैसे नंदरा परिवार", familyHelp:"यही नाम हर पेज के ऊपर रिश्तेदारों को दिखाई देगा।", description:"अपने परिवार के बारे में कुछ लिखें", optional:"वैकल्पिक", descriptionPlaceholder:"हमारे रिश्तों, कहानियों और यादों के लिए एक जगह…", continue:"आगे बढ़ें", back:"वापस", howBegin:"आप कैसे शुरुआत करना चाहेंगे?", choose:"जो तरीका सबसे आसान लगे उसे चुनें। पुष्टि से पहले कुछ भी साझा नहीं होगा।", best:"मौजूदा सूची के लिए सबसे अच्छा", useExcel:"हमारा पारिवारिक Excel उपयोग करें", useExcelCopy:"मार्गदर्शित टेम्पलेट डाउनलोड करें, आराम से भरें और जोड़ने से पहले हर व्यक्ति व रिश्ता देखें।", openExcel:"Excel मार्गदर्शिका खोलें", few:"कुछ रिश्तेदारों से शुरू करें", fewCopy:"खाली परिवार बनाएँ, खुद और करीबी रिश्तेदार जोड़ें, फिर दूसरों को आमंत्रित करें।", createFamily:"परिवार बनाएँ", sample:"नमूना परिवार देखें", sampleCopy:"अपनी जानकारी जोड़ने से पहले देखें कि कई पीढ़ियों वाला बड़ा परिवार कैसा दिखता है।", viewSample:"नमूना देखें", control:"आपकी जानकारी आपके नियंत्रण में है।", controlCopy:"निजी संपर्क और परिवार की तस्वीरें सार्वजनिक पेज पर नहीं दिखाई जातीं।" },
  mr: { brand:"आपले कुटुंब", madeFor:"प्रत्येक पिढीसाठी बनवलेले", hero:"आपल्या संपूर्ण कुटुंबासाठी एक सुंदर घर.", heroCopy:"नावे, नाती, छायाचित्रे आणि आठवणी एका सुरक्षित कौटुंबिक जागेत एकत्र आणा, जी प्रत्येकाला सहज समजेल.", simple:"प्रत्येक नातेवाईकासाठी सोपे", privacy:"गोपनीयता कुटुंबाच्या नियंत्रणात", excel:"सोपे Excel मार्गदर्शन", step1:"कुटुंबाचे नाव", step2:"सदस्य जोडा", begin:"चला सुरुवात करूया", create:"आपली कौटुंबिक जागा तयार करा", intro:"ओळखीच्या नावाने सुरुवात करा. छायाचित्रे आणि अधिक माहिती नंतर जोडता येईल.", familyName:"आपल्या कुटुंबाला काय नाव द्यायचे?", familyPlaceholder:"उदा. नंदरा कुटुंब", familyHelp:"हे नाव प्रत्येक पानाच्या वर नातेवाईकांना दिसेल.", description:"कुटुंबाबद्दल थोडे लिहा", optional:"ऐच्छिक", descriptionPlaceholder:"आपल्या नाती, कथा आणि आठवणींसाठी एक जागा…", continue:"पुढे", back:"मागे", howBegin:"आपण सुरुवात कशी करू इच्छिता?", choose:"आपल्याला सर्वात सोपा पर्याय निवडा. पुष्टी करेपर्यंत काहीही सामायिक होणार नाही.", best:"आधीपासून यादी असल्यास सर्वोत्तम", useExcel:"आमचे कुटुंब Excel वापरा", useExcelCopy:"मार्गदर्शित नमुना डाउनलोड करा, निवांत भरा आणि जोडण्याआधी प्रत्येक व्यक्ती व नाते तपासा.", openExcel:"Excel मार्गदर्शक उघडा", few:"काही नातेवाईकांपासून सुरू करा", fewCopy:"रिकामे कुटुंब तयार करा, स्वतःला व जवळच्या नातेवाईकांना जोडा, मग इतरांना आमंत्रित करा.", createFamily:"कुटुंब तयार करा", sample:"नमुना कुटुंब पहा", sampleCopy:"आपली माहिती जोडण्यापूर्वी मोठे, अनेक पिढ्यांचे कुटुंब कसे दिसते ते पहा.", viewSample:"नमुना पहा", control:"आपली माहिती आपल्या नियंत्रणात आहे.", controlCopy:"खाजगी संपर्क आणि कुटुंबातील छायाचित्रे सार्वजनिक पानांवर दाखवली जात नाहीत." },
} as const;


type ClaimableProfile={network_id:string;family_name:string;member_id:string;member_name:string};
type ExistingFamily={network_id:string;name:string;role:string;is_active:boolean;vertical_kind?:NetworkVerticalKind|null};
type ClaimableAlumni={profile_id:string;network_id:string;network_name:string;full_name:string;graduation_year?:number|null;program?:string|null};
type Props = {
  onCreate: (settings: NetworkSettings, mode: "empty" | "demo" | "import", members?: Member[], relationships?: Relationship[]) => Promise<void> | void;
  onExploreDemo:()=>void;
  onJoinCode:(code:string)=>Promise<void>;
  claimableProfiles?:ClaimableProfile[];
  existingFamilies?:ExistingFamily[];
  onOpenFamily?:(networkId:string)=>Promise<void>;
  onSignOut?:()=>Promise<void>|void;
  onClaimProfile?:(memberId:string)=>Promise<void>;
  shared: boolean;
  canSetup: boolean;
  approvalRequired?: boolean;
  onOpenGuide?:()=>void;
  claimableAlumniProfiles?:ClaimableAlumni[];
  onClaimAlumniProfile?:(profileId:string)=>Promise<void>;
  onCreateAlumni?:(name:string,institution:string,description:string)=>Promise<void>;
  onExploreAlumniDemo?:()=>void;
  alumniInviteToken?:string;
  onAcceptAlumniInvite?:()=>Promise<void>;
  onCreateProductized?:(kind:ProductizedVerticalKind,name:string,contextValue:string,description:string)=>Promise<void>;
  onExploreProductizedDemo?:(kind:ProductizedVerticalKind)=>void;
  onJoinProductizedCode?:(code:string)=>Promise<void>;
};

export default function SetupScreen({ onCreate,onExploreDemo,onJoinCode,claimableProfiles=[],existingFamilies=[],onOpenFamily,onSignOut,onClaimProfile,shared,canSetup,approvalRequired=false,onOpenGuide,claimableAlumniProfiles=[],onClaimAlumniProfile,onCreateAlumni,onExploreAlumniDemo,alumniInviteToken,onAcceptAlumniInvite,onCreateProductized,onExploreProductizedDemo,onJoinProductizedCode }: Props) {
  const { language } = useLanguage();
  const c = SETUP_COPY[language];
  const nameError = language === "hi" ? "कृपया अपने परिवार को एक नाम दें।" : language === "mr" ? "कृपया आपल्या कुटुंबाला नाव द्या." : "Please give your family space a name.";
  const [path,setPath]=useState<"entry"|"join"|"create"|"alumni"|"productized">("entry");
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [joinCode,setJoinCode]=useState("");
  const [busy, setBusy] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [error, setError] = useState("");
  const [institution,setInstitution]=useState("");
  const [alumniName,setAlumniName]=useState("");
  const [alumniDescription,setAlumniDescription]=useState("");
  const [productizedKind,setProductizedKind]=useState<ProductizedVerticalKind>("organization");
  const [productizedName,setProductizedName]=useState("");
  const [productizedContext,setProductizedContext]=useState("");
  const [productizedDescription,setProductizedDescription]=useState("");
  const [productizedJoinCode,setProductizedJoinCode]=useState("");
  const familyVertical = getVerticalDefinition("family");
  const familyLabels = familyVertical.legacyNetworkLabels;

  const create = async (mode: "empty" | "demo" | "import", members: Member[] = [], relationships: Relationship[] = []) => {
    setError("");
    if (!name.trim()) { setStep(1); setError(nameError); return; }
    setBusy(true);
    try {
      await onCreate({ id: "network", name: name.trim(), description: description.trim(), entity_label: familyLabels.entityLabel, entity_label_plural: familyLabels.entityLabelPlural, level_label: familyLabels.levelLabel, level_label_plural: familyLabels.levelLabelPlural, parent_label: familyLabels.parentLabel, child_label: familyLabels.childLabel, peer_label: familyLabels.peerLabel, network_template: "family", vertical_kind: familyVertical.kind }, mode, members, relationships);
    } catch (e: any) { setError(e.message || "We could not create your family space. Please try again."); } finally { setBusy(false); }
  };
  const continueSetup=()=>{if(!name.trim()){setError(nameError);return;}setError("");setStep(2)};
  const join=async()=>{if(!joinCode.trim())return;setBusy(true);setError("");try{await onJoinCode(joinCode.trim())}catch(e:any){setError(e.message||"We could not join that family. Check the code and try again.")}finally{setBusy(false)}};
  const claim=async(id:string)=>{if(!onClaimProfile)return;setBusy(true);setError("");try{await onClaimProfile(id)}catch(e:any){setError(e.message||"We could not connect that family profile.")}finally{setBusy(false)}};

  return <div className="family-onboarding alpha-entry">
    <header className="onboarding-topbar"><div className="onboarding-brand"><span><TreePine size={20}/></span>{c.brand}</div><div className="onboarding-account-actions">{onOpenGuide&&<button className="btn small" onClick={onOpenGuide}><BookOpen size={15}/> Explore & Guide</button>}<ThemeSwitcher compact/><LanguageSwitcher/>{shared&&canSetup&&onSignOut&&<button className="btn small" onClick={()=>onSignOut()}><LogOut size={15}/> Sign out</button>}</div></header>
    <main className="onboarding-wrap">
      <section className="onboarding-story"><span className="warm-kicker"><Heart size={13} fill="currentColor"/> Made for every generation</span><h1>{path==="entry"?"Your network is one tap away.":path==="join"?"Join your family":path==="productized"?PRODUCTIZED_NETWORK_CONFIGS[productizedKind].createTitle:"Create your family space"}</h1><p>{path==="entry"?"Open an existing network, explore a sample, or create Family, Alumni, Organization, Business Trust or Franchise spaces from one platform.":path==="join"?"Use the family code shared with you, or connect a profile we found for your verified email.":path==="productized"?PRODUCTIZED_NETWORK_CONFIGS[productizedKind].createDescription:"Start small, use the guided Excel workbook, or build from a few relatives."}</p></section>
      <section className="onboarding-card alpha-entry-card">
      {path==="entry"&&<>
        <div className="setup-heading"><div className="brand-mark"><TreePine size={24}/></div><div><span className="setup-eyebrow">Welcome</span><h2>What would you like to do?</h2></div></div>
        {existingFamilies.length>0&&<div className="claimable-family-box existing-family-box"><span className="warm-kicker">Your networks</span>{existingFamilies.map(f=><div className="claimable-family-row" key={f.network_id}><span><b>{f.name}</b><small>{f.vertical_kind?`${getVerticalDefinition(f.vertical_kind).displayName} · ${f.role}`:`Family · ${f.role}`}</small></span><button className="btn" disabled={busy||!onOpenFamily} onClick={async()=>{if(!onOpenFamily)return;setBusy(true);setError("");try{await onOpenFamily(f.network_id)}catch(e:any){setError(e.message||"Could not open that network.")}finally{setBusy(false)}}}>Open</button></div>)}</div>}
        {alumniInviteToken&&onAcceptAlumniInvite&&<div className="claimable-family-box"><span className="warm-kicker">Alumni invitation ready</span><div className="claimable-family-row"><span><b>You have a private Alumni invitation</b><small>Nothing is joined until you confirm.</small></span><button className="btn primary" disabled={busy} onClick={async()=>{setBusy(true);setError("");try{await onAcceptAlumniInvite()}catch(e:any){setError(e.message||"Could not accept Alumni invitation.")}finally{setBusy(false)}}}>Yes, join this Alumni Network</button></div></div>}
        {claimableAlumniProfiles.length>0&&<div className="claimable-family-box"><span className="warm-kicker">Alumni profiles matching your verified email</span>{claimableAlumniProfiles.slice(0,3).map(p=><div className="claimable-family-row" key={p.profile_id}><span><b>{p.full_name}</b><small>{p.network_name} · {[p.program,p.graduation_year].filter(Boolean).join(" · ")}</small></span><button className="btn primary" disabled={busy||!onClaimAlumniProfile} onClick={async()=>{if(!onClaimAlumniProfile)return;setBusy(true);setError("");try{await onClaimAlumniProfile(p.profile_id)}catch(e:any){setError(e.message||"Could not claim that alumni profile.")}finally{setBusy(false)}}}>This is me</button></div>)}</div>}
        {claimableProfiles.length>0&&<div className="claimable-family-box"><span className="warm-kicker">We may have found you</span>{claimableProfiles.slice(0,3).map(p=><div className="claimable-family-row" key={`${p.network_id}-${p.member_id}`}><span><b>{p.member_name}</b><small>{p.family_name}</small></span><button className="btn primary" disabled={busy} onClick={()=>claim(p.member_id)}>This is me</button></div>)}</div>}
        <div className="alpha-entry-options">
          <button className="alpha-entry-option primary-choice" onClick={()=>setPath("join")}><span><UsersRound/></span><b>Join my family</b><small>Use a family code or connect a family profile already created for you.</small><em>Join family <ArrowRight size={15}/></em></button>
          <button className="alpha-entry-option" onClick={onExploreDemo}><span><PlayCircle/></span><b>Explore a sample family</b><small>See the app immediately. Demo data is read-only and your Supabase account stays signed in.</small><em>Explore demo <ArrowRight size={15}/></em></button>
          <button className="alpha-entry-option" onClick={()=>setPath("create")}><span><TreePine/></span><b>Create my family</b><small>Upload Excel, start with a few relatives, or begin empty.</small><em>{approvalRequired?"Request / create":"Create now"} <ArrowRight size={15}/></em></button>
          {shared&&onCreateAlumni&&<button className="alpha-entry-option" onClick={()=>setPath("alumni")}><span><UsersRound/></span><b>Create Alumni Network</b><small>Build an institution, batch or program directory with separate Alumni profiles.</small><em>Create Alumni <ArrowRight size={15}/></em></button>}
          {shared&&onExploreAlumniDemo&&<button className="alpha-entry-option" onClick={onExploreAlumniDemo}><span><PlayCircle/></span><b>Explore Alumni sample</b><small>Preview directory, cohorts and Alumni identity without changing real data.</small><em>Open Alumni Playground <ArrowRight size={15}/></em></button>}
          {shared&&<div className="playground-gallery"><div className="productized-create-head"><span className="warm-kicker"><PlayCircle size={13}/> Safe Playgrounds</span><b>Explore every released network product first</b><small>Each sample is read-only. Switch between products to understand the shared Network OS and each vertical's own language.</small></div><div className="playground-gallery-grid"><button onClick={onExploreDemo}><span className="playground-icon family"><TreePine/></span><b>Family</b><small>Tree, memories, milestones, gatherings, places and contributions.</small><em>Open Playground <ArrowRight size={13}/></em></button>{onExploreAlumniDemo&&<button onClick={onExploreAlumniDemo}><span className="playground-icon alumni"><UsersRound/></span><b>Alumni</b><small>Institution explorer, directory, community, places and connections.</small><em>Open Playground <ArrowRight size={13}/></em></button>}{onExploreProductizedDemo&&(["organization","business-trust","franchise"] as ProductizedVerticalKind[]).map(kind=>{const pc=PRODUCTIZED_NETWORK_CONFIGS[kind];const Icon=kind==="organization"?Building2:kind==="business-trust"?Handshake:Store;return <button key={kind} onClick={()=>onExploreProductizedDemo(kind)}><span className={`playground-icon ${kind}`}><Icon/></span><b>{pc.shortLabel}</b><small>{pc.sampleDescription}</small><em>Open Playground <ArrowRight size={13}/></em></button>})}</div></div>}
          {shared&&onCreateProductized&&<div className="productized-create-strip"><div className="productized-create-head"><span className="warm-kicker">Network OS products</span><b>Create another kind of trusted network</b><small>Each product uses shared capabilities but keeps its own structure, relationships and language.</small></div><div className="productized-create-grid">{(["organization","business-trust","franchise"] as ProductizedVerticalKind[]).map(kind=>{const pc=PRODUCTIZED_NETWORK_CONFIGS[kind];const Icon=kind==="organization"?Building2:kind==="business-trust"?Handshake:Store;return <div className="productized-create-card" key={kind}><button onClick={()=>{setProductizedKind(kind);setProductizedName("");setProductizedContext("");setProductizedDescription("");setPath("productized")}}><span><Icon/></span><b>{pc.label}</b><small>{pc.createDescription}</small><em>Create network <ArrowRight size={14}/></em></button>{onExploreProductizedDemo&&<button className="productized-demo-link" onClick={()=>onExploreProductizedDemo(kind)}><PlayCircle size={14}/> Try sample</button>}</div>})}</div>{onJoinProductizedCode&&<div className="productized-join-row"><div><KeyRound size={17}/><span><b>Have a Network OS join code?</b><small>Join an Organization, Business Trust or Franchise network shared with you.</small></span></div><input className="text-input" value={productizedJoinCode} onChange={e=>setProductizedJoinCode(e.target.value.toUpperCase())} placeholder="Network code" maxLength={12}/><button className="btn" disabled={busy||productizedJoinCode.trim().length<4} onClick={async()=>{if(!onJoinProductizedCode)return;setBusy(true);setError("");try{await onJoinProductizedCode(productizedJoinCode.trim())}catch(e:any){setError(e.message||"Could not join that network.")}finally{setBusy(false)}}}>Join network</button></div>}</div>}
        </div>
        <div className="setup-privacy"><ShieldCheck size={17}/><span><b>Already invited by a link?</b> Open that private invitation link after signing in and it will connect you to the intended profile.</span></div>
      </>}
      {path==="join"&&<>
        <button className="setup-back" onClick={()=>{setPath("entry");setError("")}}><ArrowLeft size={15}/> Back</button>
        <div className="setup-heading compact-heading"><div><span className="setup-eyebrow">Fastest way in</span><h2>Enter your family code</h2></div></div>
        <p className="setup-intro">Ask your family admin for the short code. It lets you explore the private family as a member; you can connect your own profile afterward.</p>
        <div className="join-code-row"><div className="field"><label>Family code</label><input className="text-input family-code-input" value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} placeholder="e.g. A1B2C3D4" maxLength={12} autoCapitalize="characters" onKeyDown={e=>e.key==="Enter"&&join()}/></div><button className="btn primary" disabled={busy||joinCode.trim().length<4} onClick={join}><KeyRound size={16}/>{busy?"Joining…":"Join family"}</button></div>
        {claimableProfiles.length>0&&<><div className="entry-or"><span>or</span></div><div className="claimable-family-box"><b>Profiles matching your verified email</b>{claimableProfiles.map(p=><div className="claimable-family-row" key={p.member_id}><span><b>{p.member_name}</b><small>{p.family_name}</small></span><button className="btn" disabled={busy} onClick={()=>claim(p.member_id)}>This is me</button></div>)}</div></>}
        <button className="btn demo-inline" onClick={onExploreDemo}><PlayCircle size={16}/> Just explore the sample instead</button>
      </>}
      {path==="alumni"&&<>
        <button className="setup-back" onClick={()=>{setPath("entry");setError("")}}><ArrowLeft size={15}/> Back</button>
        <div className="setup-heading"><div><span className="setup-eyebrow">Alumni Network V1</span><h2>Create your alumni community</h2></div></div>
        <p className="setup-intro">Alumni data stays separate from Family members and relationships. Start with one institution/community; import batches after creation.</p>
        <div className="field spacious"><label>Network name</label><input className="text-input" value={alumniName} onChange={e=>setAlumniName(e.target.value)} placeholder="e.g. COEP Alumni 2008–2012"/></div>
        <div className="field spacious"><label>Institution / community</label><input className="text-input" value={institution} onChange={e=>setInstitution(e.target.value)} placeholder="e.g. College of Engineering Pune"/></div>
        <div className="field spacious"><label>Description <em>optional</em></label><textarea className="text-input" rows={3} value={alumniDescription} onChange={e=>setAlumniDescription(e.target.value)} placeholder="Who this alumni network is for…"/></div>
        <button className="btn primary setup-next" disabled={busy||!alumniName.trim()||!institution.trim()} onClick={async()=>{if(!onCreateAlumni)return;setBusy(true);setError("");try{await onCreateAlumni(alumniName.trim(),institution.trim(),alumniDescription.trim())}catch(e:any){setError(e.message||"Could not create Alumni Network.")}finally{setBusy(false)}}}>Create Alumni Network <ArrowRight size={17}/></button>
      </>}
      {path==="productized"&&(()=>{const pc=PRODUCTIZED_NETWORK_CONFIGS[productizedKind];const Icon=productizedKind==="organization"?Building2:productizedKind==="business-trust"?Handshake:Store;return <>
        <button className="setup-back" onClick={()=>{setPath("entry");setError("")}}><ArrowLeft size={15}/> Back</button>
        <div className="setup-heading"><div className="brand-mark"><Icon size={24}/></div><div><span className="setup-eyebrow">Network OS · ready product</span><h2>{pc.createTitle}</h2></div></div>
        <p className="setup-intro">{pc.createDescription}</p>
        <div className="field spacious"><label>Network name</label><input className="text-input" value={productizedName} onChange={e=>setProductizedName(e.target.value)} placeholder={pc.namePlaceholder}/></div>
        <div className="field spacious"><label>{pc.contextLabel}</label><input className="text-input" value={productizedContext} onChange={e=>setProductizedContext(e.target.value)} placeholder={pc.contextPlaceholder}/></div>
        <div className="field spacious"><label>Description <em>optional</em></label><textarea className="text-input" rows={3} value={productizedDescription} onChange={e=>setProductizedDescription(e.target.value)} placeholder="What should members understand about this network?"/></div>
        <div className="notice success-notice"><ShieldCheck size={15}/><span><b>Separate network, shared platform.</b> Creation gives you Owner access, template-specific dimensions/projections, Admin import, join code, Community, Explorer, Places and governed Contributions.</span></div>
        <button className="btn primary setup-next" disabled={busy||!productizedName.trim()||!productizedContext.trim()} onClick={async()=>{if(!onCreateProductized)return;setBusy(true);setError("");try{await onCreateProductized(productizedKind,productizedName.trim(),productizedContext.trim(),productizedDescription.trim())}catch(e:any){setError(e.message||`Could not create ${pc.label}.`)}finally{setBusy(false)}}}>Create {pc.shortLabel} Network <ArrowRight size={17}/></button>
      </>})()}
      {path==="create"&&<>
        <button className="setup-back" onClick={()=>{if(step===2)setStep(1);else setPath("entry");setError("")}}><ArrowLeft size={15}/> Back</button>
        {step===1?<>
          <div className="setup-heading"><div><span className="setup-eyebrow">1 · Family basics</span><h2>{c.create}</h2></div></div><p className="setup-intro">Give the family a familiar name. You can add or import people on the next step.</p>
          <div className="field spacious"><label>{c.familyName}</label><input className="text-input" value={name} onChange={e=>setName(e.target.value)} placeholder={c.familyPlaceholder} autoFocus onKeyDown={e=>e.key==="Enter"&&continueSetup()}/><small>{c.familyHelp}</small></div>
          <div className="field spacious"><label>{c.description} <em>{c.optional}</em></label><textarea className="text-input" rows={3} value={description} onChange={e=>setDescription(e.target.value)} placeholder={c.descriptionPlaceholder}/></div>
          <div className="setup-create-actions">
            <button className="btn primary setup-next" disabled={!canSetup} onClick={continueSetup}>Choose how to start <ArrowRight size={17}/></button>
            <button className="btn" disabled={!canSetup||busy} onClick={()=>create("empty")}><Sparkles size={16}/> Create now · add people later</button>
          </div>
          <small className="setup-minimum-note">Only the family name is required. You can add people, Excel/CSV and relationships after the family opens.</small>
        </>:<>
          <div className="setup-heading compact-heading"><div><span className="setup-eyebrow">2 · {name}</span><h2>Choose the easiest starting point</h2></div></div>
          {approvalRequired&&<div className="notice"><ShieldCheck size={15}/> Platform approval is currently enabled. Your request will wait for approval before the family is created.</div>}
          <div className="family-start-options">
            <button className="family-start-card recommended" disabled={busy||!canSetup} onClick={()=>create("empty")}><span className="start-icon"><UsersRound/></span><span className="recommended-pill">Recommended · lowest effort</span><strong>Build together with relatives</strong><small>Create the family first, then share simple branch forms with 3–5 relatives. They do not need to learn the app or see the private family tree.</small><b>{approvalRequired?"Request family":"Create family & collect branches"} <ArrowRight size={15}/></b></button>
            <button className="family-start-card" disabled={busy||!canSetup} onClick={()=>setShowImport(true)}><span className="start-icon"><FileSpreadsheet/></span><strong>Upload Excel or CSV</strong><small>Best when you already have a family list. Preview names and relationships before adding them.</small><b>Open Excel guide <ArrowRight size={15}/></b></button>
            <button className="family-start-card" disabled={busy||!canSetup} onClick={()=>create("empty")}><span className="start-icon"><Sparkles/></span><strong>Start myself</strong><small>Create the family now and add yourself or close relatives manually.</small><b>{approvalRequired?"Request family":"Create family now"} <ArrowRight size={15}/></b></button>
          </div>
        </>}
      </>}
      {error&&<div className="notice danger-text">{error}</div>}
      </section>
    </main>
    {showImport&&<ImportModal onClose={()=>setShowImport(false)} onImport={(members,relationships)=>{setShowImport(false);create("import",members,relationships)}} onOpenGuide={onOpenGuide}/>}
  </div>;
}
