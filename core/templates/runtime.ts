import type {CapabilityId,VerticalTemplateDefinition} from "./contracts";
export const CAPABILITY_DEPENDENCIES:Partial<Record<CapabilityId,CapabilityId[]>>={discovery:["profiles"],"connection-paths":["profiles"],groups:["profiles"],events:["profiles"],memories:["profiles"],maps:["profiles"],contributions:["profiles"],construction:["profiles"]};
export function validateTemplate(template:VerticalTemplateDefinition){
 const errors:string[]=[];const caps=new Set(template.capabilities);const dimKeys=new Set<string>();
 for(const d of template.dimensions){if(dimKeys.has(d.key))errors.push(`Duplicate dimension ${d.key}`);dimKeys.add(d.key)}
 for(const p of template.projections)for(const level of p.levels)if(!dimKeys.has(level))errors.push(`Projection ${p.key} uses unknown dimension ${level}`);
 for(const cap of template.capabilities)for(const dep of CAPABILITY_DEPENDENCIES[cap]||[])if(!caps.has(dep))errors.push(`Capability ${cap} requires ${dep}`);
 if(!template.entityKinds.includes(template.primaryEntityKind))errors.push("Primary entity kind must be registered");
 return {valid:errors.length===0,errors};
}
export function capabilityAvailable(template:VerticalTemplateDefinition,capability:CapabilityId){return template.capabilities.includes(capability)}
