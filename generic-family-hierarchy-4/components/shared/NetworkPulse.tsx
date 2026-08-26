"use client";
import {CalendarDays,Image as ImageIcon,MapPin,UsersRound} from "lucide-react";
import type {NetworkActivity} from "../../core/network-os/contracts";
import type {NetworkGroup} from "../../capabilities/activity/remote";

export default function NetworkPulse({activities,groups,locationCount,onOpenCommunity,onOpenPlaces}:{activities:NetworkActivity[];groups:NetworkGroup[];locationCount:number;onOpenCommunity:()=>void;onOpenPlaces:()=>void}){
 const now=Date.now();
 const upcoming=activities.filter(a=>a.type==="event"&&a.startsAt&&new Date(a.startsAt).getTime()>now).length;
 const stories=activities.filter(a=>a.type==="memory"||a.type==="milestone").length;
 return <section className="card network-pulse-card"><div className="network-pulse-head"><div><span className="warm-kicker">Network pulse</span><h3>What is alive right now</h3><p>Events, shared history, groups and geography bring the structure to life.</p></div><button className="btn small" onClick={onOpenCommunity}>Open community</button></div><div className="network-pulse-grid"><button onClick={onOpenCommunity}><CalendarDays/><span><b>{upcoming}</b><small>Upcoming events</small></span></button><button onClick={onOpenCommunity}><ImageIcon/><span><b>{stories}</b><small>Stories & milestones</small></span></button><button onClick={onOpenCommunity}><UsersRound/><span><b>{groups.length}</b><small>Groups / chapters</small></span></button><button onClick={onOpenPlaces}><MapPin/><span><b>{locationCount}</b><small>Locations</small></span></button></div></section>;
}
