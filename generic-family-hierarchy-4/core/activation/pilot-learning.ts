export type PilotFeedbackMoment="launch"|"participation"|"claim"|"bridge"|"discovery"|"introduction"|"outcome"|"general";
export type PilotFeedbackOutcome="helpful"|"partial"|"blocked";
export type PilotFrictionCode="none"|"next_step"|"setup"|"data"|"permission"|"discovery"|"consent"|"technical"|"other";

export type PilotFeedbackContext={
 networkId:string;
 networkName:string;
 verticalKind:string;
 role:string;
 suggestedMoment:PilotFeedbackMoment;
 lastSignalAt:string|null;
};

export type PilotLearningNetwork={
 networkId:string;
 networkName:string;
 feedback:number;
 helpful:number;
 partial:number;
 blocked:number;
};

export type PilotLearningNote={
 networkName:string;
 moment:PilotFeedbackMoment;
 outcome:PilotFeedbackOutcome;
 friction:PilotFrictionCode;
 note:string;
 createdAt:string;
};

export type PilotLearningSummary={
 days:number;
 feedback:number;
 helpful:number;
 partial:number;
 blocked:number;
 helpfulRate:number;
 topFriction:PilotFrictionCode|null;
 networks:PilotLearningNetwork[];
 recentNotes:PilotLearningNote[];
};
