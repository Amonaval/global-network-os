import { demoMembers, demoRelationships, demoSubmissions } from './demo-data';
import { LifeEvent, Member, Relationship, Submission } from './types';

export type State={members:Member[];relationships:Relationship[];submissions:Submission[];lifeEvents:LifeEvent[]};
const KEY='hierarchy-network-state-v2';
function initial():State{return {members:[],relationships:[],submissions:[],lifeEvents:[]};}
export function loadState():State{if(typeof window==='undefined')return initial();try{const raw=localStorage.getItem(KEY);if(!raw)return initial();const parsed=JSON.parse(raw);return {...initial(),...parsed,lifeEvents:parsed.lifeEvents||[]};}catch{return initial();}}
export function saveState(state:State){localStorage.setItem(KEY,JSON.stringify(state));}
export function resetState(){localStorage.removeItem(KEY);localStorage.removeItem('hierarchy-network-settings-v1');window.location.reload();}
export function loadDemoState():State{const state={members:demoMembers,relationships:demoRelationships,submissions:demoSubmissions,lifeEvents:[]};saveState(state);return state;}
export function downloadText(filename:string,text:string,type='text/plain'){const blob=new Blob([text],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);}
