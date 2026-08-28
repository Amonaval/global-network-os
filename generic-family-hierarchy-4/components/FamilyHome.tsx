"use client";
import {useEffect,useState} from "react";
import type {LifeEvent,Member,Memory,Relationship} from "../lib/types";
import {getNetworkRepository} from "../lib/repository";
import FamilySignatureExperience from "./FamilySignatureExperience";

type HomeView="community"|"participation"|"tree";
type Props={
 members:Member[];events:LifeEvent[];memories?:Memory[];relationships?:Relationship[];networkName?:string;viewerMemberId?:string;
 onSelect:(m:Member)=>void;onGo:(v:HomeView)=>void;onAddRelative:()=>void;
 showMemories?:boolean;showSpecialDays?:boolean;showContributions?:boolean;showSharing?:boolean;showFamilyPulse?:boolean;showQuietDigest?:boolean;canAddRelative?:boolean;simple?:boolean;readOnly?:boolean;
};

export default function FamilyHome({members,events,memories:providedMemories,relationships=[],networkName,viewerMemberId,onSelect,onGo,onAddRelative,showMemories=true,showContributions=true,canAddRelative=true,simple=false,readOnly=false}:Props){
 const repo=getNetworkRepository();
 const [memories,setMemories]=useState<Memory[]>(providedMemories||[]);
 useEffect(()=>{if(providedMemories){setMemories(providedMemories);return;}repo.fetchMemories().then(setMemories).catch(()=>setMemories([]));},[providedMemories]);
 return <FamilySignatureExperience members={members} events={events} memories={memories} relationships={relationships} networkName={networkName} viewerMemberId={viewerMemberId} onSelect={onSelect} onGo={onGo} onAddRelative={onAddRelative} showMemories={showMemories} showContributions={showContributions} canAddRelative={canAddRelative} simple={simple} readOnly={readOnly}/>;
}
