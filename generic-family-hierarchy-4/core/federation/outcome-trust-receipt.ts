export type FederatedOutcomeCode="connected"|"helpful"|"resolved"|"not_resolved"|"no_follow_up";
export type FederatedOutcomeRole="requester"|"recipient";

export type FederatedOutcomeCandidate={
 introductionId:string;requestId:string;scopeKey:string;requestTitle:string;requesterAlias:string;targetDisplayName:string;
 sourceNetworkName:string;targetNetworkName:string;umbrellaName:string;trustPathLabel:string;acceptedAt:string|null;
 myRole:FederatedOutcomeRole;receiptId:string;receiptCreatedAt:string|null;myOutcomeCode:FederatedOutcomeCode|null;
 myOutcomeNote:string;counterpartyOutcomeCode:FederatedOutcomeCode|null;counterpartyOutcomeRecordedAt:string|null;
 requestStatus:"open"|"closed"|"cancelled";
};

export type FederatedTrustReceipt={
 id:string;introductionId:string;requestId:string;scopeKey:string;requestTitle:string;sourceNetworkName:string;targetNetworkName:string;
 umbrellaName:string;trustPathLabel:string;routedAt:string|null;introductionRequestedAt:string|null;acceptedAt:string|null;createdAt:string|null;
 requesterOutcomeCode:FederatedOutcomeCode|null;recipientOutcomeCode:FederatedOutcomeCode|null;
};

export const FEDERATED_OUTCOME_OPTIONS:readonly {key:FederatedOutcomeCode;label:string}[]=[
 {key:"connected",label:"Connected"},
 {key:"helpful",label:"Helpful progress"},
 {key:"resolved",label:"Need resolved"},
 {key:"not_resolved",label:"Did not resolve the need"},
 {key:"no_follow_up",label:"No meaningful follow-up"},
];

export const OUTCOME_TRUST_RECEIPT_GUARDRAILS=[
 "Outcome evidence belongs to one accepted introduction and one exact purpose route. It is not a public person rating.",
 "Requester and recipient record their own outcome independently; one party cannot edit or impersonate the other party's evidence.",
 "Trust Receipts preserve the institutional route and consent timeline that existed for the introduction without reopening private source-network data.",
 "Outcome notes are private to the introduction participants and must not be exposed as public testimonials or universal trust scores by default.",
 "NF-8 records evidence for future routing intelligence, but does not change ranking weights automatically. Learning/ranking belongs to NF-9 with anti-gaming controls.",
] as const;
