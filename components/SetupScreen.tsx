"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, ArrowRight, BookOpen, FileSpreadsheet, Heart, KeyRound, LogOut, PlayCircle, ShieldCheck, Sparkles, TreePine, UsersRound } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { Member, Relationship } from "../lib/types";
import { NetworkSettings } from "../lib/network";
import { getVerticalDefinition } from "../app-shell/vertical-registry";
import { useLanguage } from "../lib/i18n";
const ImportModal = dynamic(() => import("./ImportModal"), { ssr: false });

const SETUP_COPY = {
  en: { brand:"Our Family", madeFor:"Made for every generation", hero:"A beautiful home for your whole family.", heroCopy:"Bring names, relationships, photographs and memories together in a private family space that everyone can understand.", simple:"Simple for every relative", privacy:"Your family controls privacy", excel:"Easy Excel guidance included", step1:"Name your family", step2:"Add your people", begin:"Let’s begin", create:"Create your family space", intro:"Start with a familiar name. You can add photographs and more details after your family is created.", familyName:"What should we call your family?", familyPlaceholder:"e.g. The Nandra Family", familyHelp:"This is what relatives will see at the top of every page.", description:"Say something about your family", optional:"optional", descriptionPlaceholder:"A place for our family stories, relationships and memories…", continue:"Continue", back:"Back", howBegin:"How would you like to begin?", choose:"Choose the easiest option for you. Nothing is shared until you confirm it.", best:"Best for an existing list", useExcel:"Use our family Excel", useExcelCopy:"Download the guided template, fill it at your pace, then preview every person and relationship before import.", openExcel:"Open Excel guide", few:"Start with a few relatives", fewCopy:"Create the family now with only its name. Add people, Excel/CSV and relationships gradually after you enter.", createFamily:"Create family", sample:"Explore a sample family", sampleCopy:"See how a large, multi-generation family looks before adding your own information.", viewSample:"View sample", control:"Your information stays in your control.", controlCopy:"Private contact details and family-only photographs are never shown on public pages." },
  hi: { brand:"हमारा परिवार", madeFor:"हर पीढ़ी के लिए बनाया गया", hero:"आपके पूरे परिवार का सुंदर घर।", heroCopy:"नाम, रिश्ते, तस्वीरें और यादें एक सुरक्षित पारिवारिक स्थान पर साथ लाएँ, जिसे हर कोई आसानी से समझ सके।", simple:"हर रिश्तेदार के लिए आसान", privacy:"गोपनीयता आपके परिवार के नियंत्रण में", excel:"आसान Excel मार्गदर्शन", step1:"परिवार का नाम", step2:"सदस्य जोड़ें", begin:"चलिए शुरू करें", create:"अपना परिवार बनाएँ", intro:"एक परिचित नाम से शुरुआत करें। तस्वीरें और अधिक जानकारी बाद में जोड़ सकते हैं।", familyName:"आप अपने परिवार को क्या नाम देना चाहेंगे?", familyPlaceholder:"जैसे नंदरा परिवार", familyHelp:"यही नाम हर पेज के ऊपर रिश्तेदारों को दिखाई देगा।", description:"अपने परिवार के बारे में कुछ लिखें", optional:"वैकल्पिक", descriptionPlaceholder:"हमारे रिश्तों, कहानियों और यादों के लिए एक जगह…", continue:"आगे बढ़ें", back:"वापस", howBegin:"आप कैसे शुरुआत करना चाहेंगे?", choose:"जो तरीका सबसे आसान लगे उसे चुनें। पुष्टि से पहले कुछ भी साझा नहीं होगा।", best:"मौजूदा सूची के लिए सबसे अच्छा", useExcel:"हमारा पारिवारिक Excel उपयोग करें", useExcelCopy:"मार्गदर्शित टेम्पलेट डाउनलोड करें, आराम से भरें और जोड़ने से पहले हर व्यक्ति व रिश्ता देखें।", openExcel:"Excel मार्गदर्शिका खोलें", few:"कुछ रिश्तेदारों से शुरू करें", fewCopy:"खाली परिवार बनाएँ, खुद और करीबी रिश्तेदार जोड़ें, फिर दूसरों को आमंत्रित करें।", createFamily:"परिवार बनाएँ", sample:"नमूना परिवार देखें", sampleCopy:"अपनी जानकारी जोड़ने से पहले देखें कि कई पीढ़ियों वाला बड़ा परिवार कैसा दिखता है।", viewSample:"नमूना देखें", control:"आपकी जानकारी आपके नियंत्रण में है।", controlCopy:"निजी संपर्क और परिवार की तस्वीरें सार्वजनिक पेज पर नहीं दिखाई जातीं।" },
  mr: { brand:"आपले कुटुंब", madeFor:"प्रत्येक पिढीसाठी बनवलेले", hero:"आपल्या संपूर्ण कुटुंबासाठी एक सुंदर घर.", heroCopy:"नावे, नाती, छायाचित्रे आणि आठवणी एका सुरक्षित कौटुंबिक जागेत एकत्र आणा, जी प्रत्येकाला सहज समजेल.", simple:"प्रत्येक नातेवाईकासाठी सोपे", privacy:"गोपनीयता कुटुंबाच्या नियंत्रणात", excel:"सोपे Excel मार्गदर्शन", step1:"कुटुंबाचे नाव", step2:"सदस्य जोडा", begin:"चला सुरुवात करूया", create:"आपली कौटुंबिक जागा तयार करा", intro:"ओळखीच्या नावाने सुरुवात करा. छायाचित्रे आणि अधिक माहिती नंतर जोडता येईल.", familyName:"आपल्या कुटुंबाला काय नाव द्यायचे?", familyPlaceholder:"उदा. नंदरा कुटुंब", familyHelp:"हे नाव प्रत्येक पानाच्या वर नातेवाईकांना दिसेल.", description:"कुटुंबाबद्दल थोडे लिहा", optional:"ऐच्छिक", descriptionPlaceholder:"आपल्या नाती, कथा आणि आठवणींसाठी एक जागा…", continue:"पुढे", back:"मागे", howBegin:"आपण सुरुवात कशी करू इच्छिता?", choose:"आपल्याला सर्वात सोपा पर्याय निवडा. पुष्टी करेपर्यंत काहीही सामायिक होणार नाही.", best:"आधीपासून यादी असल्यास सर्वोत्तम", useExcel:"आमचे कुटुंब Excel वापरा", useExcelCopy:"मार्गदर्शित नमुना डाउनलोड करा, निवांत भरा आणि जोडण्याआधी प्रत्येक व्यक्ती व नाते तपासा.", openExcel:"Excel मार्गदर्शक उघडा", few:"काही नातेवाईकांपासून सुरू करा", fewCopy:"रिकामे कुटुंब तयार करा, स्वतःला व जवळच्या नातेवाईकांना जोडा, मग इतरांना आमंत्रित करा.", createFamily:"कुटुंब तयार करा", sample:"नमुना कुटुंब पहा", sampleCopy:"आपली माहिती जोडण्यापूर्वी मोठे, अनेक पिढ्यांचे कुटुंब कसे दिसते ते पहा.", viewSample:"नमुना पहा", control:"आपली माहिती आपल्या नियंत्रणात आहे.", controlCopy:"खाजगी संपर्क आणि कुटुंबातील छायाचित्रे सार्वजनिक पानांवर दाखवली जात नाहीत." },
} as const;


