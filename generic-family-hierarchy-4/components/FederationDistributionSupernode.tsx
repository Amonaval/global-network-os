"use client";
import {Building2,Layers3,Network,ShieldCheck,Sparkles,UsersRound} from "lucide-react";
import {FEDERATION_DISTRIBUTION_ASSESSMENTS} from "../capabilities/federation/playground";
import {FEDERATION_PRIVACY_INVARIANTS} from "../core/federation/contracts";
import {useLanguage} from "../lib/i18n";

const number=(value:number)=>new Intl.NumberFormat("en-IN").format(value);
export default function FederationDistributionSupernode(){
 const {t:tr}=useLanguage();const top=FEDERATION_DISTRIBUTION_ASSESSMENTS[0];
 return <section className="card federation-supernode">
  <div className="federation-supernode-head"><div><span className="warm-kicker"><Network size={13}/> {tr("NF0AKickerTxt")}</span><h2>{tr("NF0ATitleTxt")}</h2><p>{tr("NF0ADescTxt")}</p></div><span className="federation-supernode-badge"><ShieldCheck size={14}/> {tr("NF0APrivateGraphsTxt")}</span></div>
  <div className="federation-supernode-hero"><article><Sparkles/><span><small>{tr("NF0AStrongestAnchorTxt")}</small><b>{top.label}</b><em>{top.multiplicationScore}/100 · {top.tier}</em></span></article><article><Layers3/><span><small>{tr("NF0AProjectedNetworkReachTxt")}</small><b>{number(top.projectedTotalNetworks)}</b><em>{number(top.projectedSecondWaveNetworks)} {tr("NF0ASecondWaveTxt")}</em></span></article><article><UsersRound/><span><small>{tr("NF0AAggregateReachTxt")}</small><b>{number(top.projectedTotalMembers)}</b><em>{tr("NF0AProjectionOnlyTxt")}</em></span></article></div>
  <div className="federation-supernode-grid">{FEDERATION_DISTRIBUTION_ASSESSMENTS.map(item=><article key={item.id}><div><span className={`federation-tier ${item.tier}`}>{item.tier}</span><small>{item.domain}</small></div><h3>{item.label}</h3><p>{item.reasons[0]}</p><div className="federation-metrics"><span><b>{item.childNetworkCount}</b><small>{tr("NF0AChildNetworksTxt")}</small></span><span><b>{item.multiplicationScore}</b><small>{tr("NF0AMultiplierScoreTxt")}</small></span><span><b>{number(item.projectedTotalMembers)}</b><small>{tr("NF0AProjectedReachTxt")}</small></span></div></article>)}</div>
  <details className="federation-privacy"><summary><ShieldCheck size={15}/> {tr("NF0AGuardrailsTxt")}</summary><div>{FEDERATION_PRIVACY_INVARIANTS.map(rule=><p key={rule.key}><b>✓</b>{rule.statement}</p>)}</div></details>
  <div className="federation-supernode-foot"><Building2 size={15}/><span><b>{tr("NF0AFounderMetricTxt")}</b> {tr("NF0AFounderMetricDescTxt")}</span></div>
 </section>;
}
