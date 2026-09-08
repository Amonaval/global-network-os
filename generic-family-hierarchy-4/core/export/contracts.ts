export const NETWORK_BACKUP_FORMAT="trustweave-network-backup" as const;
export const NETWORK_BACKUP_VERSION="xp5-1" as const;
export type NetworkBackup={format:typeof NETWORK_BACKUP_FORMAT;version:string;schemaVersion:string;exportedAt:string;networkId:string;network:Record<string,unknown>;datasets:Record<string,Record<string,unknown>[]>;excludedSecurityDatasets:string[];restore:{fullAutomaticRestore:boolean;guidedWorkbookReimport:boolean;reason:string};media:{strategy:"manifest";buckets:Record<string,string[]>;objectCount:number;contentIncluded:false;limitations:string[]}};
export function isNetworkBackup(value:unknown):value is NetworkBackup{const v=value as any;return !!v&&v.format===NETWORK_BACKUP_FORMAT&&typeof v.networkId==="string"&&v.datasets&&typeof v.datasets==="object"}
