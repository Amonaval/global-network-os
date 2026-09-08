"use client";
import {useEffect,useMemo,useState} from "react";
import {ArrowRight,Sparkles,X} from "lucide-react";
import {getVerticalAppComposition} from "../../app-shell/vertical-runtime";
import {getVerticalDefinition} from "../../app-shell/vertical-registry";
import type {NetworkVerticalKind} from "../../core/verticals/contracts";
import {fetchMyFeatureAnnouncements,markFeatureAnnouncementSeen,type FeatureAnnouncement} from "../../lib/remote";
import {useLanguage} from "../../lib/i18n";
export default function NetworkWhatsNew({kind,demo=false,onOpen}:{kind:NetworkVerticalKind;demo?:boolean;onOpen:(viewId:string)=>void}){
 const {t}=useLanguage(),[rows,setRows]=useState<FeatureAnnouncement[]>([]),definition=getVerticalDefinition(kind),composition=getVerticalAppComposition(kind);
 const allowed=useMemo(()=>new Set(definition.featureCatalog.features.map(f=>String(f.key))),[definition]);
 useEffect(()=>{let alive=true;if(demo)return;fetchMyFeatureAnnouncements().then(data=>{if(alive)setRows(data.filter(row=>allowed.has(row.feature_key)))}).catch(()=>{});return()=>{alive=false}},[kind,demo,allowed]);
 const current=rows[0];if(!current)return null;
 const dismiss=async()=>{setRows(old=>old.filter(x=>!(x.feature_key===current.feature_key&&x.announcement_version===current.announcement_version)));try{await markFeatureAnnouncementSeen(current.feature_key,current.announcement_version)}catch{}};
 const open=()=>{const target=composition.whatsNew.featureToView[current.feature_key]||composition.whatsNew.defaultView;onOpen(target);void dismiss()};
 return <section data-testid="qa-whats-new" className="whats-new-card xp7-whats-new"><div className="whats-new-icon"><Sparkles size={20}/></div><div><span className="warm-kicker">{t("XP7WhatsNewTxt")}</span><h3>{t("XP7CapabilityUpdatedTxt")}</h3><p>{t("XP7CapabilityUpdatedDescTxt")}</p><small>{current.feature_key} · v{current.announcement_version} · {new Date(current.updated_at).toLocaleDateString()}</small></div><div className="whats-new-actions"><button className="btn primary small" onClick={open}>{t("XP7OpenUpdateTxt")} <ArrowRight size={13}/></button><button className="icon-button" aria-label={t("XP7MarkReadTxt")} onClick={()=>void dismiss()}><X size={14}/></button></div></section>;
}
