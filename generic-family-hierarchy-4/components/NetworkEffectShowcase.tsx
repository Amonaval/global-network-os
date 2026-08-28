"use client";
import {useMemo,useState} from "react";
import {ArrowRight,CheckCircle2,CircleUserRound,Network,Play,RotateCcw,ShieldCheck,Sparkles,UsersRound} from "lucide-react";
import {useLanguage} from "../lib/i18n";
import universeJson from "../public/showcase/m7b-showcase-universe.json";
import type {M7BShowcaseUniverse,ShowcaseScenario} from "../core/showcase/m7b";

const universe=universeJson as M7BShowcaseUniverse;
const stages=["need","gap","path","anonymous","consent","reveal","value"] as const;
type Stage=typeof stages[number];

export default function NetworkEffectShowcase(){
 const {t}=useLanguage();const [scenarioId,setScenarioId]=useState(universe.scenarios[0]?.id||"");const [stage,setStage]=useState<Stage>("need");
 const scenario=useMemo(()=>universe.scenarios.find(x=>x.id===scenarioId)||universe.scenarios[0],[scenarioId]);
 const networkById=useMemo(()=>Object.fromEntries(universe.networks.map(n=>[n.id,n])),[]);
 const person=useMemo(()=>universe.people.find(p=>p.id===scenario?.targetPersonId),[scenario]);
 const stageIndex=stages.indexOf(stage);const advance=()=>setStage(stages[Math.min(stages.length-1,stageIndex+1)]);const reset=()=>setStage("need");
 if(!scenario)return null;
 const source=networkById[scenario.sourceNetworkId],target=networkById[scenario.targetNetworkId];
 return <section className="card m7b-showcase" id="network-effect-showcase">
  <div className="m7b-head"><div><span className="warm-kicker"><Sparkles size={13}/> {t("ExperienceNetworkEffectTxt")}</span><h2>{t("M7BShowcaseTitleTxt")}</h2><p>{t("M7BShowcaseDescTxt")}</p></div><span className="m7b-synthetic"><ShieldCheck size={14}/>{t("SyntheticReadOnlyTxt")}</span></div>
  <div className="m7b-universe-stats"><span><UsersRound size={14}/><b>{universe.peopleCount}</b> {t("SyntheticPeopleTxt")}</span><span><Network size={14}/><b>{universe.networks.length}</b> {t("NetworkTypesTxt")}</span><span><Sparkles size={14}/><b>{universe.scenarios.length}</b> {t("GuidedWowStoriesTxt")}</span></div>
  <div className="m7b-layout">
   <aside className="m7b-scenarios">{universe.scenarios.map(s=><button key={s.id} className={s.id===scenario.id?"active":""} onClick={()=>{setScenarioId(s.id);setStage("need")}}><span>{s.emoji}</span><div><b>{s.title}</b><small>{s.pathDepth===2?t("TwoHopTrustedPathTxt"):t("DirectTrustedBridgeTxt")}</small></div><ArrowRight size={14}/></button>)}</aside>
   <div className="m7b-theater">
    <div className="m7b-story-head"><span>{scenario.emoji}</span><div><small>{t("ScenarioTxt")}</small><h3>{scenario.title}</h3><p>{scenario.hook}</p></div></div>
    <div className="m7b-stage-line">{stages.map((s,i)=><span key={s} className={i<=stageIndex?"done":""}>{i<stageIndex?<CheckCircle2 size={13}/>:i===stageIndex?<Play size={13}/>:<span>{i+1}</span>}<small>{t(({need:"NeedTxt",gap:"DirectGapTxt",path:"TrustedPathTxt",anonymous:"AnonymousMatchTxt",consent:"ConsentTxt",reveal:"RevealTxt",value:"OutcomeTxt"} as const)[s])}</small></span>)}</div>
    <div className="m7b-stage-card">
     {stage==="need"&&<><span className="m7b-kicker">{t("TheNeedTxt")}</span><h4>{scenario.hook}</h4><div className="m7b-query"><SearchGlyph/> “{scenario.query}”</div></>}
     {stage==="gap"&&<><span className="m7b-kicker">{t("DirectNetworkInsufficientTxt")}</span><h4>{source?.name}</h4><p>{t("M7BDirectGapDescTxt")}</p><div className="m7b-no-result">0 {t("StrongDirectMatchesTxt")}</div></>}
     {stage==="path"&&<><span className="m7b-kicker">{t("GovernedTrustedPathTxt")}</span><div className="m7b-path">{scenario.path.map((id,i)=><div key={id}><span>{networkById[id]?.name||id}</span>{i<scenario.path.length-1&&<ArrowRight size={17}/>}</div>)}</div><p>{scenario.pathDepth===2?t("M7BTwoHopConsentDescTxt"):t("M7BOneHopConsentDescTxt")}</p></>}
     {stage==="anonymous"&&<><span className="m7b-kicker">{t("PrivacySafeDiscoveryTxt")}</span><div className="m7b-anon"><CircleUserRound size={30}/><div><b>{t("RelevantPersonAvailableTxt")}</b><span>{target?.name}</span><small>{scenario.pathDepth===2?t("TwoHopTrustedPathTxt"):t("DirectTrustedBridgeTxt")}</small></div></div><p>{t("M7BIdentityStillHiddenTxt")}</p></>}
     {stage==="consent"&&<><span className="m7b-kicker">{t("TrustedIntroductionTxt")}</span><div className="m7b-request-copy"><b>{t("IntroductionReasonTxt")}</b><p>“{scenario.request}”</p></div><div className="m7b-consent"><ShieldCheck size={18}/><span>{t("TargetControlsConsentTxt")}</span></div></>}
     {stage==="reveal"&&<><span className="m7b-kicker">{t("ConsentAcceptedTxt")}</span><div className="m7b-reveal"><CheckCircle2 size={26}/><div><b>{person?.name}</b><span>{target?.name}</span><small>{person?.expertise.join(" · ")}</small></div></div><p>{t("M7BRevealAfterConsentDescTxt")}</p></>}
     {stage==="value"&&<><span className="m7b-kicker">{t("WowMomentTxt")}</span><h4>{scenario.outcome}</h4><blockquote>{scenario.whyWow}</blockquote><div className="m7b-proof"><CheckCircle2 size={18}/><div><b>{t("NetworkEffectProvenTxt")}</b><small>{t("M7BPulseMovesTxt")}</small></div></div></>}
    </div>
    <div className="m7b-actions"><button className="btn" onClick={reset}><RotateCcw size={14}/>{t("RestartTxt")}</button><span>{stageIndex+1}/{stages.length}</span>{stageIndex<stages.length-1?<button className="btn primary" onClick={advance}>{t("ContinueStoryTxt")}<ArrowRight size={14}/></button>:<button className="btn primary" onClick={()=>{const i=universe.scenarios.findIndex(x=>x.id===scenario.id);setScenarioId(universe.scenarios[(i+1)%universe.scenarios.length].id);setStage("need")}}>{t("TryAnotherStoryTxt")}<ArrowRight size={14}/></button>}</div>
   </div>
  </div>
  <div className="m7b-rule"><ShieldCheck size={15}/><span><b>{t("DemoMirrorsRealTrustRulesTxt")}</b> {t("M7BDemoRuleDescTxt")}</span></div>
 </section>
}
function SearchGlyph(){return <Sparkles size={15}/>}
