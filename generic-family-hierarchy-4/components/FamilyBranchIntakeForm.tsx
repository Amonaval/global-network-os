"use client";
import {useMemo,useState,type Dispatch,type SetStateAction} from "react";
import {ArrowLeft,ArrowRight,CheckCircle2,Heart,Plus,Send,ShieldCheck,Trash2,UsersRound} from "lucide-react";
import type {FamilyIntakePreview,IntakePersonInput,IntakeRelationshipInput} from "../lib/family-intake-types";
import {submitFamilyIntake} from "../lib/remote";

type DraftPerson={id:string;label:string;full_name:string;birth_year:string;gender:""|"Male"|"Female"|"Other";city:string;role:string;offset:number};
const uid=()=>globalThis.crypto?.randomUUID?.()||`p-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const blank=(label:string,role:string,offset:number,gender:DraftPerson["gender"]=""):DraftPerson=>({id:uid(),label,full_name:"",birth_year:"",gender,city:"",role,offset});

export default function FamilyBranchIntakeForm({token,preview}:{token:string;preview:FamilyIntakePreview}){
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
 if(done)return <main className="intake-public-shell"><section className="intake-public-card intake-thanks"><div className="intake-success-icon"><CheckCircle2/></div><span className="warm-kicker">Thank you</span><h1>Your family branch has been sent</h1><p>You added <b>{done.people} people</b> and <b>{done.relationships} relationships</b>. The family owner will review possible overlaps before anything is added to the shared family tree.</p><div className="intake-privacy-note"><ShieldCheck/> Your link did not give you access to private family data.</div></section></main>;
 return <main className="intake-public-shell">
   <section className="intake-public-card">
    <header className="intake-header"><div className="intake-brand"><Heart fill="currentColor"/> Family Network</div><span>{preview.family_name}</span></header>
    <div className="intake-progress"><span style={{width:`${((step+1)/steps.length)*100}%`}}/><small>{step+1} of {steps.length} · {steps[step]}</small></div>
    {step===0&&<><span className="warm-kicker"><UsersRound size={13}/> Help build {preview.family_name}</span><h1>Start with yourself</h1><p className="intake-lead">Add only what you know. Almost everything is optional, and you can skip relatives you are unsure about.</p><PersonFields person={self} onChange={setSelf} required/></>}
    {step===1&&<><h1>Your parents</h1><p className="intake-lead">Names are enough. Birth year and city only help us avoid duplicates.</p><PersonFields person={father} onChange={setFather}/><PersonFields person={mother} onChange={setMother}/></>}
    {step===2&&<><h1>Your spouse & children</h1><p className="intake-lead">Skip this section if it does not apply.</p><PersonFields person={spouse} onChange={setSpouse}/><RepeatPeople title="Children" people={children} setPeople={setChildren} create={()=>blank("Child","child",1)}/></>}
    {step===3&&<><h1>Your brothers & sisters</h1><p className="intake-lead">Add as many as you know. A name alone is useful.</p><RepeatPeople title="Siblings" people={siblings} setPeople={setSiblings} create={()=>blank("Brother / sister","sibling",0)}/></>}
    {step===4&&<><h1>Grandparents</h1><p className="intake-lead">These anchored questions help connect family branches later.</p><PersonFields person={pgf} onChange={setPgf}/><PersonFields person={pgm} onChange={setPgm}/><PersonFields person={mgf} onChange={setMgf}/><PersonFields person={mgm} onChange={setMgm}/></>}
    {step===5&&<><h1>Know a little more?</h1><p className="intake-lead">Optional: add your father's or mother's brothers and sisters. You can stop here without completing this.</p><div className="intake-add-row"><button className="btn" onClick={()=>setExtended(v=>[...v,blank("Father's brother / sister","father_sibling",-1)])}><Plus size={15}/> Father's sibling</button><button className="btn" onClick={()=>setExtended(v=>[...v,blank("Mother's brother / sister","mother_sibling",-1)])}><Plus size={15}/> Mother's sibling</button></div>{extended.map((p,i)=><PersonFields key={p.id} person={p} onChange={n=>setExtended(v=>v.map((x,j)=>j===i?n:x))} onRemove={()=>setExtended(v=>v.filter((_,j)=>j!==i))}/>)}</>}
    {step===6&&<><h1>Review your branch</h1><p className="intake-lead">We will stage this information first. Possible duplicates are reviewed before they enter the family tree.</p><div className="intake-review-summary"><b>{all.length} people</b><span>{relationshipInputs.length} family relationships</span></div><div className="intake-review-list">{all.map(p=><div key={p.id}><span><b>{p.full_name}</b><small>{p.label}{p.birth_year?` · ${p.birth_year}`:""}{p.city?` · ${p.city}`:""}</small></span></div>)}</div><div className="intake-privacy-note"><ShieldCheck/> We do not show private family records through this contribution link. Your submission is reviewed before it changes the family tree.</div></>}
    {error&&<div className="notice danger-text">{error}</div>}
    <footer className="intake-footer">{step>0?<button className="btn" disabled={busy} onClick={()=>setStep(v=>v-1)}><ArrowLeft size={15}/> Back</button>:<span/>}{step<6?<button className="btn primary" disabled={!canNext} onClick={()=>setStep(v=>v+1)}>Continue <ArrowRight size={15}/></button>:<button className="btn primary" disabled={busy||!self.full_name.trim()} onClick={submit}><Send size={15}/>{busy?"Sending…":"Send my family branch"}</button>}</footer>
   </section>
 </main>;
}

function PersonFields({person,onChange,onRemove,required=false}:{person:DraftPerson;onChange:(p:DraftPerson)=>void;onRemove?:()=>void;required?:boolean}){
 const [open,setOpen]=useState(required||!!person.full_name);
 return <div className={`intake-person ${open?"open":""}`}><div className="intake-person-title"><button className="intake-person-toggle" onClick={()=>setOpen(v=>!v)}><span><b>{person.label}</b><small>{person.full_name||"Add if known"}</small></span><Plus size={16}/></button>{onRemove&&<button className="icon-button" aria-label="Remove" onClick={onRemove}><Trash2 size={15}/></button>}</div>{open&&<div className="intake-person-fields"><label><span>Name {required&&<em>required</em>}</span><input className="text-input" value={person.full_name} onChange={e=>onChange({...person,full_name:e.target.value})} placeholder="Full name"/></label><label><span>Birth year <em>optional</em></span><input className="text-input" inputMode="numeric" maxLength={4} value={person.birth_year} onChange={e=>onChange({...person,birth_year:e.target.value.replace(/\D/g,"").slice(0,4)})} placeholder="e.g. 1965"/></label><label><span>Gender <em>optional</em></span><select className="select" value={person.gender} onChange={e=>onChange({...person,gender:e.target.value as DraftPerson["gender"]})}><option value="">Prefer not to add</option><option>Male</option><option>Female</option><option>Other</option></select></label><label><span>City <em>optional</em></span><input className="text-input" value={person.city} onChange={e=>onChange({...person,city:e.target.value})} placeholder="Current city"/></label></div>}</div>
}
function RepeatPeople({title,people,setPeople,create}:{title:string;people:DraftPerson[];setPeople:Dispatch<SetStateAction<DraftPerson[]>>;create:()=>DraftPerson}){return <div className="intake-repeat"><div className="section-title"><h3>{title}</h3><button className="btn small" onClick={()=>setPeople(v=>[...v,create()])}><Plus size={14}/> Add</button></div>{people.length===0&&<button className="intake-empty-add" onClick={()=>setPeople([create()])}><Plus/> Add {title.toLowerCase()}</button>}{people.map((p,i)=><PersonFields key={p.id} person={p} onChange={n=>setPeople(v=>v.map((x,j)=>j===i?n:x))} onRemove={()=>setPeople(v=>v.filter((_,j)=>j!==i))}/>)}</div>}
