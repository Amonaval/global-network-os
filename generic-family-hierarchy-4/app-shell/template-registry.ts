import type {VerticalTemplateDefinition} from "../core/templates/contracts";
import {validateTemplate} from "../core/templates/runtime";
import {FAMILY_TEMPLATE} from "../verticals/family/template";
import {ALUMNI_TEMPLATE} from "../verticals/alumni/template";
import {FUTURE_TEMPLATE_PROOFS} from "../core/templates/catalog";

export const NETWORK_TEMPLATES=[FAMILY_TEMPLATE,ALUMNI_TEMPLATE,...FUTURE_TEMPLATE_PROOFS] as const;
export function getNetworkTemplate(id:string):VerticalTemplateDefinition{const found=NETWORK_TEMPLATES.find(t=>t.id===id);if(!found)throw new Error(`Unknown network template: ${id}`);return found}
export function validateNetworkTemplateRegistry(){const errors:string[]=[];const ids=new Set<string>();for(const template of NETWORK_TEMPLATES){if(ids.has(template.id))errors.push(`Duplicate template ${template.id}`);ids.add(template.id);const result=validateTemplate(template);errors.push(...result.errors.map(e=>`${template.id}: ${e}`))}return {valid:errors.length===0,errors}}
