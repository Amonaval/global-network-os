import {supabase} from "../../lib/supabase";
import type {PilotFeedbackContext,PilotFeedbackMoment,PilotFeedbackOutcome,PilotFrictionCode,PilotLearningSummary} from "../../core/activation/pilot-learning";

function required(){if(!supabase)throw new Error("Shared Supabase mode is required.");return supabase}

export async function fetchPilotFeedbackContext():Promise<PilotFeedbackContext[]>{
 const {data,error}=await required().rpc("get_my_pilot_feedback_context");
 if(error)throw error;
 return ((data||[]) as any[]).map(x=>({networkId:x.network_id,networkName:x.network_name,verticalKind:x.vertical_kind,role:x.role,suggestedMoment:x.suggested_moment,lastSignalAt:x.last_signal_at||null}));
}

export async function submitPilotFeedback(input:{networkId:string;moment:PilotFeedbackMoment;outcome:PilotFeedbackOutcome;friction:PilotFrictionCode;note?:string}):Promise<string>{
 const {data,error}=await required().rpc("submit_pilot_feedback",{p_network_id:input.networkId,p_moment_type:input.moment,p_outcome:input.outcome,p_friction_code:input.friction,p_note:input.note?.trim()||null});
 if(error)throw error;
 return String(data);
}

export async function fetchPilotLearningSummary(days=30):Promise<PilotLearningSummary|null>{
 const {data,error}=await required().rpc("get_my_pilot_learning_summary",{p_days:days});
 if(error)throw error;
 if(!data)return null;
 return data as PilotLearningSummary;
}
