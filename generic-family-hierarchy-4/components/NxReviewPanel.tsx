"use client";
import {useLanguage} from "../lib/i18n";
import {NX_CATALOG,type NxVersion,useNxReview} from "../lib/nx-review";
export default function NxReviewPanel(){
 const {t:tr}=useLanguage();const {reviewMode,enabled,setEnabled}=useNxReview();if(!reviewMode)return null;return <aside className="nx-review-panel"><div className="nx-review-head"><b>{tr("NXReviewModeTxt")}</b><small>{tr("WindowNxFeaturesFalseToHideTxt")}</small></div>{(Object.keys(NX_CATALOG) as NxVersion[]).map(v=>{const x=NX_CATALOG[v];return <label key={v} className="nx-review-row"><input type="checkbox" checked={enabled[v]} onChange={e=>setEnabled(v,e.target.checked)}/><span><b>{v} · {x.title}</b><small>{x.summary}</small><em>{x.surfaces.join(" · ")}</em></span></label>})}</aside>}
