'use client';
import {useLanguage} from "../lib/i18n";
import { useEffect,useState } from 'react';
import { Copy,KeyRound,RefreshCw,Share2 } from 'lucide-react';
import { Member } from '../lib/types';
import { createInvitation,getOrCreateFamilyJoinCode,regenerateFamilyJoinCode } from '../lib/remote';
import FeatureGuide from './FeatureGuide';
import {GUIDE_ENTRIES} from '../lib/user-guide-content';

export default function InvitationModal({ members, onClose, onDone, onOpenGuide }: { members: Member[]; onClose: () => void; onDone: (message: string) => void; onOpenGuide?: (key:string)=>void }) {
 const {t:tr}=useLanguage();
  const [memberId, setMemberId] = useState(members[0]?.id || '');
  const [days, setDays] = useState('7');
  const [link, setLink] = useState('');
  const [joinCode,setJoinCode]=useState('');
  const [busy, setBusy] = useState(false);
  useEffect(()=>{getOrCreateFamilyJoinCode().then(setJoinCode).catch(()=>setJoinCode(''))},[]);
  const create = async () => {
    try { setBusy(true); const token = await createInvitation(memberId, Math.max(1, Math.min(30, Number(days) || 7))); const value = `${window.location.origin}/invite/${token}`; setLink(value); await navigator.clipboard?.writeText(value); onDone('Personal invitation link created and copied.'); }
    catch (e: any) { onDone(e.message || 'Could not create invitation.'); }
    finally { setBusy(false); }
  };
  const copyCode=async()=>{if(!joinCode)return;await navigator.clipboard?.writeText(joinCode);onDone('Family code copied.');};
  const shareCode=async()=>{if(!joinCode)return;const text=`Join our private family on Family Network. Sign in, choose “Join my family”, and enter code ${joinCode}.`;try{if(navigator.share)await navigator.share({title:tr("JoinOurFamilyTxt"),text});else{await navigator.clipboard?.writeText(text);onDone('Join message copied.')}}catch{}};
  const regenerate=async()=>{if(!confirm(tr("ReplaceTheCurrentFamilyCodeTheOldTxt")))return;setBusy(true);try{setJoinCode(await regenerateFamilyJoinCode());onDone('New family code created.')}catch(e:any){onDone(e.message||'Could not regenerate family code.')}finally{setBusy(false)}};
  return <div className="modal-overlay" onMouseDown={(event)=>event.target===event.currentTarget&&onClose()}><div className="modal invite-modal" style={{maxWidth:620}}>
    <div className="drawer-head"><h2 style={{margin:0}}>{tr("InviteFamilyTxt")}</h2><button className="btn small" onClick={onClose}>{tr("CloseTxt")}</button></div>
    <FeatureGuide entry={GUIDE_ENTRIES.find(e=>e.key==="invitations")} onOpenGuide={onOpenGuide} rememberKey="modal-invitations"/>
    <div className="quick-join-code card"><div><span className="warm-kicker"><KeyRound size={13}/> {tr("EasiestForAlphaTxt")}</span><h3>{tr("ShareTheFamilyCodeTxt")}</h3><p className="page-subtitle">{tr("AnyoneYouTrustWithThisCodeCanTxt")}</p></div><div className="family-code-display">{joinCode||tr("LoadingTxt")}</div><div className="card-actions"><button className="btn primary" disabled={!joinCode} onClick={copyCode}><Copy size={15}/> {tr("CopyCodeTxt")}</button><button className="btn" disabled={!joinCode} onClick={shareCode}><Share2 size={15}/> {tr("ShareWhatsAppTxt")}</button><button className="btn small" disabled={busy} onClick={regenerate}><RefreshCw size={14}/> {tr("NewCodeTxt")}</button></div></div>
    <div className="entry-or"><span>{tr("OrInviteOneKnownProfileTxt")}</span></div>
    <p className="page-subtitle">{tr("APersonalInvitationIsBestWhenTheTxt")}</p>
    <div className="form-grid" style={{marginTop:18}}>
      <div className="field full"><label>{tr("MemberTxt")}</label><select className="select" value={memberId} onChange={e=>setMemberId(e.target.value)}>{members.map(m=><option key={m.id} value={m.id}>{m.full_name}{m.email?` · ${m.email}`:''}</option>)}</select></div>
      <div className="field"><label>{tr("ExpiresInDaysTxt")}</label><input className="text-input" type="number" min="1" max="30" value={days} onChange={e=>setDays(e.target.value)}/></div>
    </div>
    {link&&<div className="notice" style={{marginTop:14}}><b>{tr("PersonalInvitationLinkTxt")}</b><div style={{wordBreak:'break-all',marginTop:5}}>{link}</div><div className="person-meta" style={{marginTop:6}}>{tr("SingleUseSharePrivatelyWithTheIntendedTxt")}</div></div>}
    <div className="form-actions"><button className="btn" onClick={onClose}>{tr("CancelTxt")}</button><button className="btn primary" disabled={!memberId||busy} onClick={create}>{busy?tr("CreatingTxt"):link?tr("CreateAnotherPersonalLinkTxt"):tr("CreatePersonalInvitationTxt")}</button></div>
  </div></div>;
}
