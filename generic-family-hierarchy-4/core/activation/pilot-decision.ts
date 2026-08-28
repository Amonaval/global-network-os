import type {PilotFeedbackMoment,PilotFrictionCode} from './pilot-learning';

export type PilotDecisionDisposition='invest'|'fix'|'hold'|'stop';
export type PilotDecisionConfidence='low'|'medium'|'high';

export type PilotDecisionEvidence={
 moment:PilotFeedbackMoment;
 feedback:number;
 helpful:number;
 partial:number;
 blocked:number;
 helpfulRate:number;
 topFriction:PilotFrictionCode|null;
 recommendation:PilotDecisionDisposition;
 confidence:PilotDecisionConfidence;
 reason:string;
};

export type PilotDecisionRecord={
 id:string;
 moment:PilotFeedbackMoment;
 disposition:PilotDecisionDisposition;
 evidenceDays:number;
 rationale:string;
 nextAction:string|null;
 createdAt:string;
};

export type PilotDecisionGate={
 days:number;
 totalFeedback:number;
 minimumEvidence:number;
 readyForDecision:boolean;
 evidence:PilotDecisionEvidence[];
 latestDecisions:PilotDecisionRecord[];
};
