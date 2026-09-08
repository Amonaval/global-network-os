import {supabase} from "../../lib/supabase";
export type QuickStartState={dismissed:boolean;completedStepIds:string[];updatedAt?:string};
const empty:QuickStartState={dismissed:false,completedStepIds:[]};
export async function fetchQuickStartState(networkId:string):Promise<QuickStartState>{if(!supabase)return empty;const {data,error}=await supabase.rpc("get_network_quick_start_state",{p_network_id:networkId});if(error)throw error;const row=Array.isArray(data)?data[0]:data;return row?{dismissed:Boolean(row.dismissed),completedStepIds:Array.isArray(row.completed_step_ids)?row.completed_step_ids:[],updatedAt:row.updated_at}:empty}
export async function saveQuickStartState(networkId:string,state:QuickStartState){if(!supabase)return;const {error}=await supabase.rpc("save_network_quick_start_state",{p_network_id:networkId,p_dismissed:state.dismissed,p_completed_step_ids:state.completedStepIds});if(error)throw error}
