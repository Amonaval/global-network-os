import type {NetworkVerticalKind} from "../verticals/contracts";

export type NetworkPassportVisibility="private"|"federation"|"public";
export type NetworkPassportVerification="self_declared"|"network_admin_reviewed";

export type NetworkPassport={
 networkId:string;
 networkName:string;
 verticalKind:NetworkVerticalKind;
 publicSlug:string;
 tagline:string;
 summary:string;
 locationLabel:string;
 establishedLabel:string;
 externalUrl:string;
 capabilities:string[];
 participationScopes:string[];
 visibility:NetworkPassportVisibility;
 directoryDiscoverable:boolean;
 verification:NetworkPassportVerification;
 updatedAt:string|null;
};

export type NetworkPassportInput={
 networkId:string;
 publicSlug:string;
 tagline:string;
 summary:string;
 locationLabel:string;
 establishedLabel:string;
 externalUrl:string;
 capabilities:string[];
 participationScopes:string[];
 visibility:NetworkPassportVisibility;
 directoryDiscoverable:boolean;
};

export const NETWORK_PASSPORT_GUARDRAILS=[
 "A Passport describes the network, not its private member graph.",
 "Publishing a Passport never publishes member names, relationships or private contact data.",
 "Federation visibility is not global public visibility.",
 "Participation scopes are declarations of possible purpose areas; they do not enroll members or grant access.",
] as const;
