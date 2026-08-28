"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, ArrowRight, BookOpen, BriefcaseBusiness, Building2, FileSpreadsheet, Handshake, Heart, KeyRound, LogOut, PlayCircle, ShieldCheck, Sparkles, Store, TreePine, UsersRound } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";
import { Member, Relationship } from "../lib/types";
import { NetworkSettings } from "../lib/network";
import { getVerticalDefinition } from "../app-shell/vertical-registry";
import type {NetworkVerticalKind} from "../core/verticals/contracts";
import {PRODUCTIZED_NETWORK_CONFIGS,type ProductizedVerticalKind} from "../templates/productized/config";
import { useLanguage } from "../lib/i18n";
const ImportModal = dynamic(() => import("./ImportModal"), { ssr: false });


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
  const {t}=useLanguage();
  const c = {
    brand:t("SetupBrandTxt"),madeFor:t("SetupMadeForTxt"),hero:t("SetupHeroTxt"),heroCopy:t("SetupHeroCopyTxt"),
    simple:t("SetupSimpleTxt"),privacy:t("SetupPrivacyTxt"),excel:t("SetupExcelTxt"),step1:t("SetupStep1Txt"),step2:t("SetupStep2Txt"),
    begin:t("SetupBeginTxt"),create:t("SetupCreateTxt"),intro:t("SetupIntroTxt"),familyName:t("SetupFamilyNameTxt"),familyPlaceholder:t("SetupFamilyPlaceholderTxt"),
    familyHelp:t("SetupFamilyHelpTxt"),description:t("SetupDescriptionTxt"),optional:t("OptionalTxt"),descriptionPlaceholder:t("SetupDescriptionPlaceholderTxt"),
    continue:t("ContinueTxt"),back:t("BackTxt"),howBegin:t("SetupHowBeginTxt"),choose:t("SetupChooseTxt"),best:t("SetupBestTxt"),useExcel:t("SetupUseExcelTxt"),
    useExcelCopy:t("SetupUseExcelCopyTxt"),openExcel:t("SetupOpenExcelTxt"),few:t("SetupFewTxt"),fewCopy:t("SetupFewCopyTxt"),createFamily:t("SetupCreateFamilyTxt"),
    sample:t("SetupSampleTxt"),sampleCopy:t("SetupSampleCopyTxt"),viewSample:t("SetupViewSampleTxt"),control:t("SetupControlTxt"),controlCopy:t("SetupControlCopyTxt")
  };
  const nameError=t("SetupNameErrorTxt");
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
    <main className={`onboarding-wrap onboarding-wrap-${path}`}>
      <section className="onboarding-story"><span className="warm-kicker"><Heart size={13} fill="currentColor"/> Made for every generation</span><h1>{path==="entry"?t("NetworkOneTapTxt"):path==="join"?t("JoinYourFamilyTxt"):path==="productized"?PRODUCTIZED_NETWORK_CONFIGS[productizedKind].createTitle:t("CreateFamilySpaceTxt")}</h1><p>{path==="entry"?t("SetupEntryDescTxt"):path==="join"?t("SetupJoinDescTxt"):path==="productized"?PRODUCTIZED_NETWORK_CONFIGS[productizedKind].createDescription:t("SetupCreateDescTxt")}</p></section>
      <section className="onboarding-card alpha-entry-card">
      {path==="entry"&&<>
        <div className="setup-heading"><div className="brand-mark"><TreePine size={24}/></div><div><span className="setup-eyebrow">Welcome</span><h2>{t("WhatWouldYouLikeTxt")}</h2></div></div>
        {existingFamilies.length>0&&<div className="claimable-family-box existing-family-box"><span className="warm-kicker">{t("YourNetworksTxt")}</span>{existingFamilies.map(f=><div className="claimable-family-row" key={f.network_id}><span><b>{f.name}</b><small>{f.vertical_kind?`${getVerticalDefinition(f.vertical_kind).displayName} · ${f.role}`:`Family · ${f.role}`}</small></span><button className="btn" disabled={busy||!onOpenFamily} onClick={async()=>{if(!onOpenFamily)return;setBusy(true);setError("");try{await onOpenFamily(f.network_id)}catch(e:any){setError(e.message||"Could not open that network.")}finally{setBusy(false)}}}>Open</button></div>)}</div>}
        {alumniInviteToken&&onAcceptAlumniInvite&&<div className="claimable-family-box"><span className="warm-kicker">{t("AlumniInvitationReadyTxt")}</span><div className="claimable-family-row"><span><b>You have a private Alumni invitation</b><small>{t("NothingJoinedUntilConfirmTxt")}</small></span><button className="btn primary" disabled={busy} onClick={async()=>{setBusy(true);setError("");try{await onAcceptAlumniInvite()}catch(e:any){setError(e.message||"Could not accept Alumni invitation.")}finally{setBusy(false)}}}>{t("JoinThisAlumniTxt")}</button></div></div>}
        {claimableAlumniProfiles.length>0&&<div className="claimable-family-box"><span className="warm-kicker">Alumni profiles matching your verified email</span>{claimableAlumniProfiles.slice(0,3).map(p=><div className="claimable-family-row" key={p.profile_id}><span><b>{p.full_name}</b><small>{p.network_name} · {[p.program,p.graduation_year].filter(Boolean).join(" · ")}</small></span><button className="btn primary" disabled={busy||!onClaimAlumniProfile} onClick={async()=>{if(!onClaimAlumniProfile)return;setBusy(true);setError("");try{await onClaimAlumniProfile(p.profile_id)}catch(e:any){setError(e.message||"Could not claim that alumni profile.")}finally{setBusy(false)}}}>{t("ThisIsMeTxt")}</button></div>)}</div>}
        {claimableProfiles.length>0&&<div className="claimable-family-box"><span className="warm-kicker">We may have found you</span>{claimableProfiles.slice(0,3).map(p=><div className="claimable-family-row" key={`${p.network_id}-${p.member_id}`}><span><b>{p.member_name}</b><small>{p.family_name}</small></span><button className="btn primary" disabled={busy} onClick={()=>claim(p.member_id)}>{t("ThisIsMeTxt")}</button></div>)}</div>}
        <div className="alpha-entry-options">
          <button className="alpha-entry-option primary-choice" onClick={()=>setPath("join")}><span><UsersRound/></span><b>{t("JoinMyFamilyTxt")}</b><small>{t("JoinMyFamilyDescTxt")}</small><em>{t("JoinFamilyTxt")} <ArrowRight size={15}/></em></button>
          <button className="alpha-entry-option" onClick={()=>setPath("create")}><span><TreePine/></span><b>{t("CreateMyFamilyTxt")}</b><small>{t("CreateMyFamilyDescTxt")}</small><em>{approvalRequired?"Request / create":"Create now"} <ArrowRight size={15}/></em></button>
          {shared&&onCreateAlumni&&<button className="alpha-entry-option" onClick={()=>setPath("alumni")}><span><UsersRound/></span><b>Create Alumni Network</b><small>Build an institution, batch or program directory with separate Alumni profiles.</small><em>Create Alumni <ArrowRight size={15}/></em></button>}
        </div>
          {shared&&<div className="playground-gallery"><div className="productized-create-head"><span className="warm-kicker"><PlayCircle size={13}/> {t("SafePlaygroundsTxt")}</span><b>{t("ExploreReleasedProductsTxt")}</b><small>{t("PlaygroundReadOnlyDescTxt")}</small></div><div className="playground-gallery-grid"><button onClick={onExploreDemo}><span className="playground-icon family"><TreePine/></span><b>{t("FamilyTxt")}</b><small>Tree, memories, milestones, gatherings, places and contributions.</small><em>{t("OpenPlaygroundTxt")} <ArrowRight size={13}/></em></button>{onExploreAlumniDemo&&<button onClick={onExploreAlumniDemo}><span className="playground-icon alumni"><UsersRound/></span><b>{t("AlumniTxt")}</b><small>Institution explorer, directory, community, places and connections.</small><em>{t("OpenPlaygroundTxt")} <ArrowRight size={13}/></em></button>}{onExploreProductizedDemo&&(["organization","business-trust","franchise","professional"] as ProductizedVerticalKind[]).map(kind=>{const pc=PRODUCTIZED_NETWORK_CONFIGS[kind];const Icon=kind==="organization"?Building2:kind==="business-trust"?Handshake:kind==="professional"?BriefcaseBusiness:Store;return <button key={kind} onClick={()=>onExploreProductizedDemo(kind)}><span className={`playground-icon ${kind}`}><Icon/></span><b>{kind==="professional"?t("ProfessionalShortTxt"):pc.shortLabel}</b><small>{kind==="professional"?t("ProfessionalHeroDescTxt"):pc.sampleDescription}</small><em>{t("OpenPlaygroundTxt")} <ArrowRight size={13}/></em></button>})}</div></div>}
          {shared&&onCreateProductized&&<div className="productized-create-strip"><div className="productized-create-head"><span className="warm-kicker">{t("NetworkOsProductsTxt")}</span><b>{t("CreateAnotherNetworkTxt")}</b><small>{t("SharedCapabilitiesDescTxt")}</small></div><div className="productized-create-grid">{(["organization","business-trust","franchise","professional"] as ProductizedVerticalKind[]).map(kind=>{const pc=PRODUCTIZED_NETWORK_CONFIGS[kind];const Icon=kind==="organization"?Building2:kind==="business-trust"?Handshake:kind==="professional"?BriefcaseBusiness:Store;return <div className="productized-create-card" key={kind}><button onClick={()=>{setProductizedKind(kind);setProductizedName("");setProductizedContext("");setProductizedDescription("");setPath("productized")}}><span><Icon/></span><b>{kind==="professional"?t("ProfessionalNetworkTxt"):pc.label}</b><small>{kind==="professional"?t("ProfessionalCreateDescTxt"):pc.createDescription}</small><em>{t("CreateNetworkTxt")} <ArrowRight size={14}/></em></button>{onExploreProductizedDemo&&<button className="productized-demo-link" onClick={()=>onExploreProductizedDemo(kind)}><PlayCircle size={14}/> {t("TrySampleTxt")}</button>}</div>})}</div>{onJoinProductizedCode&&<div className="productized-join-row"><div><KeyRound size={17}/><span><b>{t("HaveJoinCodeTxt")}</b><small>{t("JoinCodeDescTxt")}</small></span></div><input className="text-input" value={productizedJoinCode} onChange={e=>setProductizedJoinCode(e.target.value.toUpperCase())} placeholder={t("NetworkCodeTxt")} maxLength={12}/><button className="btn" disabled={busy||productizedJoinCode.trim().length<4} onClick={async()=>{if(!onJoinProductizedCode)return;setBusy(true);setError("");try{await onJoinProductizedCode(productizedJoinCode.trim())}catch(e:any){setError(e.message||"Could not join that network.")}finally{setBusy(false)}}}>{t("JoinNetworkTxt")}</button></div>}</div>}
        <div className="setup-privacy"><ShieldCheck size={17}/><span><b>{t("AlreadyInvitedLinkTxt")}</b> Open that private invitation link after signing in and it will connect you to the intended profile.</span></div>
      </>}
      {path==="join"&&<>
        <button className="setup-back" onClick={()=>{setPath("entry");setError("")}}><ArrowLeft size={15}/> {t("BackTxt")}</button>
        <div className="setup-heading compact-heading"><div><span className="setup-eyebrow">Fastest way in</span><h2>{t("EnterFamilyCodeTxt")}</h2></div></div>
        <p className="setup-intro">Ask your family admin for the short code. It lets you explore the private family as a member; you can connect your own profile afterward.</p>
        <div className="join-code-row"><div className="field"><label>Family code</label><input className="text-input family-code-input" value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} placeholder="e.g. A1B2C3D4" maxLength={12} autoCapitalize="characters" onKeyDown={e=>e.key==="Enter"&&join()}/></div><button className="btn primary" disabled={busy||joinCode.trim().length<4} onClick={join}><KeyRound size={16}/>{busy?"Joining…":"Join family"}</button></div>
        {claimableProfiles.length>0&&<><div className="entry-or"><span>{t("OrTxt")}</span></div><div className="claimable-family-box"><b>{t("ProfilesMatchingEmailTxt")}</b>{claimableProfiles.map(p=><div className="claimable-family-row" key={p.member_id}><span><b>{p.member_name}</b><small>{p.family_name}</small></span><button className="btn" disabled={busy} onClick={()=>claim(p.member_id)}>{t("ThisIsMeTxt")}</button></div>)}</div></>}
        <button className="btn demo-inline" onClick={onExploreDemo}><PlayCircle size={16}/> Just explore the sample instead</button>
      </>}
      {path==="alumni"&&<>
        <button className="setup-back" onClick={()=>{setPath("entry");setError("")}}><ArrowLeft size={15}/> {t("BackTxt")}</button>
        <div className="setup-heading"><div><span className="setup-eyebrow">Alumni Network V1</span><h2>Create your alumni community</h2></div></div>
        <p className="setup-intro">Alumni data stays separate from Family members and relationships. Start with one institution/community; import batches after creation.</p>
        <div className="field spacious"><label>{t("NetworkNameTxt")}</label><input className="text-input" value={alumniName} onChange={e=>setAlumniName(e.target.value)} placeholder="e.g. COEP Alumni 2008–2012"/></div>
        <div className="field spacious"><label>{t("InstitutionCommunityTxt")}</label><input className="text-input" value={institution} onChange={e=>setInstitution(e.target.value)} placeholder="e.g. College of Engineering Pune"/></div>
        <div className="field spacious"><label>{t("DescriptionTxt")} <em>{t("OptionalTxt")}</em></label><textarea className="text-input" rows={3} value={alumniDescription} onChange={e=>setAlumniDescription(e.target.value)} placeholder="Who this alumni network is for…"/></div>
        <button className="btn primary setup-next" disabled={busy||!alumniName.trim()||!institution.trim()} onClick={async()=>{if(!onCreateAlumni)return;setBusy(true);setError("");try{await onCreateAlumni(alumniName.trim(),institution.trim(),alumniDescription.trim())}catch(e:any){setError(e.message||"Could not create Alumni Network.")}finally{setBusy(false)}}}>{t("CreateAlumniNetworkTxt")} <ArrowRight size={17}/></button>
      </>}
      {path==="productized"&&(()=>{const pc=PRODUCTIZED_NETWORK_CONFIGS[productizedKind];const Icon=productizedKind==="organization"?Building2:productizedKind==="business-trust"?Handshake:productizedKind==="professional"?BriefcaseBusiness:Store;const createTitle=productizedKind==="professional"?t("ProfessionalCreateTxt"):pc.createTitle;const createDescription=productizedKind==="professional"?t("ProfessionalCreateDescTxt"):pc.createDescription;const shortLabel=productizedKind==="professional"?t("ProfessionalShortTxt"):pc.shortLabel;return <>
        <button className="setup-back" onClick={()=>{setPath("entry");setError("")}}><ArrowLeft size={15}/> {t("BackTxt")}</button>
        <div className="setup-heading"><div className="brand-mark"><Icon size={24}/></div><div><span className="setup-eyebrow">{t("ReadyProductTxt")}</span><h2>{createTitle}</h2></div></div>
        <p className="setup-intro">{createDescription}</p>
        <div className="field spacious"><label>{t("NetworkNameTxt")}</label><input className="text-input" value={productizedName} onChange={e=>setProductizedName(e.target.value)} placeholder={pc.namePlaceholder}/></div>
        <div className="field spacious"><label>{pc.contextLabel}</label><input className="text-input" value={productizedContext} onChange={e=>setProductizedContext(e.target.value)} placeholder={pc.contextPlaceholder}/></div>
        <div className="field spacious"><label>{t("DescriptionTxt")} <em>{t("OptionalTxt")}</em></label><textarea className="text-input" rows={3} value={productizedDescription} onChange={e=>setProductizedDescription(e.target.value)} placeholder={t("WhatMembersUnderstandTxt")}/></div>
        <div className="notice success-notice"><ShieldCheck size={15}/><span><b>{t("SeparateNetworkSharedPlatformTxt")}</b> {t("ProductizedCreationDescTxt")}</span></div>
        <button className="btn primary setup-next" disabled={busy||!productizedName.trim()||!productizedContext.trim()} onClick={async()=>{if(!onCreateProductized)return;setBusy(true);setError("");try{await onCreateProductized(productizedKind,productizedName.trim(),productizedContext.trim(),productizedDescription.trim())}catch(e:any){setError(e.message||`Could not create ${pc.label}.`)}finally{setBusy(false)}}}>{t("CreateTxt")} {shortLabel} <ArrowRight size={17}/></button>
      </>})()}
      {path==="create"&&<>
        <button className="setup-back" onClick={()=>{if(step===2)setStep(1);else setPath("entry");setError("")}}><ArrowLeft size={15}/> {t("BackTxt")}</button>
        {step===1?<>
          <div className="setup-heading"><div><span className="setup-eyebrow">1 · {t("FamilyBasicsTxt")}</span><h2>{c.create}</h2></div></div><p className="setup-intro">Give the family a familiar name. You can add or import people on the next step.</p>
          <div className="field spacious"><label>{c.familyName}</label><input className="text-input" value={name} onChange={e=>setName(e.target.value)} placeholder={c.familyPlaceholder} autoFocus onKeyDown={e=>e.key==="Enter"&&continueSetup()}/><small>{c.familyHelp}</small></div>
          <div className="field spacious"><label>{c.description} <em>{c.optional}</em></label><textarea className="text-input" rows={3} value={description} onChange={e=>setDescription(e.target.value)} placeholder={c.descriptionPlaceholder}/></div>
          <div className="setup-create-actions">
            <button className="btn primary setup-next" disabled={!canSetup} onClick={continueSetup}>{t("ChooseHowStartTxt")} <ArrowRight size={17}/></button>
            <button className="btn" disabled={!canSetup||busy} onClick={()=>create("empty")}><Sparkles size={16}/> {t("CreateNowAddLaterTxt")}</button>
          </div>
          <small className="setup-minimum-note">Only the family name is required. You can add people, Excel/CSV and relationships after the family opens.</small>
        </>:<>
          <div className="setup-heading compact-heading"><div><span className="setup-eyebrow">2 · {name}</span><h2>{t("ChooseEasiestStartTxt")}</h2></div></div>
          {approvalRequired&&<div className="notice"><ShieldCheck size={15}/> Platform approval is currently enabled. Your request will wait for approval before the family is created.</div>}
          <div className="family-start-options">
            <button className="family-start-card recommended" disabled={busy||!canSetup} onClick={()=>create("empty")}><span className="start-icon"><UsersRound/></span><span className="recommended-pill">{t("RecommendedLowestEffortTxt")}</span><strong>{t("BuildTogetherRelativesTxt")}</strong><small>Create the family first, then share simple branch forms with 3–5 relatives. They do not need to learn the app or see the private family tree.</small><b>{approvalRequired?"Request family":"Create family & collect branches"} <ArrowRight size={15}/></b></button>
            <button className="family-start-card" disabled={busy||!canSetup} onClick={()=>setShowImport(true)}><span className="start-icon"><FileSpreadsheet/></span><strong>{t("UploadExcelCsvTxt")}</strong><small>Best when you already have a family list. Preview names and relationships before adding them.</small><b>Open Excel guide <ArrowRight size={15}/></b></button>
            <button className="family-start-card" disabled={busy||!canSetup} onClick={()=>create("empty")}><span className="start-icon"><Sparkles/></span><strong>{t("StartMyselfTxt")}</strong><small>Create the family now and add yourself or close relatives manually.</small><b>{approvalRequired?"Request family":"Create family now"} <ArrowRight size={15}/></b></button>
          </div>
        </>}
      </>}
      {error&&<div className="notice danger-text">{error}</div>}
      </section>
    </main>
    {showImport&&<ImportModal onClose={()=>setShowImport(false)} onImport={(members,relationships)=>{setShowImport(false);create("import",members,relationships)}} onOpenGuide={onOpenGuide}/>}
  </div>;
}
