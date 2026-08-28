"use client";
import {useEffect,useState} from "react";
import {CheckCircle2,FlaskConical,RefreshCw,ShieldAlert,ShieldCheck,Sparkles} from "lucide-react";
import {useLanguage} from "../lib/i18n";
import type {ShowcaseRuntimeCertification} from "../core/showcase/runtime-certification";
import {fetchShowcaseRuntimeCertification} from "../capabilities/showcase/runtime-certification-remote";

export default function ShowcaseRuntimeCertification(){
 const {t}=useLanguage();const [data,setData]=useState<ShowcaseRuntimeCertification|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState("");
 const load=()=>{setLoading(true);setError("");fetchShowcaseRuntimeCertification().then(setData).catch((e:any)=>setError(e.message||t("M7ECertificationLoadFailedTxt"))).finally(()=>setLoading(false))};
 useEffect(()=>{void load()},[]);
 return <section className="card m7e-cert" id="showcase-runtime-certification"><div className="m7e-head"><div><span className="warm-kicker"><FlaskConical size={13}/> {t("M7ECertificationKickerTxt")}</span><h2>{t("M7ECertificationTitleTxt")}</h2><p>{t("M7ECertificationDescTxt")}</p></div><button className="btn" onClick={load} disabled={loading}><RefreshCw size={14}/>{t("RefreshTxt")}</button></div>
 {error&&<div className="m7e-error"><ShieldAlert size={16}/>{error}</div>}
 {loading&&!data?<p>{t("M7ECertificationLoadingTxt")}</p>:data&&<><div className={`m7e-status ${data.status}`}><span>{data.status==="ready"?<CheckCircle2/>:<ShieldAlert/>}</span><div><b>{data.status==="ready"?t("M7EReadyTxt"):data.status==="blocked"?t("M7EBlockedTxt"):t("M7ENeedsSetupTxt")}</b><small>{data.status==="ready"?t("M7EReadyDescTxt"):t("M7ENeedsSetupDescTxt")}</small></div></div>
 <div className="m7e-grid"><article><b>{data.activeNetworks}</b><span>{t("M7EActiveNetworksTxt")}</span></article><article><b>{data.claimedContexts}</b><span>{t("M7EClaimedContextsTxt")}</span></article><article><b>{data.acceptedBridges}</b><span>{t("M7EAcceptedBridgesTxt")}</span></article><article><b>{data.discoveryBridges}</b><span>{t("M7EDiscoveryReadyTxt")}</span></article><article><b>{data.introductionBridges}</b><span>{t("M7EIntroductionReadyTxt")}</span></article><article><b>{data.traversalBridges}</b><span>{t("M7ETraversalReadyTxt")}</span></article><article><b>{data.acceptedOutcomes}</b><span>{t("M7EAcceptedOutcomesTxt")}</span></article></div>
 <div className="m7e-checks"><span><ShieldCheck size={14}/>{t("M7EPrivacyRuleTxt")}</span><span><Sparkles size={14}/>{t("M7EDemoRuleTxt")}</span></div></>}
 </section>
}
