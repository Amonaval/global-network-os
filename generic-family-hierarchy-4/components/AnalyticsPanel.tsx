"use client";
import {useEffect,useState} from 'react';
import {BarChart3,MapPinned,Users,Heart,CalendarDays,Download,Printer} from 'lucide-react';
import {NetworkAnalytics} from '../lib/types';
import {getNetworkRepository} from '../lib/repository';

export default function AnalyticsPanel({onNotify}:{onNotify:(x:string)=>void}){
 const repo=getNetworkRepository(); const [a,setA]=useState<NetworkAnalytics|null>(null); const [geo,setGeo]=useState<any[]>([]); const [busy,setBusy]=useState(true);
 useEffect(()=>{(async()=>{try{setA(await repo.fetchNetworkAnalytics());setGeo(await repo.fetchGeographySummary())}catch(e:any){onNotify(e.message||'Could not load analytics.')}finally{setBusy(false)}})()},[]);
 if(busy)return <div className="card governance-card"><div className="empty compact">Loading network intelligence…</div></div>;
 if(!a)return <div className="card governance-card"><div className="empty compact">Analytics are available in shared mode for administrators.</div></div>;
 const maxGen=Math.max(1,...a.generations.map(x=>x.count)); const maxCity=Math.max(1,...a.cities.map(x=>x.count));
 return <div className="card governance-card"><div className="governance-head"><div><h3 style={{margin:0}}>Network Intelligence</h3><p className="page-subtitle">P4.4 server-side summary of people, branches, places and activity.</p></div><BarChart3 size={18}/></div>
  <div className="admin-grid" style={{marginTop:12}}>{[[Users,'Members',a.members],[Users,'Living',a.living],[Heart,'In memoriam',a.deceased],[MapPinned,'Mapped',a.mapped],[Heart,'Memories',a.memories],[CalendarDays,'Life events',a.life_events]].map(([Icon,label,value]:any)=><div className="card stat" key={label}><div className="stat-label"><Icon size={14}/> {label}</div><div className="stat-number">{value}</div></div>)}</div>
  <div className="analytics-columns"><div><h4>Generations</h4>{a.generations.map(x=><div className="analytics-row" key={x.generation}><span>Generation {x.generation}</span><div className="analytics-bar"><i style={{width:`${Math.max(5,x.count/maxGen*100)}%`}}/></div><b>{x.count}</b></div>)}</div>
  <div><h4>Top locations</h4>{a.cities.slice(0,8).map(x=><div className="analytics-row" key={`${x.city}-${x.country}`}><span>{x.city}</span><div className="analytics-bar"><i style={{width:`${Math.max(5,x.count/maxCity*100)}%`}}/></div><b>{x.count}</b></div>)}</div></div>
  <div className="card-actions"><button className="btn" onClick={()=>window.print()}><Printer size={14}/> Print / Save as PDF</button><button className="btn" onClick={()=>{const blob=new Blob([JSON.stringify({analytics:a,geography:geo},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const el=document.createElement('a');el.href=url;el.download='network-analytics.json';el.click();URL.revokeObjectURL(url)}}><Download size={14}/> Export analytics JSON</button></div>
 </div>
}
