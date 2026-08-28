"use client";
import {useLanguage} from "../../lib/i18n";
import {CalendarDays,Image as ImageIcon,MapPin,UsersRound} from "lucide-react";
import type {NetworkActivity} from "../../core/network-os/contracts";
import type {NetworkGroup} from "../../capabilities/activity/remote";

export default function NetworkPulse({activities,groups,locationCount,onOpenCommunity,onOpenPlaces}:{activities:NetworkActivity[];groups:NetworkGroup[];locationCount:number;onOpenCommunity:()=>void;onOpenPlaces:()=>void}){
 const {t:tr}=useLanguage();
 const now=Date.now();
 const upcoming=activities.filter(a=>a.type==="event"&&a.startsAt&&new Date(a.startsAt).getTime()>now).length;
 const stories=activities.filter(a=>a.type==="memory"||a.type==="milestone").length;
 return <section className="card network-pulse-card"><div className="network-pulse-head"><div><span className="warm-kicker">{tr("NetworkPulseTxt")}</span><h3>{tr("WhatIsAliveRightNowTxt")}</h3><p>{tr("EventsSharedHistoryGroupsAndGeographyBringTxt")}</p></div><button className="btn small" onClick={onOpenCommunity}>{tr("OpenCommunityTxt")}</button></div><div className="network-pulse-grid"><button onClick={onOpenCommunity}><CalendarDays/><span><b>{upcoming}</b><small>{tr("UpcomingEventsTxt")}</small></span></button><button onClick={onOpenCommunity}><ImageIcon/><span><b>{stories}</b><small>{tr("StoriesAndMilestonesTxt")}</small></span></button><button onClick={onOpenCommunity}><UsersRound/><span><b>{groups.length}</b><small>{tr("GroupsChaptersTxt")}</small></span></button><button onClick={onOpenPlaces}><MapPin/><span><b>{locationCount}</b><small>{tr("Locations2Txt")}</small></span></button></div></section>;
}
