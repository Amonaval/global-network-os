"use client";
import {useEffect,useState} from "react";
import {ShieldAlert} from "lucide-react";
import FamilyBranchIntakeForm from "../../../components/FamilyBranchIntakeForm";
import type {FamilyIntakePreview} from "../../../lib/family-intake-types";
import {fetchFamilyIntakePreview} from "../../../lib/remote";

export default function ContributionPage({params}:{params:{token:string}}){
 const [preview,setPreview]=useState<FamilyIntakePreview|null>(null),[error,setError]=useState("");
 useEffect(()=>{fetchFamilyIntakePreview(params.token).then(setPreview).catch(e=>setError(e.message||"This contribution link is unavailable."))},[params.token]);
 if(error)return <main className="intake-public-shell"><section className="intake-public-card intake-error"><ShieldAlert/><h1>This family link is unavailable</h1><p>{error}</p><small>Ask the family organizer for a fresh contribution link.</small></section></main>;
 if(!preview)return <main className="intake-public-shell"><section className="intake-public-card"><div className="intake-loading">Opening your family form…</div></section></main>;
 if(preview.already_submitted)return <main className="intake-public-shell"><section className="intake-public-card intake-thanks"><h1>Thank you — this branch was already submitted</h1><p>The family owner now has it for review. Ask for a new link if you need to submit another branch.</p></section></main>;
 return <FamilyBranchIntakeForm token={params.token} preview={preview}/>;
}
