export type NetworkHealthSignals={
 activeMembers:number;
 totalProfiles:number;
 claimedProfiles?:number;
 profileCompletion?:number;
 structureCount?:number;
 pendingWork?:number;
 importIssues?:number;
 activeAdmins?:number;
 storageUsagePercent?:number;
 activeCapabilities?:number;
};
export type NetworkHealthStatus="ready"|"attention"|"info";
export type NetworkHealthCheck={id:string;labelToken:string;status:NetworkHealthStatus;value:string};
export type NetworkHealthResult={score:number;ready:boolean;checks:NetworkHealthCheck[]};
const pct=(n:number)=>`${Math.max(0,Math.min(100,Math.round(n)))}%`;
export function evaluateNetworkHealth(signals:NetworkHealthSignals,pendingInvitations:number|null):NetworkHealthResult{
 const checks:NetworkHealthCheck[]=[];
 if(signals.profileCompletion!==undefined)checks.push({id:"profiles",labelToken:"XP7HealthProfilesTxt",status:signals.profileCompletion>=70?"ready":"attention",value:pct(signals.profileCompletion)});
 if(pendingInvitations!==null)checks.push({id:"invitations",labelToken:"XP7HealthInvitationsTxt",status:pendingInvitations<=5?"ready":"attention",value:String(pendingInvitations)});
 if(signals.claimedProfiles!==undefined){const unclaimed=Math.max(0,signals.totalProfiles-signals.claimedProfiles);const tolerance=Math.max(2,Math.ceil(signals.totalProfiles*.25));checks.push({id:"claims",labelToken:"XP7HealthClaimsTxt",status:unclaimed<=tolerance?"ready":"attention",value:String(unclaimed)});}
 if(signals.structureCount!==undefined)checks.push({id:"structure",labelToken:"XP7HealthStructureTxt",status:signals.structureCount>0?"ready":"attention",value:String(signals.structureCount)});
 if(signals.pendingWork!==undefined)checks.push({id:"work",labelToken:"XP7HealthPendingWorkTxt",status:signals.pendingWork<=5?"ready":"attention",value:String(signals.pendingWork)});
 if(signals.importIssues!==undefined)checks.push({id:"import",labelToken:"XP7HealthImportTxt",status:signals.importIssues===0?"ready":"attention",value:String(signals.importIssues)});
 if(signals.activeAdmins!==undefined)checks.push({id:"admins",labelToken:"XP7HealthAdminsTxt",status:signals.activeAdmins>=2?"ready":"attention",value:String(signals.activeAdmins)});
 if(signals.storageUsagePercent!==undefined)checks.push({id:"storage",labelToken:"XP7HealthStorageTxt",status:signals.storageUsagePercent<80?"ready":"attention",value:pct(signals.storageUsagePercent)});
 if(signals.activeCapabilities!==undefined)checks.push({id:"capabilities",labelToken:"XP7HealthCapabilitiesTxt",status:signals.activeCapabilities>0?"ready":"attention",value:String(signals.activeCapabilities)});
 if(!checks.length)return {score:0,ready:false,checks:[]};
 const readyCount=checks.filter(x=>x.status==="ready").length;
 const score=Math.round(readyCount/checks.length*100);
 return {score,ready:score>=70&&checks.every(x=>x.status!=="attention"||x.id==="admins"),checks};
}
