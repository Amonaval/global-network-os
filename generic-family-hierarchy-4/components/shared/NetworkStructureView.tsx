"use client";
import {useMemo,useState} from "react";
import {GitFork,Layers3,RotateCcw} from "lucide-react";
import type {NetworkAffiliatedEntity,NetworkProjectionDefinition,ProjectionNode} from "../../core/network-os/contracts";
import {buildProjectionTree} from "../../capabilities/affiliation/runtime";
import {NetworkEmpty,NetworkSectionHead} from "./NetworkUi";

function StructureNode({node,entities,onEntityOpen,highlightedEntityId}:{node:ProjectionNode;entities:readonly NetworkAffiliatedEntity[];onEntityOpen?:(entity:NetworkAffiliatedEntity)=>void;highlightedEntityId?:string}){
 const leaves=node.children.length===0?node.entityIds.map(id=>entities.find(e=>e.entity.id===id)).filter(Boolean) as NetworkAffiliatedEntity[]:[];
 return <div className="network-structure-node"><div className="network-structure-branch"><span>{node.levelKey.replaceAll("_"," ")}</span><b>{node.label}</b><small>{node.entityCount} connected</small></div>{node.children.length>0&&<div className="network-structure-children">{node.children.map(child=><StructureNode key={child.key} node={child} entities={entities} onEntityOpen={onEntityOpen} highlightedEntityId={highlightedEntityId}/>)}</div>}{leaves.length>0&&<div className="network-structure-leaves">{leaves.map(item=><button key={item.entity.id} className={highlightedEntityId===item.entity.id?"highlighted":""} onClick={()=>onEntityOpen?.(item)}><span className="network-avatar sm">{item.entity.label.split(/\s+/).map(x=>x[0]).slice(0,2).join("").toUpperCase()}</span><span><b>{item.entity.label}</b><small>{String(item.entity.metadata?.role||item.entity.metadata?.description||item.entity.kind)}</small></span></button>)}</div>}</div>
}

export default function NetworkStructureView({entities,projections,title,description,onEntityOpen,highlightedEntityId}:{entities:readonly NetworkAffiliatedEntity[];projections:readonly NetworkProjectionDefinition[];title:string;description:string;onEntityOpen?:(entity:NetworkAffiliatedEntity)=>void;highlightedEntityId?:string}){
 const defaultProjection=projections.find(p=>p.default)||projections[0];
 const [projectionKey,setProjectionKey]=useState(defaultProjection?.key||"");
 const projection=projections.find(p=>p.key===projectionKey)||defaultProjection;
 const tree=useMemo(()=>projection?buildProjectionTree(entities,projection):[],[entities,projection]);
 if(!projection)return <NetworkEmpty icon={<GitFork/>} title="No structure available" description="Add dimensions and a projection to create a navigable network structure."/>;
 return <div className="network-structure-view"><NetworkSectionHead kicker={<><GitFork size={12}/> Living network structure</>} title={title} description={description}/><div className="projection-toolbar card"><label><span>Structure view</span><select className="select" value={projection.key} onChange={e=>setProjectionKey(e.target.value)}>{projections.map(p=><option key={p.key} value={p.key}>{p.label}</option>)}</select></label><span className="structure-proof"><Layers3 size={14}/>{projection.levels.join(" → ")}</span>{projection.key!==defaultProjection?.key&&<button className="btn small" onClick={()=>setProjectionKey(defaultProjection?.key||"")}><RotateCcw size={14}/> Default</button>}</div><section className="card network-structure-canvas">{tree.map(node=><StructureNode key={node.key} node={node} entities={entities} onEntityOpen={onEntityOpen} highlightedEntityId={highlightedEntityId}/>)}{tree.length===0&&<NetworkEmpty title="Structure is empty" description="This projection has no affiliated entities yet."/>}</section></div>
}
