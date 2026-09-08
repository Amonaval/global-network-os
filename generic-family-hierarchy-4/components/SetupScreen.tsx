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
  networkInviteToken?:string;
  onAcceptNetworkInvite?:()=>Promise<void>;
  alumniInviteToken?:string;
  onAcceptAlumniInvite?:()=>Promise<void>;
  onCreateProductized?:(kind:ProductizedVerticalKind,name:string,contextValue:string,description:string)=>Promise<void>;
  onExploreProductizedDemo?:(kind:ProductizedVerticalKind)=>void;
  onJoinProductizedCode?:(code:string)=>Promise<void>;
};

export default function SetupScreen({ onCreate,onExploreDemo,onJoinCode,claimableProfiles=[],existingFamilies=[],onOpenFamily,onSignOut,onClaimProfile,shared,canSetup,approvalRequired=false,onOpenGuide,claimableAlumniProfiles=[],onClaimAlumniProfile,onCreateAlumni,onExploreAlumniDemo,networkInviteToken,onAcceptNetworkInvite,alumniInviteToken,onAcceptAlumniInvite,onCreateProductized,onExploreProductizedDemo,onJoinProductizedCode }: Props) {
 const {t:xp2t}=useLanguage();
 const {t:tr}=useLanguage();
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
  const [productizedStep,setProductizedStep]=useState<1|2>(1);
  const [alumniStep,setAlumniStep]=useState<1|2>(1);
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
  const createAlumniWithMode=async(mode:"build"|"excel"|"empty")=>{if(!onCreateAlumni)return;sessionStorage.setItem("trustweave:new-network-start",mode);setBusy(true);setError("");try{await onCreateAlumni(alumniName.trim(),institution.trim(),alumniDescription.trim())}catch(e:any){setError(e.message||tr("CouldNotCreateAlumniNetworkTxt"))}finally{setBusy(false)}};
  const createProductizedWithMode=async(mode:"build"|"excel"|"empty")=>{if(!onCreateProductized)return;sessionStorage.setItem("trustweave:new-network-start",mode);setBusy(true);setError("");try{await onCreateProductized(productizedKind,productizedName.trim(),productizedContext.trim(),productizedDescription.trim())}catch(e:any){setError(e.message||`Could not create ${PRODUCTIZED_NETWORK_CONFIGS[productizedKind].label}.`)}finally{setBusy(false)}};

  return <div className="family-onboarding alpha-entry" data-testid="qa-setup-shell">
    <header className="onboarding-topbar"><div className="onboarding-brand"><span><TreePine size={20}/></span>{c.brand}</div><div className="onboarding-account-actions">{onOpenGuide&&<button className="btn small" onClick={onOpenGuide}><BookOpen size={15}/> {tr("ExploreGuideTxt")}</button>}<ThemeSwitcher compact/><LanguageSwitcher/>{shared&&canSetup&&onSignOut&&<button className="btn small" onClick={()=>onSignOut()}><LogOut size={15}/> {tr("SignOutTxt")}</button>}</div></header>
    <main className={`onboarding-wrap onboarding-wrap-${path}`} data-testid="qa-start-flow">
      <section className="onboarding-story"><span className="warm-kicker"><Heart size={13} fill="currentColor"/> {tr("SetupMadeForTxt")}</span><h1>{path==="entry"?t("NetworkOneTapTxt"):path==="join"?t("JoinYourFamilyTxt"):path==="productized"?PRODUCTIZED_NETWORK_CONFIGS[productizedKind].createTitle:t("CreateFamilySpaceTxt")}</h1><p>{path==="entry"?t("SetupEntryDescTxt"):path==="join"?t("SetupJoinDescTxt"):path==="productized"?PRODUCTIZED_NETWORK_CONFIGS[productizedKind].createDescription:t("SetupCreateDescTxt")}</p></section>
      <section className="onboarding-card alpha-entry-card">
      {path==="entry"&&<>
        <div className="setup-heading"><div className="brand-mark"><TreePine size={24}/></div><div><span className="setup-eyebrow">{tr("WelcomeTxt")}</span><h2>{t("WhatWouldYouLikeTxt")}</h2></div></div>
        {existingFamilies.length>0&&<div className="claimable-family-box existing-family-box"><span className="warm-kicker">{t("YourNetworksTxt")}</span>{existingFamilies.map(f=><div className="claimable-family-row" key={f.network_id}><span><b>{f.name}</b><small>{f.vertical_kind?`${getVerticalDefinition(f.vertical_kind).displayName} · ${f.role}`:`Family · ${f.role}`}</small></span><button className="btn" disabled={busy||!onOpenFamily} onClick={async()=>{if(!onOpenFamily)return;setBusy(true);setError("");try{await onOpenFamily(f.network_id)}catch(e:any){setError(e.message||tr("CouldNotOpenThatNetworkTxt"))}finally{setBusy(false)}}}>{tr("OpenTxt")}</button></div>)}</div>}
        {networkInviteToken&&onAcceptNetworkInvite&&<div className="claimable-family-box"><span className="warm-kicker">{t("XP6NetworkInvitationReadyTxt")}</span><div className="claimable-family-row"><span><b>{t("XP6PrivateNetworkInvitationTxt")}</b><small>{t("NothingJoinedUntilConfirmTxt")}</small></span><button className="btn primary" disabled={busy} onClick={async()=>{setBusy(true);setError("");try{await onAcceptNetworkInvite()}catch(e:any){setError(e.message||t("XP6InviteFailedTxt"))}finally{setBusy(false)}}}>{t("XP6JoinInvitedNetworkTxt")}</button></div></div>}
        {alumniInviteToken&&onAcceptAlumniInvite&&<div className="claimable-family-box"><span className="warm-kicker">{t("AlumniInvitationReadyTxt")}</span><div className="claimable-family-row"><span><b>{tr("PrivateAlumniInvitationTxt")}</b><small>{t("NothingJoinedUntilConfirmTxt")}</small></span><button className="btn primary" disabled={busy} onClick={async()=>{setBusy(true);setError("");try{await onAcceptAlumniInvite()}catch(e:any){setError(e.message||tr("CouldNotAcceptAlumniInvitationTxt"))}finally{setBusy(false)}}}>{t("JoinThisAlumniTxt")}</button></div></div>}
        {claimableAlumniProfiles.length>0&&<div className="claimable-family-box"><span className="warm-kicker">{tr("AlumniProfilesMatchTxt")}</span>{claimableAlumniProfiles.slice(0,3).map(p=><div className="claimable-family-row" key={p.profile_id}><span><b>{p.full_name}</b><small>{p.network_name} · {[p.program,p.graduation_year].filter(Boolean).join(" · ")}</small></span><button className="btn primary" disabled={busy||!onClaimAlumniProfile} onClick={async()=>{if(!onClaimAlumniProfile)return;setBusy(true);setError("");try{await onClaimAlumniProfile(p.profile_id)}catch(e:any){setError(e.message||tr("CouldNotClaimThatAlumniProfileTxt"))}finally{setBusy(false)}}}>{t("ThisIsMeTxt")}</button></div>)}</div>}
        {claimableProfiles.length>0&&<div className="claimable-family-box"><span className="warm-kicker">{tr("MayHaveFoundYouTxt")}</span>{claimableProfiles.slice(0,3).map(p=><div className="claimable-family-row" key={`${p.network_id}-${p.member_id}`}><span><b>{p.member_name}</b><small>{p.family_name}</small></span><button className="btn primary" disabled={busy} onClick={()=>claim(p.member_id)}>{t("ThisIsMeTxt")}</button></div>)}</div>}
        <div className="alpha-entry-options">
          <button data-testid="qa-entry-join-family" className="alpha-entry-option primary-choice" onClick={()=>setPath("join")}><span><UsersRound/></span><b>{t("JoinMyFamilyTxt")}</b><small>{t("JoinMyFamilyDescTxt")}</small><em>{t("JoinFamilyTxt")} <ArrowRight size={15}/></em></button>
          <button data-testid="qa-entry-create-family" className="alpha-entry-option" onClick={()=>setPath("create")}><span><TreePine/></span><b>{t("CreateMyFamilyTxt")}</b><small>{t("CreateMyFamilyDescTxt")}</small><em>{approvalRequired?tr("RequestCreateTxt"):tr("CreateNowTxt")} <ArrowRight size={15}/></em></button>
          {shared&&onCreateAlumni&&<button data-testid="qa-entry-create-alumni" className="alpha-entry-option" onClick={()=>setPath("alumni")}><span><UsersRound/></span><b>{tr("CreateAlumniNetworkTxt")}</b><small>{tr("BuildAlumniDescTxt")}</small><em>{tr("CreateAlumniTxt")}{" "}<ArrowRight size={15}/></em></button>}
        </div>
          {shared&&<div className="playground-gallery"><div className="productized-create-head"><span className="warm-kicker"><PlayCircle size={13}/> {t("SafePlaygroundsTxt")}</span><b>{t("ExploreReleasedProductsTxt")}</b><small>{t("PlaygroundReadOnlyDescTxt")}</small></div><div className="playground-gallery-grid"><button onClick={onExploreDemo}><span className="playground-icon family"><TreePine/></span><b>{t("FamilyTxt")}</b><small>{tr("TreeMemoriesDescTxt")}</small><em>{t("OpenPlaygroundTxt")} <ArrowRight size={13}/></em></button>{onExploreAlumniDemo&&<button onClick={onExploreAlumniDemo}><span className="playground-icon alumni"><UsersRound/></span><b>{t("AlumniTxt")}</b><small>{tr("InstitutionExplorerDescTxt")}</small><em>{t("OpenPlaygroundTxt")} <ArrowRight size={13}/></em></button>}{onExploreProductizedDemo&&(["housing-society","family-association","association","organization","business-trust","franchise","professional"] as ProductizedVerticalKind[]).map(kind=>{const pc=PRODUCTIZED_NETWORK_CONFIGS[kind];const Icon=kind==="housing-society"?Building2:(kind==="association"||kind==="family-association")?UsersRound:kind==="organization"?Building2:kind==="business-trust"?Handshake:kind==="professional"?BriefcaseBusiness:Store;return <button key={kind} onClick={()=>onExploreProductizedDemo(kind)}><span className={`playground-icon ${kind}`}><Icon/></span><b>{kind==="professional"?t("ProfessionalShortTxt"):pc.shortLabel}</b><small>{kind==="professional"?t("ProfessionalHeroDescTxt"):pc.sampleDescription}</small><em>{t("OpenPlaygroundTxt")} <ArrowRight size={13}/></em></button>})}</div></div>}
          {shared&&onCreateProductized&&<div className="productized-create-strip"><div className="productized-create-head"><span className="warm-kicker">{t("NetworkOsProductsTxt")}</span><b>{t("CreateAnotherNetworkTxt")}</b><small>{t("SharedCapabilitiesDescTxt")}</small></div><div className="productized-create-grid">{(["housing-society","family-association","association","organization","business-trust","franchise","professional"] as ProductizedVerticalKind[]).map(kind=>{const pc=PRODUCTIZED_NETWORK_CONFIGS[kind];const Icon=kind==="housing-society"?Building2:(kind==="association"||kind==="family-association")?UsersRound:kind==="organization"?Building2:kind==="business-trust"?Handshake:kind==="professional"?BriefcaseBusiness:Store;return <div className="productized-create-card" key={kind}><button data-testid={`qa-entry-create-${kind}`} onClick={()=>{setProductizedKind(kind);setProductizedName("");setProductizedContext("");setProductizedDescription("");setProductizedStep(1);setPath("productized")}}><span><Icon/></span><b>{kind==="professional"?t("ProfessionalNetworkTxt"):pc.label}</b><small>{kind==="professional"?t("ProfessionalCreateDescTxt"):pc.createDescription}</small><em>{t("CreateNetworkTxt")} <ArrowRight size={14}/></em></button>{onExploreProductizedDemo&&<button className="productized-demo-link" onClick={()=>onExploreProductizedDemo(kind)}><PlayCircle size={14}/> {t("TrySampleTxt")}</button>}</div>})}</div>{onJoinProductizedCode&&<div className="productized-join-row"><div><KeyRound size={17}/><span><b>{t("HaveJoinCodeTxt")}</b><small>{t("JoinCodeDescTxt")}</small></span></div><input className="text-input" value={productizedJoinCode} onChange={e=>setProductizedJoinCode(e.target.value.toUpperCase())} placeholder={t("NetworkCodeTxt")} maxLength={12}/><button className="btn" disabled={busy||productizedJoinCode.trim().length<4} onClick={async()=>{if(!onJoinProductizedCode)return;setBusy(true);setError("");try{await onJoinProductizedCode(productizedJoinCode.trim())}catch(e:any){setError(e.message||tr("CouldNotJoinThatNetworkTxt"))}finally{setBusy(false)}}}>{t("JoinNetworkTxt")}</button></div>}</div>}
        <div className="setup-privacy"><ShieldCheck size={17}/><span><b>{t("AlreadyInvitedLinkTxt")}</b> {tr("OpenPrivateInvitationDescTxt")}</span></div>
      </>}
      {path==="join"&&<>
        <button className="setup-back" onClick={()=>{setPath("entry");setError("")}}><ArrowLeft size={15}/> {t("BackTxt")}</button>
        <div className="setup-heading compact-heading"><div><span className="setup-eyebrow">{tr("FastestWayInTxt")}</span><h2>{t("EnterFamilyCodeTxt")}</h2></div></div>
        <p className="setup-intro">{tr("AskAdminCodeDescTxt")}</p>
        <div className="join-code-row"><div className="field"><label>{tr("FamilyCodeTxt")}</label><input className="text-input family-code-input" value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} placeholder="e.g. A1B2C3D4" maxLength={12} autoCapitalize="characters" onKeyDown={e=>e.key==="Enter"&&join()}/></div><button className="btn primary" disabled={busy||joinCode.trim().length<4} onClick={join}><KeyRound size={16}/>{busy?tr("JoiningTxt"):tr("JoinFamilyTxt")}</button></div>
        {claimableProfiles.length>0&&<><div className="entry-or"><span>{t("OrTxt")}</span></div><div className="claimable-family-box"><b>{t("ProfilesMatchingEmailTxt")}</b>{claimableProfiles.map(p=><div className="claimable-family-row" key={p.member_id}><span><b>{p.member_name}</b><small>{p.family_name}</small></span><button className="btn" disabled={busy} onClick={()=>claim(p.member_id)}>{t("ThisIsMeTxt")}</button></div>)}</div></>}
        <button className="btn demo-inline" onClick={onExploreDemo}><PlayCircle size={16}/> {tr("ExploreSampleInsteadTxt")}</button>
      </>}
      {path==="alumni"&&<>
        <button className="setup-back" onClick={()=>{setPath("entry");setError("")}}><ArrowLeft size={15}/> {t("BackTxt")}</button>
        {alumniStep===1?<>
          <div className="setup-heading"><div><span className="setup-eyebrow">{tr("AlumniNetworkV1Txt")}</span><h2>{tr("CreateAlumniCommunityTxt")}</h2></div></div>
          <p className="setup-intro">{tr("AlumniDataStaysSeparateFromFamilyMembersTxt")}</p>
          <div className="field spacious"><label>{t("NetworkNameTxt")}</label><input className="text-input" value={alumniName} onChange={e=>setAlumniName(e.target.value)} placeholder={tr("EGCOEPAlumni20082012Txt")}/></div>
          <div className="field spacious"><label>{t("InstitutionCommunityTxt")}</label><input className="text-input" value={institution} onChange={e=>setInstitution(e.target.value)} placeholder={tr("EGCollegeOfEngineeringPuneTxt")}/></div>
          <div className="field spacious"><label>{t("DescriptionTxt")} <em>{t("OptionalTxt")}</em></label><textarea className="text-input" rows={3} value={alumniDescription} onChange={e=>setAlumniDescription(e.target.value)} placeholder={tr("WhoThisAlumniNetworkIsForTxt")}/></div>
          <button className="btn primary setup-next" disabled={busy||!alumniName.trim()||!institution.trim()} onClick={()=>{setError("");setAlumniStep(2)}}>{t("ChooseHowStartTxt")} <ArrowRight size={17}/></button>
        </>:<>
          <button className="setup-back inline-step-back" disabled={busy} onClick={()=>setAlumniStep(1)}><ArrowLeft size={15}/> {t("BackTxt")}</button>
          <div className="setup-heading compact-heading"><div><span className="setup-eyebrow">2 · {alumniName}</span><h2>{t("ChooseEasiestStartTxt")}</h2></div></div><div className="family-start-options">
            <button data-testid="qa-start-build" className="family-start-card recommended" disabled={busy} onClick={()=>createAlumniWithMode("build")}><span className="start-icon"><UsersRound/></span><span className="recommended-pill">{t("RecommendedLowestEffortTxt")}</span><strong>{xp2t("XP2Visible0491Txt")}</strong><small>{xp2t("XP2Visible0492Txt")}</small></button>
            <button data-testid="qa-start-excel" className="family-start-card" disabled={busy} onClick={()=>createAlumniWithMode("excel")}><span className="start-icon"><FileSpreadsheet/></span><strong>{t("UploadExcelCsvTxt")}</strong><small>{xp2t("XP2Visible0493Txt")}</small></button>
            <button data-testid="qa-start-empty" className="family-start-card" disabled={busy} onClick={()=>createAlumniWithMode("empty")}><span className="start-icon"><Sparkles/></span><strong>{xp2t("XP2Visible0494Txt")}</strong><small>{xp2t("XP2Visible0495Txt")}</small></button>
          </div>
        </>}
      </>}
      {path==="productized"&&(()=>{const pc=PRODUCTIZED_NETWORK_CONFIGS[productizedKind];const Icon=productizedKind==="housing-society"?Building2:(productizedKind==="association"||productizedKind==="family-association")?UsersRound:productizedKind==="organization"?Building2:productizedKind==="business-trust"?Handshake:productizedKind==="professional"?BriefcaseBusiness:Store;const createTitle=productizedKind==="professional"?t("ProfessionalCreateTxt"):pc.createTitle;const createDescription=productizedKind==="professional"?t("ProfessionalCreateDescTxt"):pc.createDescription;const shortLabel=productizedKind==="professional"?t("ProfessionalShortTxt"):pc.shortLabel;return <>
        <button className="setup-back" onClick={()=>{setPath("entry");setError("")}}><ArrowLeft size={15}/> {t("BackTxt")}</button>
        {productizedStep===1?<>
          <div className="setup-heading"><div className="brand-mark"><Icon size={24}/></div><div><span className="setup-eyebrow">{t("ReadyProductTxt")}</span><h2>{createTitle}</h2></div></div>
          <p className="setup-intro">{createDescription}</p>
          <div className="field spacious"><label>{t("NetworkNameTxt")}</label><input className="text-input" value={productizedName} onChange={e=>setProductizedName(e.target.value)} placeholder={pc.namePlaceholder}/></div>
          <div className="field spacious"><label>{pc.contextLabel}</label><input className="text-input" value={productizedContext} onChange={e=>setProductizedContext(e.target.value)} placeholder={pc.contextPlaceholder}/></div>
          <div className="field spacious"><label>{t("DescriptionTxt")} <em>{t("OptionalTxt")}</em></label><textarea className="text-input" rows={3} value={productizedDescription} onChange={e=>setProductizedDescription(e.target.value)} placeholder={t("WhatMembersUnderstandTxt")}/></div>
          <div className="notice success-notice"><ShieldCheck size={15}/><span><b>{t("SeparateNetworkSharedPlatformTxt")}</b> {t("ProductizedCreationDescTxt")}</span></div>
          <button className="btn primary setup-next" disabled={busy||!productizedName.trim()||!productizedContext.trim()} onClick={()=>{setError("");setProductizedStep(2)}}>{t("ChooseHowStartTxt")} <ArrowRight size={17}/></button>
        </>:<>
          <button className="setup-back inline-step-back" disabled={busy} onClick={()=>setProductizedStep(1)}><ArrowLeft size={15}/> {t("BackTxt")}</button>
          <div className="setup-heading compact-heading"><div><span className="setup-eyebrow">2 · {productizedName}</span><h2>{t("ChooseEasiestStartTxt")}</h2><small>{shortLabel}  {xp2t("XP2Visible0496Txt")}</small></div></div><div className="family-start-options">
            <button data-testid="qa-start-build" className="family-start-card recommended" disabled={busy} onClick={()=>createProductizedWithMode("build")}><span className="start-icon"><UsersRound/></span><span className="recommended-pill">{t("RecommendedLowestEffortTxt")}</span><strong>{xp2t("XP2Visible0491Txt")}</strong><small>{xp2t("XP2Visible0497Txt")}</small></button>
            <button data-testid="qa-start-excel" className="family-start-card" disabled={busy} onClick={()=>createProductizedWithMode("excel")}><span className="start-icon"><FileSpreadsheet/></span><strong>{t("UploadExcelCsvTxt")}</strong><small>{xp2t("XP2Visible0498Txt")}</small></button>
            <button data-testid="qa-start-empty" className="family-start-card" disabled={busy} onClick={()=>createProductizedWithMode("empty")}><span className="start-icon"><Sparkles/></span><strong>{xp2t("XP2Visible0494Txt")}</strong><small>{xp2t("XP2Visible0499Txt")}</small></button>
          </div>
        </>}
      </>})()}
      {path==="create"&&<>
        <button className="setup-back" onClick={()=>{if(step===2)setStep(1);else setPath("entry");setError("")}}><ArrowLeft size={15}/> {t("BackTxt")}</button>
        {step===1?<>
          <div className="setup-heading"><div><span className="setup-eyebrow">1 · {t("FamilyBasicsTxt")}</span><h2>{c.create}</h2></div></div><p className="setup-intro">{tr("FamilyNameHelpTxt")}</p>
          <div className="field spacious"><label>{c.familyName}</label><input className="text-input" value={name} onChange={e=>setName(e.target.value)} placeholder={c.familyPlaceholder} autoFocus onKeyDown={e=>e.key==="Enter"&&continueSetup()}/><small>{c.familyHelp}</small></div>
          <div className="field spacious"><label>{c.description} <em>{c.optional}</em></label><textarea className="text-input" rows={3} value={description} onChange={e=>setDescription(e.target.value)} placeholder={c.descriptionPlaceholder}/></div>
          <div className="setup-create-actions">
            <button className="btn primary setup-next" disabled={!canSetup} onClick={continueSetup}>{t("ChooseHowStartTxt")} <ArrowRight size={17}/></button>
            <button className="btn" disabled={!canSetup||busy} onClick={()=>create("empty")}><Sparkles size={16}/> {t("CreateNowAddLaterTxt")}</button>
          </div>
          <small className="setup-minimum-note">{tr("OnlyFamilyNameRequiredTxt")}</small>
        </>:<>
          <div className="setup-heading compact-heading"><div><span className="setup-eyebrow">2 · {name}</span><h2>{t("ChooseEasiestStartTxt")}</h2></div></div>
          {approvalRequired&&<div className="notice"><ShieldCheck size={15}/> {tr("PlatformApprovalIsCurrentlyEnabledYourRequestTxt")}</div>}
          <div className="family-start-options">
            <button data-testid="qa-start-build" className="family-start-card recommended" disabled={busy||!canSetup} onClick={()=>create("empty")}><span className="start-icon"><UsersRound/></span><span className="recommended-pill">{t("RecommendedLowestEffortTxt")}</span><strong>{t("BuildTogetherRelativesTxt")}</strong><small>{tr("CreateTheFamilyFirstThenShareSimpleTxt")}</small><b>{approvalRequired?tr("RequestFamilyTxt"):tr("CreateFamilyAndCollectBranchesTxt")} <ArrowRight size={15}/></b></button>
            <button data-testid="qa-start-excel" className="family-start-card" disabled={busy||!canSetup} onClick={()=>setShowImport(true)}><span className="start-icon"><FileSpreadsheet/></span><strong>{t("UploadExcelCsvTxt")}</strong><small>{tr("BestWhenYouAlreadyHaveAFamilyTxt")}</small><b>{tr("SetupOpenExcelTxt")}{" "}<ArrowRight size={15}/></b></button>
            <button data-testid="qa-start-empty" className="family-start-card" disabled={busy||!canSetup} onClick={()=>create("empty")}><span className="start-icon"><Sparkles/></span><strong>{t("StartMyselfTxt")}</strong><small>{tr("CreateFamilyNowTxt")}</small><b>{approvalRequired?tr("RequestFamilyTxt"):tr("CreateFamilyNow2Txt")} <ArrowRight size={15}/></b></button>
          </div>
        </>}
      </>}
      {error&&<div className="notice danger-text">{error}</div>}
      </section>
    </main>
    {showImport&&<ImportModal onClose={()=>setShowImport(false)} onImport={(members,relationships)=>{setShowImport(false);create("import",members,relationships)}} onOpenGuide={onOpenGuide}/>}
  </div>;
}
