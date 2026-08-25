"use client";
import {useMemo,useState} from "react";
import {ChevronRight,Layers3,RotateCcw,UsersRound} from "lucide-react";
import type {NetworkAffiliatedEntity,NetworkProjectionDefinition,ProjectionNode} from "../../core/network-os/contracts";
import {buildProjectionTree,filterEntitiesByProjectionPath,projectionPathLabel} from "../../capabilities/affiliation/runtime";
import {NetworkEmpty,NetworkSectionHead} from "./NetworkUi";

type Step={levelKey:string;label:string};
function nodeCountLabel(n:number,singular="member",plural="members"){return `${n} ${n===1?singular:plural}`}

export default function NetworkProjectionExplorer({entities,projections,onEntityOpen,entityLabel="member",entityLabelPlural="members"}:{entities:readonly NetworkAffiliatedEntity[];projections:readonly NetworkProjectionDefinition[];onEntityOpen?:(entity:NetworkAffiliatedEntity)=>void;entityLabel?:string;entityLabelPlural?:string}){
 const defaultProjection=projections.find(p=>p.default)||projections[0];
 const [projectionKey,setProjectionKey]=useState(defaultProjection?.key||"");
 const [path,setPath]=useState<Step[]>([]);
 const projection=projections.find(p=>p.key===projectionKey)||defaultProjection;
 const tree=useMemo(()=>projection?buildProjectionTree(entities,projection):[],[entities,projection]);
 const currentNodes=useMemo(()=>{let nodes:ProjectionNode[]=tree;for(const step of path){const hit=nodes.find(n=>n.levelKey===step.levelKey&&n.label===step.label);nodes=hit?.children||[]}return nodes},[tree,path]);
 const matching=useMemo(()=>filterEntitiesByProjectionPath(entities,path),[entities,path]);
 const selectProjection=(key:string)=>{setProjectionKey(key);setPath([])};
 if(!projection||!projections.length)return <NetworkEmpty icon={<Layers3/>} title="No network structure yet" description="Add dimensions or import network members to build an explorer."/>;
 return <div className="network-projection-explorer">
  <NetworkSectionHead kicker={<><Layers3 size={12}/> Configurable network explorer</>} title="Explore the network your way" description={`Switch the hierarchy without duplicating ${entityLabelPlural.toLowerCase()}. The same affiliations power every projection.`}/>
  <div className="projection-toolbar card"><label><span>View network as</span><select className="select" value={projection.key} onChange={e=>selectProjection(e.target.value)}>{projections.map(p=><option key={p.key} value={p.key}>{p.label}</option>)}</select></label>{path.length>0&&<button className="btn small" onClick={()=>setPath([])}><RotateCcw size={14}/> Start over</button>}</div>
  <div className="projection-breadcrumbs">{path.length===0?<span>All network</span>:path.map((step,i)=><button key={`${step.levelKey}-${i}`} onClick={()=>setPath(path.slice(0,i+1))}>{step.label}{i<path.length-1&&<ChevronRight size={12}/>}</button>)}</div>
  <div className="projection-layout">
   <section className="card projection-tree-panel">
    <div className="projection-panel-title"><div><small>{projection.label}</small><h3>{path.length?projectionPathLabel(path):"Choose a branch"}</h3></div><b>{nodeCountLabel(matching.length,entityLabel.toLowerCase(),entityLabelPlural.toLowerCase())}</b></div>
    <div className="projection-node-list">{currentNodes.map(node=><button key={node.key} className="projection-node" onClick={()=>setPath(x=>[...x,{levelKey:node.levelKey,label:node.label}])}><span><i>{node.depth+1}</i><b>{node.label}</b><small>{node.levelKey.replaceAll("_"," ")}</small></span><em>{nodeCountLabel(node.entityCount,entityLabel.toLowerCase(),entityLabelPlural.toLowerCase())}<ChevronRight size={14}/></em></button>)}{currentNodes.length===0&&path.length<projection.levels.length&&<NetworkEmpty title="Nothing deeper here" description="This branch has no more configured hierarchy levels."/>}</div>
   </section>
   <section className="card projection-people-panel">
    <div className="projection-panel-title"><div><small>{entityLabelPlural} in this view</small><h3>{path.length?path[path.length-1].label:"Entire network"}</h3></div><UsersRound size={18}/></div>
    <div className="projection-person-list">{matching.slice(0,30).map(item=><button key={item.entity.id} onClick={()=>onEntityOpen?.(item)}><span className="network-avatar sm">{item.entity.label.split(/\s+/).map(x=>x[0]).slice(0,2).join("").toUpperCase()}</span><span><b>{item.entity.label}</b><small>{Object.entries(item.affiliations).filter(([k])=>!path.some(p=>p.levelKey===k)).slice(0,2).flatMap(([,v])=>v).join(" · ")||"Network member"}</small></span></button>)}{matching.length===0&&<NetworkEmpty title="No matching people" description={`Choose another branch or projection to find ${entityLabelPlural.toLowerCase()}.`}/>}</div>
   </section>
  </div>
 </div>
}
