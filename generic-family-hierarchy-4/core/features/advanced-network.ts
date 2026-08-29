import type {FeatureDefinition} from './contracts';
import type {NetworkVerticalKind} from '../verticals/contracts';

export type AdvancedNetworkFeatureBundle='network-effect'|'federation'|'showcase'|'pilot-ops';
export type AdvancedNetworkFeatureSuffix=
 | 'identity_reach'
 | 'trust_bridges'
 | 'cross_network_discovery'
 | 'network_effect_pulse'
 | 'multihop_paths'
 | 'federation_distribution'
 | 'network_passport'
 | 'network_affiliation'
 | 'guided_launch'
 | 'wow_showcase'
 | 'pilot_console'
 | 'pilot_feedback'
 | 'runtime_certification'
 | 'product_decision_gate';

export function advancedNetworkFeatureKey(kind:NetworkVerticalKind,suffix:AdvancedNetworkFeatureSuffix){return `${kind}.advanced.${suffix}` as const;}

/**
 * Advanced cross-network/pilot capabilities are TEST by default.
 * That preserves platform-owner access for runtime certification while keeping
 * Alpha users dark until the founder explicitly promotes a vertical to Pilot/Released.
 */
export function createAdvancedNetworkFeatures<K extends NetworkVerticalKind,E extends string>(kind:K,member:E,connected:E):readonly FeatureDefinition<string,AdvancedNetworkFeatureBundle,E>[] {
 const k=(suffix:AdvancedNetworkFeatureSuffix)=>`${kind}.advanced.${suffix}`;
 return [
  {key:k('identity_reach'),bundle:'network-effect',label:'Trusted identity reach',description:'M6-A account-scoped multi-network reach without merging network profiles.',minimumExperience:member,defaultLaunch:'test'},
  {key:k('trust_bridges'),bundle:'network-effect',label:'Trusted network bridges',description:'M6-B governed, bilateral and revocable network-to-network bridges.',minimumExperience:connected,defaultLaunch:'test'},
  {key:k('cross_network_discovery'),bundle:'network-effect',label:'Cross-network discovery & introductions',description:'M6-C privacy-safe discovery and consented introductions.',minimumExperience:connected,defaultLaunch:'test'},
  {key:k('network_effect_pulse'),bundle:'network-effect',label:'Network Effect Pulse',description:'M6-D privacy-minimal activation measurement.',minimumExperience:connected,defaultLaunch:'test'},
  {key:k('multihop_paths'),bundle:'network-effect',label:'Governed multi-hop paths',description:'M6-E depth-2 trusted path traversal. Hidden independently from direct discovery.',minimumExperience:connected,defaultLaunch:'test'},
  {key:k('federation_distribution'),bundle:'federation',label:'Federation distribution supernode',description:'FD-2/NF-0 aggregate-only anchor scoring for one-to-many institutional onboarding. Affiliation never grants person-level access.',minimumExperience:'admin',defaultLaunch:'test'},
  {key:k('network_passport'),bundle:'federation',label:'Network Passport',description:'NF-1 governed outward network identity with purpose declarations and explicit visibility. No private member graph is exposed.',minimumExperience:'admin',defaultLaunch:'test'},
  {key:k('network_affiliation'),bundle:'federation',label:'Governed federation affiliation',description:'NF-2 request/review/suspend/revoke Network↔Umbrella affiliation using Network Passport as the review boundary. No member access is implied.',minimumExperience:'admin',defaultLaunch:'test'},
  {key:k('guided_launch'),bundle:'pilot-ops',label:'Guided network launch',description:'M7-A zero-friction launch and activation guidance.',minimumExperience:'admin',defaultLaunch:'test'},
  {key:k('wow_showcase'),bundle:'showcase',label:'WOW showcase theater',description:'M7-B synthetic guided network-effect stories.',minimumExperience:member,defaultLaunch:'test'},
  {key:k('pilot_console'),bundle:'pilot-ops',label:'Pilot launch console',description:'M7-C admin operating console for pilot readiness and intervention.',minimumExperience:'admin',defaultLaunch:'test'},
  {key:k('pilot_feedback'),bundle:'pilot-ops',label:'Pilot feedback loop',description:'M7-D lightweight product-learning feedback at meaningful moments.',minimumExperience:member,defaultLaunch:'test'},
  {key:k('runtime_certification'),bundle:'pilot-ops',label:'Showcase runtime certification',description:'M7-E live-demo readiness and runtime diagnostics.',minimumExperience:'admin',defaultLaunch:'test'},
  {key:k('product_decision_gate'),bundle:'pilot-ops',label:'Pilot evidence decision gate',description:'M7-F evidence-backed INVEST/FIX/HOLD/STOP product decisions.',minimumExperience:'admin',defaultLaunch:'test'},
 ];
}
