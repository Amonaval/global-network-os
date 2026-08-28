"use client";
import {useLanguage} from "../lib/i18n";
import {useMemo,useState,type Dispatch,type SetStateAction} from "react";
import {ArrowLeft,ArrowRight,CheckCircle2,Heart,Plus,Send,ShieldCheck,Trash2,UsersRound} from "lucide-react";
import type {FamilyIntakePreview,IntakePersonInput,IntakeRelationshipInput} from "../lib/family-intake-types";
import {submitFamilyIntake} from "../lib/remote";

type DraftPerson={id:string;label:string;full_name:string;birth_year:string;gender:""|"Male"|"Female"|"Other";city:string;role:string;offset:number};
const uid=()=>globalThis.crypto?.randomUUID?.()||`p-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const blank=(label:string,role:string,offset:number,gender:DraftPerson["gender"]=""):DraftPerson=>({id:uid(),label,full_name:"",birth_year:"",gender,city:"",role,offset});

export default function FamilyBranchIntakeForm({token,preview}:{token:string;preview:FamilyIntakePreview}){
 const {t:tr}=useLanguage();
 const [step,setStep]=useState(0),[busy,setBusy]=useState(false),[error,setError]=useState(""),[done,setDone]=useState<{people:number;relationships:number}|null>(null);
 const [self,setSelf]=useState<DraftPerson>(()=>blank("You","self",0));
 const [father,setFather]=useState<DraftPerson>(()=>blank("Father","father",-1,"Male"));
 const [mother,setMother]=useState<DraftPerson>(()=>blank("Mother","mother",-1,"Female"));
 const [spouse,setSpouse]=useState<DraftPerson>(()=>blank("Spouse","spouse",0));
 const [children,setChildren]=useState<DraftPerson[]>([]),[siblings,setSiblings]=useState<DraftPerson[]>([]);
 const [pgf,setPgf]=useState<DraftPerson>(()=>blank("Father's father","paternal_grandfather",-2,"Male"));
 const [pgm,setPgm]=useState<DraftPerson>(()=>blank("Father's mother","paternal_grandmother",-2,"Female"));
 const [mgf,setMgf]=useState<DraftPerson>(()=>blank("Mother's father","maternal_grandfather",-2,"Male"));
 const [mgm,setMgm]=useState<DraftPerson>(()=>blank("Mother's mother","maternal_grandmother",-2,"Female"));
 const [extended,setExtended]=useState<DraftPerson[]>([]);
 const steps=["About you","Parents","Your family","Siblings","Grandparents","More relatives","Review"];
 const all=useMemo(()=>[self,father,mother,spouse,...children,...siblings,pgf,pgm,mgf,mgm,...extended].filter(p=>p.full_name.trim()),[self,father,mother,spouse,children,siblings,pgf,pgm,mgf,mgm,extended]);
 const relationshipInputs=useMemo(()=>{
   const out:IntakeRelationshipInput[]=[]; const add=(a:DraftPerson,b:DraftPerson,type:IntakeRelationshipInput["relationship_type"],reported:string)=>{if(a.full_name.trim()&&b.full_name.trim())out.push({from_ref:a.id,to_ref:b.id,relationship_type:type,reported_relationship:reported})};
   add(father,self,"parent","father"); add(mother,self,"parent","mother"); add(self,spouse,"spouse","spouse"); children.forEach(c=>add(self,c,"parent","child")); siblings.forEach(s=>{if(father.full_name.trim())add(father,s,"parent","sibling via father");else if(mother.full_name.trim())add(mother,s,"parent","sibling via mother")});
   add(pgf,father,"parent","father's father"); add(pgm,father,"parent","father's mother"); add(mgf,mother,"parent","mother's father"); add(mgm,mother,"parent","mother's mother");
   extended.forEach(e=>{if(e.role==="father_sibling")add(pgf,e,"parent","father's sibling");if(e.role==="mother_sibling")add(mgf,e,"parent","mother's sibling")});
   return out;
 },[self,father,mother,spouse,children,siblings,pgf,pgm,mgf,mgm,extended]);
 const canNext=step!==0||self.full_name.trim().length>=2;
 const submit=async()=>{if(!self.full_name.trim())return;setBusy(true);setError("");try{const people:IntakePersonInput[]=all.map(p=>({client_ref:p.id,full_name:p.full_name.trim(),birth_year:p.birth_year?Number(p.birth_year):undefined,gender:p.gender||undefined,city:p.city.trim()||undefined,role_from_anchor:p.role,generation_offset:p.offset}));const result=await submitFamilyIntake(token,people,relationshipInputs);setDone({people:result.people_reported,relationships:result.relationships_reported})}catch(e:any){setError(e.message||"We could not send your family branch. Please try again.")}finally{setBusy(false)}};
 if(done)return <main className="intake-public-shell"><section className="intake-public-card intake-thanks"><div className="intake-success-icon"><CheckCircle2/></div><span className="warm-kicker">{tr("ThankYouTxt")}</span><h1>{tr("YourFamilyBranchHasBeenSentTxt")}</h1><p>{tr("YouAddedTxt")}{" "}<b>{done.people} {tr("PeopleTxt")}</b> {tr("AndTxt")}{" "}<b>{done.relationships} {tr("RelationshipsTxt")}</b>{tr("TheFamilyOwnerWillReviewPossibleOverlapsTxt")}</p><div className="intake-privacy-note"><ShieldCheck/> {tr("YourLinkDidNotGiveYouAccessTxt")}</div></section></main>;
 return <main className="intake-public-shell">
   <section className="intake-public-card">
    <header className="intake-header"><div className="intake-brand"><Heart fill="currentColor"/> {tr("FamilyNetworkTxt")}</div><span>{preview.family_name}</span></header>
    <div className="intake-progress"><span style={{width:`${((step+1)/steps.length)*100}%`}}/><small>{step+1} {tr("OfTxt")}{" "}{steps.length} · {steps[step]}</small></div>
    {step===0&&<><span className="warm-kicker"><UsersRound size={13}/> {tr("HelpBuildTxt")}{" "}{preview.family_name}</span><h1>{tr("StartWithYourselfTxt")}</h1><p className="intake-lead">{tr("AddOnlyWhatYouKnowAlmostEverythingTxt")}</p><PersonFields person={self} onChange={setSelf} required/></>}
    {step===1&&<><h1>{tr("YourParentsTxt")}</h1><p className="intake-lead">{tr("NamesAreEnoughBirthYearAndCityTxt")}</p><PersonFields person={father} onChange={setFather}/><PersonFields person={mother} onChange={setMother}/></>}
    {step===2&&<><h1>{tr("YourSpouseAndChildrenTxt")}</h1><p className="intake-lead">{tr("SkipThisSectionIfItDoesNotTxt")}</p><PersonFields person={spouse} onChange={setSpouse}/><RepeatPeople title={tr("ChildrenTxt")} people={children} setPeople={setChildren} create={()=>blank("Child","child",1)}/></>}
    {step===3&&<><h1>{tr("YourBrothersAndSistersTxt")}</h1><p className="intake-lead">{tr("AddAsManyAsYouKnowATxt")}</p><RepeatPeople title={tr("SiblingsTxt")} people={siblings} setPeople={setSiblings} create={()=>blank("Brother / sister","sibling",0)}/></>}
    {step===4&&<><h1>{tr("GrandparentsTxt")}</h1><p className="intake-lead">{tr("TheseAnchoredQuestionsHelpConnectFamilyBranchesTxt")}</p><PersonFields person={pgf} onChange={setPgf}/><PersonFields person={pgm} onChange={setPgm}/><PersonFields person={mgf} onChange={setMgf}/><PersonFields person={mgm} onChange={setMgm}/></>}
    {step===5&&<><h1>{tr("KnowALittleMoreTxt")}</h1><p className="intake-lead">{tr("OptionalAddYourFatherSOrMotherTxt")}</p><div className="intake-add-row"><button className="btn" onClick={()=>setExtended(v=>[...v,blank("Father's brother / sister","father_sibling",-1)])}><Plus size={15}/> {tr("FatherSSiblingTxt")}</button><button className="btn" onClick={()=>setExtended(v=>[...v,blank("Mother's brother / sister","mother_sibling",-1)])}><Plus size={15}/> {tr("MotherSSiblingTxt")}</button></div>{extended.map((p,i)=><PersonFields key={p.id} person={p} onChange={n=>setExtended(v=>v.map((x,j)=>j===i?n:x))} onRemove={()=>setExtended(v=>v.filter((_,j)=>j!==i))}/>)}</>}
    {step===6&&<><h1>{tr("ReviewYourBranchTxt")}</h1><p className="intake-lead">{tr("WeWillStageThisInformationFirstPossibleTxt")}</p><div className="intake-review-summary"><b>{all.length} {tr("PeopleTxt")}</b><span>{relationshipInputs.length} {tr("FamilyRelationshipsTxt")}</span></div><div className="intake-review-list">{all.map(p=><div key={p.id}><span><b>{p.full_name}</b><small>{p.label}{p.birth_year?` · ${p.birth_year}`:""}{p.city?` · ${p.city}`:""}</small></span></div>)}</div><div className="intake-privacy-note"><ShieldCheck/> {tr("WeDoNotShowPrivateFamilyRecordsTxt")}</div></>}
    {error&&<div className="notice danger-text">{error}</div>}
    <footer className="intake-footer">{step>0?<button className="btn" disabled={busy} onClick={()=>setStep(v=>v-1)}><ArrowLeft size={15}/> {tr("BackTxt")}</button>:<span/>}{step<6?<button className="btn primary" disabled={!canNext} onClick={()=>setStep(v=>v+1)}>{tr("ContinueTxt")}{" "}<ArrowRight size={15}/></button>:<button className="btn primary" disabled={busy||!self.full_name.trim()} onClick={submit}><Send size={15}/>{busy?tr("SendingTxt"):tr("SendMyFamilyBranchTxt")}</button>}</footer>
   </section>
 </main>;
}

function PersonFields({person,onChange,onRemove,required=false}:{person:DraftPerson;onChange:(p:DraftPerson)=>void;onRemove?:()=>void;required?:boolean}){
 const {t:tr}=useLanguage();
 const [open,setOpen]=useState(required||!!person.full_name);
 return <div className={`intake-person ${open?"open":""}`}><div className="intake-person-title"><button className="intake-person-toggle" onClick={()=>setOpen(v=>!v)}><span><b>{person.label}</b><small>{person.full_name||tr("AddIfKnownTxt")}</small></span><Plus size={16}/></button>{onRemove&&<button className="icon-button" aria-label={tr("RemoveTxt")} onClick={onRemove}><Trash2 size={15}/></button>}</div>{open&&<div className="intake-person-fields"><label><span>{tr("NameTxt")}{" "}{required&&<em>{tr("RequiredTxt")}</em>}</span><input className="text-input" value={person.full_name} onChange={e=>onChange({...person,full_name:e.target.value})} placeholder={tr("FullNameTxt")}/></label><label><span>{tr("BirthYearTxt")}{" "}<em>{tr("OptionalTxt")}</em></span><input className="text-input" inputMode="numeric" maxLength={4} value={person.birth_year} onChange={e=>onChange({...person,birth_year:e.target.value.replace(/\D/g,"").slice(0,4)})} placeholder="e.g. 1965"/></label><label><span>{tr("GenderTxt")}{" "}<em>{tr("OptionalTxt")}</em></span><select className="select" value={person.gender} onChange={e=>onChange({...person,gender:e.target.value as DraftPerson["gender"]})}><option value="">{tr("PreferNotToAddTxt")}</option><option>{tr("MaleTxt")}</option><option>{tr("FemaleTxt")}</option><option>{tr("OtherTxt")}</option></select></label><label><span>{tr("CityTxt")}{" "}<em>{tr("OptionalTxt")}</em></span><input className="text-input" value={person.city} onChange={e=>onChange({...person,city:e.target.value})} placeholder={tr("CurrentCityTxt")}/></label></div>}</div>
}
function RepeatPeople({title,people,setPeople,create}:{title:string;people:DraftPerson[];setPeople:Dispatch<SetStateAction<DraftPerson[]>>;create:()=>DraftPerson}){
 const {t:tr}=useLanguage();return <div className="intake-repeat"><div className="section-title"><h3>{title}</h3><button className="btn small" onClick={()=>setPeople(v=>[...v,create()])}><Plus size={14}/> {tr("AddTxt")}</button></div>{people.length===0&&<button className="intake-empty-add" onClick={()=>setPeople([create()])}><Plus/> {tr("AddTxt")}{" "}{title.toLowerCase()}</button>}{people.map((p,i)=><PersonFields key={p.id} person={p} onChange={n=>setPeople(v=>v.map((x,j)=>j===i?n:x))} onRemove={()=>setPeople(v=>v.filter((_,j)=>j!==i))}/>)}</div>}
