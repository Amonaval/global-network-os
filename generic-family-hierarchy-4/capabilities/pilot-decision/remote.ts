import {supabase} from '../../lib/supabase';
import type {PilotDecisionDisposition,PilotDecisionGate} from '../../core/activation/pilot-decision';
import type {PilotFeedbackMoment} from '../../core/activation/pilot-learning';

function required(){if(!supabase)throw new Error('Shared Supabase mode is required.');return supabase}

export async function fetchPilotDecisionGate(days=30):Promise<PilotDecisionGate|null>{
 const {data,error}=await required().rpc('get_my_pilot_product_decision_gate',{p_days:days});
 if(error)throw error;
 return data?data as PilotDecisionGate:null;
}

export async function recordPilotProductDecision(input:{moment:PilotFeedbackMoment;disposition:PilotDecisionDisposition;evidenceDays:number;rationale:string;nextAction?:string}):Promise<string>{
 const {data,error}=await required().rpc('record_pilot_product_decision',{
  p_moment_type:input.moment,p_disposition:input.disposition,p_evidence_days:input.evidenceDays,p_rationale:input.rationale.trim(),p_next_action:input.nextAction?.trim()||null
 });
 if(error)throw error;
 return String(data);
}
