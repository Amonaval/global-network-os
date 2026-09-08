import type {NetworkVerticalKind} from "../verticals/contracts";
export const XP7_VERTICALS:readonly NetworkVerticalKind[]=["family","alumni","housing-society","family-association","association","organization","business-trust","franchise","professional"];
export const XP7_ACTOR_STATES=["owner","admin","member","invited","claimed","anonymous"] as const;
export const XP7_LIFECYCLE_STATES=["active","archived","restored","hard-deleted"] as const;
export type Xp7ActorState=typeof XP7_ACTOR_STATES[number];
export type Xp7LifecycleState=typeof XP7_LIFECYCLE_STATES[number];
export type Xp7RegressionCell={vertical:NetworkVerticalKind;actor:Xp7ActorState;lifecycle:Xp7LifecycleState};
export function buildXp7RegressionMatrix():Xp7RegressionCell[]{return XP7_VERTICALS.flatMap(vertical=>XP7_ACTOR_STATES.flatMap(actor=>XP7_LIFECYCLE_STATES.map(lifecycle=>({vertical,actor,lifecycle}))));}
