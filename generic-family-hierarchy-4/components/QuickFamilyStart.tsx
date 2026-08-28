"use client";
import {DEFAULT_CATALOG} from "../lib/i18n/catalog";
import {useLanguage} from "../lib/i18n";
import {useState} from "react";
import {ArrowRight,Heart,Link2,Plus,UserRound} from "lucide-react";
import {Member} from "../lib/types";

const RELS=[
  {value:"father",label:DEFAULT_CATALOG.FatherTxt,gender:"Male"},
  {value:"mother",label:DEFAULT_CATALOG.MotherTxt,gender:"Female"},
  {value:"husband",label:DEFAULT_CATALOG.HusbandTxt,gender:"Male"},
  {value:"wife",label:DEFAULT_CATALOG.WifeTxt,gender:"Female"},
  {value:"son",label:DEFAULT_CATALOG.SonTxt,gender:"Male"},
  {value:"daughter",label:DEFAULT_CATALOG.DaughterTxt,gender:"Female"},
] as const;

export default function QuickFamilyStart({viewer,suggestedName="",onAddMyself,onAddRelative,onImport,onBuildTogether,onDismiss}:{viewer?:Member;suggestedName?:string;onAddMyself:(name:string,gender:Member["gender"])=>Promise<void>;onAddRelative:(name:string,relationship:string,gender:Member["gender"])=>Promise<void>;onImport:()=>void;onBuildTogether?:()=>void;onDismiss:()=>void}){
 const {t:tr}=useLanguage();
 const [name,setName]=useState(viewer?"":suggestedName),[gender,setGender]=useState<Member["gender"]>("Male"),[relationship,setRelationship]=useState("father"),[busy,setBusy]=useState(false),[error,setError]=useState("");
 const add=async()=>{if(!name.trim())return;setBusy(true);setError("");try{if(!viewer)await onAddMyself(name.trim(),gender);else{const rel=RELS.find(x=>x.value===relationship)!;await onAddRelative(name.trim(),relationship,rel.gender as Member["gender"]);setName("");}}catch(e:any){setError(e.message||"Could not add this person.")}finally{setBusy(false)}};
 return <section className="card quick-family-start">
   <div className="quick-family-start-copy"><span className="warm-kicker"><Heart size={12}/> {tr("StartWithThePeopleClosestToYou2Txt")}</span><h2>{viewer?`Build ${viewer.full_name.split(/\s+/)[0]}’s close family`:tr("AddYourselfFirstTxt")}</h2><p>{viewer?tr("AddAParentPartnerOrChildWithTxt"):tr("YourFamilyAlreadyExistsAddYourselfSoTxt")}</p></div>
   <div className="quick-family-start-form">
    {viewer&&<label><span>{tr("RelationshipToYouTxt")}</span><select className="select" value={relationship} onChange={e=>setRelationship(e.target.value)}>{RELS.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}</select></label>}
    <label><span>{viewer?tr("TheirNameTxt"):tr("YourNameTxt")}</span><input className="text-input" value={name} onChange={e=>setName(e.target.value)} placeholder={viewer?"e.g. Sunita Deshmukh":"e.g. Amit Deshmukh"} onKeyDown={e=>e.key==="Enter"&&add()}/></label>
    {!viewer&&<label><span>{tr("GenderTxt")}{" "}<em>{tr("OptionalProfileDetailTxt")}</em></span><select className="select" value={gender} onChange={e=>setGender(e.target.value as Member["gender"])}><option>{tr("MaleTxt")}</option><option>{tr("FemaleTxt")}</option><option>{tr("OtherTxt")}</option></select></label>}
    <button className="btn primary" disabled={busy||!name.trim()} onClick={add}>{busy?tr("AddingTxt"):<>{viewer?<Plus size={16}/>:<UserRound size={16}/>} {viewer?tr("AddRelativeTxt"):tr("AddMyselfTxt")} <ArrowRight size={15}/></>}</button>
   </div>
   <div className="quick-family-start-alt">{onBuildTogether&&<button className="text-action quick-build-together" onClick={onBuildTogether}><Link2 size={14}/> {tr("RecommendedAskRelativesThroughSimpleFormsTxt")}</button>}<button className="text-action" onClick={onImport}>{tr("HaveAListUseExcelCSVTxt")}</button><button className="text-action" onClick={onDismiss}>{tr("ILlDoThisLaterTxt")}</button></div>
   {error&&<div className="notice danger-text">{error}</div>}
 </section>
}
