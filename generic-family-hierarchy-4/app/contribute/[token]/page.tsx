"use client";
import {useLanguage} from "../../../lib/i18n";
import {useEffect,useState} from "react";
import {ShieldAlert} from "lucide-react";
import FamilyBranchIntakeForm from "../../../components/FamilyBranchIntakeForm";
import type {FamilyIntakePreview} from "../../../lib/family-intake-types";
import {fetchFamilyIntakePreview} from "../../../lib/remote";

export default function ContributionPage({params}:{params:{token:string}}){
 const {t:tr}=useLanguage();
 const [preview,setPreview]=useState<FamilyIntakePreview|null>(null),[error,setError]=useState("");
 useEffect(()=>{fetchFamilyIntakePreview(params.token).then(setPreview).catch(e=>setError(e.message||"This contribution link is unavailable."))},[params.token]);
 if(error)return <main className="intake-public-shell"><section className="intake-public-card intake-error"><ShieldAlert/><h1>{tr("ThisFamilyLinkIsUnavailableTxt")}</h1><p>{error}</p><small>{tr("AskTheFamilyOrganizerForAFreshTxt")}</small></section></main>;
 if(!preview)return <main className="intake-public-shell"><section className="intake-public-card"><div className="intake-loading">{tr("OpeningYourFamilyFormTxt")}</div></section></main>;
 if(preview.already_submitted)return <main className="intake-public-shell"><section className="intake-public-card intake-thanks"><h1>{tr("ThankYouThisBranchWasAlreadySubmittedTxt")}</h1><p>{tr("TheFamilyOwnerNowHasItForTxt")}</p></section></main>;
 return <FamilyBranchIntakeForm token={params.token} preview={preview}/>;
}
