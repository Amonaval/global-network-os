"use client";
import {Building2,Layers3,Network,ShieldCheck,Sparkles,UsersRound} from "lucide-react";
import {FEDERATION_DISTRIBUTION_ASSESSMENTS} from "../capabilities/federation/playground";
import {FEDERATION_PRIVACY_INVARIANTS} from "../core/federation/contracts";

const number=(value:number)=>new Intl.NumberFormat("en-IN").format(value);
export default function FederationDistributionSupernode(){
 const top=FEDERATION_DISTRIBUTION_ASSESSMENTS[0];
 return <section className="card federation-supernode">
  <div className="federation-supernode-head"><div><span className="warm-kicker"><Network size={13}/> Federation distribution lab</span><h2>One trusted anchor can unlock many networks</h2><p>Prioritize umbrella institutions by multiplication potential, not only by their own member count. This mission uses aggregate-only signals and creates no person-level access.</p></div><span className="federation-supernode-badge"><ShieldCheck size={14}/> Private graphs stay private</span></div>
  <div className="federation-supernode-hero"><article><Sparkles/><span><small>Strongest sample anchor</small><b>{top.label}</b><em>{top.multiplicationScore}/100 · {top.tier}</em></span></article><article><Layers3/><span><small>Projected network reach</small><b>{number(top.projectedTotalNetworks)}</b><em>{number(top.projectedSecondWaveNetworks)} potential second-wave networks</em></span></article><article><UsersRound/><span><small>Aggregate population reach</small><b>{number(top.projectedTotalMembers)}</b><em>projection only · no member data exposed</em></span></article></div>
  <div className="federation-supernode-grid">{FEDERATION_DISTRIBUTION_ASSESSMENTS.map(item=><article key={item.id}><div><span className={`federation-tier ${item.tier}`}>{item.tier}</span><small>{item.domain}</small></div><h3>{item.label}</h3><p>{item.reasons[0]}</p><div className="federation-metrics"><span><b>{item.childNetworkCount}</b><small>child networks</small></span><span><b>{item.multiplicationScore}</b><small>multiplier score</small></span><span><b>{number(item.projectedTotalMembers)}</b><small>projected reach</small></span></div></article>)}</div>
  <details className="federation-privacy"><summary><ShieldCheck size={15}/> Constitutional privacy guardrails</summary><div>{FEDERATION_PRIVACY_INVARIANTS.map(rule=><p key={rule.key}><b>✓</b>{rule.statement}</p>)}</div></details>
  <div className="federation-supernode-foot"><Building2 size={15}/><span><b>Founder metric:</b> score acquisition targets by how many governed networks they can activate next. NF-1/NF-2 will replace these synthetic scenarios with explicit Network Passports and approved affiliations.</span></div>
 </section>;
}
