import type {VerticalTemplateDefinition} from "./contracts";
import {ORGANIZATION_TEMPLATE} from "../../templates/organization/definition";
import {BUSINESS_TRUST_TEMPLATE} from "../../templates/business-trust/definition";
import {FRANCHISE_TEMPLATE} from "../../templates/franchise/definition";
import {EDUCATION_TEMPLATE} from "../../templates/education/definition";
import {CUSTOM_NETWORK_TEMPLATE} from "../../templates/custom/definition";
import {PROFESSIONAL_TEMPLATE} from "../../templates/professional/definition";
import {RESIDENTIAL_TEMPLATE} from "../../templates/residential/definition";
import {SUPPLY_CHAIN_TEMPLATE} from "../../templates/supply-chain/definition";
import {INVESTOR_TEMPLATE} from "../../templates/investor/definition";
import {CUSTOMER_INTELLIGENCE_TEMPLATE} from "../../templates/customer-intelligence/definition";

export const FUTURE_TEMPLATE_PROOFS=[ORGANIZATION_TEMPLATE,BUSINESS_TRUST_TEMPLATE,FRANCHISE_TEMPLATE,EDUCATION_TEMPLATE,PROFESSIONAL_TEMPLATE,RESIDENTIAL_TEMPLATE,SUPPLY_CHAIN_TEMPLATE,INVESTOR_TEMPLATE,CUSTOMER_INTELLIGENCE_TEMPLATE,CUSTOM_NETWORK_TEMPLATE] as const;
export const FUTURE_TEMPLATE_BY_ID=Object.fromEntries(FUTURE_TEMPLATE_PROOFS.map(t=>[t.id,t])) as Record<string,VerticalTemplateDefinition>;