type ClaimableProfile={network_id:string;family_name:string;member_id:string;member_name:string};
type ExistingFamily={network_id:string;name:string;role:string;is_active:boolean};
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
};

export default function SetupScreen({ onCreate,onExploreDemo,onJoinCode,claimableProfiles=[],existingFamilies=[],onOpenFamily,onSignOut,onClaimProfile,shared,canSetup,approvalRequired=false,onOpenGuide }: Props) {
  const { language } = useLanguage();
  const c = SETUP_COPY[language];
  const nameError = language === "hi" ? "कृपया अपने परिवार को एक नाम दें।" : language === "mr" ? "कृपया आपल्या कुटुंबाला नाव द्या." : "Please give your family space a name.";
  const [path,setPath]=useState<"entry"|"join"|"create">("entry");
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [joinCode,setJoinCode]=useState("");
  const [busy, setBusy] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [error, setError] = useState("");
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
    <header className="onboarding-topbar"><div className="onboarding-brand"><span><TreePine size={20}/></span>{c.brand}</div><div className="onboarding-account-actions">{onOpenGuide&&<button className="btn small" onClick={onOpenGuide}><BookOpen size={15}/> Explore & Guide</button>}<LanguageSwitcher/>{shared&&canSetup&&onSignOut&&<button className="btn small" onClick={()=>onSignOut()}><LogOut size={15}/> Sign out</button>}</div></header>
    <main className="onboarding-wrap">
      <section className="onboarding-story"><span className="warm-kicker"><Heart size={13} fill="currentColor"/> Made for every generation</span><h1>{path==="entry"?"Your family is one tap away.":path==="join"?"Join your family":"Create your family space"}</h1><p>{path==="entry"?"You can join an existing family, explore a sample, or create your own. You do not need to understand setup or technology first.":path==="join"?"Use the family code shared with you, or connect a profile we found for your verified email.":"Start small, use the guided Excel workbook, or build from a few relatives."}</p></section>
      <section className="onboarding-card alpha-entry-card">
      {path==="entry"&&<>
        <div className="setup-heading"><div className="brand-mark"><TreePine size={24}/></div><div><span className="setup-eyebrow">Welcome</span><h2>What would you like to do?</h2></div></div>
        {existingFamilies.length>0&&<div className="claimable-family-box existing-family-box"><span className="warm-kicker">Your families</span>{existingFamilies.map(f=><div className="claimable-family-row" key={f.network_id}><span><b>{f.name}</b><small>{f.role}</small></span><button className="btn" disabled={busy||!onOpenFamily} onClick={async()=>{if(!onOpenFamily)return;setBusy(true);setError("");try{await onOpenFamily(f.network_id)}catch(e:any){setError(e.message||"Could not open that family.")}finally{setBusy(false)}}}>Open family</button></div>)}</div>}
        {claimableProfiles.length>0&&<div className="claimable-family-box"><span className="warm-kicker">We may have found you</span>{claimableProfiles.slice(0,3).map(p=><div className="claimable-family-row" key={`${p.network_id}-${p.member_id}`}><span><b>{p.member_name}</b><small>{p.family_name}</small></span><button className="btn primary" disabled={busy} onClick={()=>claim(p.member_id)}>This is me</button></div>)}</div>}
        <div className="alpha-entry-options">
          <button className="alpha-entry-option primary-choice" onClick={()=>setPath("join")}><span><UsersRound/></span><b>Join my family</b><small>Use a family code or connect a family profile already created for you.</small><em>Join family <ArrowRight size={15}/></em></button>
          <button className="alpha-entry-option" onClick={onExploreDemo}><span><PlayCircle/></span><b>Explore a sample family</b><small>See the app immediately. Demo data is read-only and your Supabase account stays signed in.</small><em>Explore demo <ArrowRight size={15}/></em></button>
          <button className="alpha-entry-option" onClick={()=>setPath("create")}><span><TreePine/></span><b>Create my family</b><small>Upload Excel, start with a few relatives, or begin empty.</small><em>{approvalRequired?"Request / create":"Create now"} <ArrowRight size={15}/></em></button>
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
