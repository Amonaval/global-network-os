'use client';
import { useEffect,useState } from 'react';
import { Copy,KeyRound,RefreshCw,Share2 } from 'lucide-react';
import { Member } from '../lib/types';
import { createInvitation,getOrCreateFamilyJoinCode,regenerateFamilyJoinCode } from '../lib/remote';
import FeatureGuide from './FeatureGuide';
import {GUIDE_ENTRIES} from '../lib/user-guide-content';

export default function InvitationModal({ members, onClose, onDone, onOpenGuide }: { members: Member[]; onClose: () => void; onDone: (message: string) => void; onOpenGuide?: (key:string)=>void }) {
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
  const shareCode=async()=>{if(!joinCode)return;const text=`Join our private family on Family Network. Sign in, choose “Join my family”, and enter code ${joinCode}.`;try{if(navigator.share)await navigator.share({title:'Join our family',text});else{await navigator.clipboard?.writeText(text);onDone('Join message copied.')}}catch{}};
  const regenerate=async()=>{if(!confirm('Replace the current family code? The old code will stop working.'))return;setBusy(true);try{setJoinCode(await regenerateFamilyJoinCode());onDone('New family code created.')}catch(e:any){onDone(e.message||'Could not regenerate family code.')}finally{setBusy(false)}};
  return <div className="modal-overlay" onMouseDown={(event)=>event.target===event.currentTarget&&onClose()}><div className="modal invite-modal" style={{maxWidth:620}}>
    <div className="drawer-head"><h2 style={{margin:0}}>Invite family</h2><button className="btn small" onClick={onClose}>Close</button></div>
    <FeatureGuide entry={GUIDE_ENTRIES.find(e=>e.key==="invitations")} onOpenGuide={onOpenGuide} rememberKey="modal-invitations"/>
    <div className="quick-join-code card"><div><span className="warm-kicker"><KeyRound size={13}/> Easiest for Alpha</span><h3>Share the Family Code</h3><p className="page-subtitle">Anyone you trust with this code can sign in and join the family as a normal member to explore it. They do not automatically claim a person’s profile.</p></div><div className="family-code-display">{joinCode||'Loading…'}</div><div className="card-actions"><button className="btn primary" disabled={!joinCode} onClick={copyCode}><Copy size={15}/> Copy code</button><button className="btn" disabled={!joinCode} onClick={shareCode}><Share2 size={15}/> Share / WhatsApp</button><button className="btn small" disabled={busy} onClick={regenerate}><RefreshCw size={14}/> New code</button></div></div>
    <div className="entry-or"><span>or invite one known profile</span></div>
    <p className="page-subtitle">A personal invitation is best when the person already exists in the hierarchy. It lets them claim exactly that profile.</p>
    <div className="form-grid" style={{marginTop:18}}>
      <div className="field full"><label>Member</label><select className="select" value={memberId} onChange={e=>setMemberId(e.target.value)}>{members.map(m=><option key={m.id} value={m.id}>{m.full_name}{m.email?` · ${m.email}`:''}</option>)}</select></div>
      <div className="field"><label>Expires in (days)</label><input className="text-input" type="number" min="1" max="30" value={days} onChange={e=>setDays(e.target.value)}/></div>
    </div>
    {link&&<div className="notice" style={{marginTop:14}}><b>Personal invitation link</b><div style={{wordBreak:'break-all',marginTop:5}}>{link}</div><div className="person-meta" style={{marginTop:6}}>Single-use. Share privately with the intended member.</div></div>}
    <div className="form-actions"><button className="btn" onClick={onClose}>Cancel</button><button className="btn primary" disabled={!memberId||busy} onClick={create}>{busy?'Creating…':link?'Create another personal link':'Create personal invitation'}</button></div>
  </div></div>;
}
