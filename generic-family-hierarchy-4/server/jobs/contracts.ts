export type BackgroundJobName="send_network_digest"|"process_bulk_invites"|"refresh_network_projection"|"run_ai_enrichment";
export type BackgroundJob<TPayload=Record<string,unknown>>={name:BackgroundJobName;payload:TPayload;actorId:string;networkId?:string;requestId:string};
export type BackgroundJobReceipt={accepted:boolean;mode:"inline"|"external";jobId?:string};
