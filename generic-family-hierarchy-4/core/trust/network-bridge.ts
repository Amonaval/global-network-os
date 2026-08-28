export type NetworkBridgeRelationshipType="affiliation"|"community"|"partner"|"parent_child"|"trusted_peer";
export type NetworkBridgeStatus="pending"|"accepted"|"declined"|"revoked";
export type NetworkBridgeCapabilities={discovery:boolean;introductions:boolean};
export type NetworkTrustBridge={
 id:string;requesterNetworkId:string;requesterNetworkName:string;recipientNetworkId:string;recipientNetworkName:string;
 relationshipType:NetworkBridgeRelationshipType;status:NetworkBridgeStatus;contextLabel:string|null;capabilities:NetworkBridgeCapabilities;
 direction:"incoming"|"outgoing";canReview:boolean;canRevoke:boolean;createdAt:string;updatedAt:string;
};
export const NETWORK_BRIDGE_RELATIONSHIP_LABELS:Record<NetworkBridgeRelationshipType,string>={affiliation:"Affiliation",community:"Community relationship",partner:"Partner network",parent_child:"Parent / child network",trusted_peer:"Trusted peer"};
