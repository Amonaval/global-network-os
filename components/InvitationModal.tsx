'use client';
import { useState } from 'react';
import { Member } from '../lib/types';
import { createInvitation } from '../lib/remote';

export default function InvitationModal({ members, onClose, onDone }: { members: Member[]; onClose: () => void; onDone: (message: string) => void }) {
  const [memberId, setMemberId] = useState(members[0]?.id || '');
  const [days, setDays] = useState('7');
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const create = async () => {
    try { setBusy(true); const token = await createInvitation(memberId, Math.max(1, Math.min(30, Number(days) || 7))); const value = `${window.location.origin}/invite/${token}`; setLink(value); await navigator.clipboard?.writeText(value); onDone('Invitation link created and copied.'); }
    catch (e: any) { onDone(e.message || 'Could not create invitation.'); }
    finally { setBusy(false); }
  };
  return <div className="modal-overlay"><div className="modal" style={{maxWidth:560}}>
    <div className="drawer-head"><h2 style={{margin:0}}>Invite a Member</h2><button className="btn small" onClick={onClose}>Close</button></div>
    <p className="page-subtitle">Create a short-lived, single-use link for a person already present in the hierarchy. The link lets them create their account and claim their profile.</p>
    <div className="form-grid" style={{marginTop:18}}>
      <div className="field full"><label>Member</label><select className="select" value={memberId} onChange={e=>setMemberId(e.target.value)}>{members.map(m=><option key={m.id} value={m.id}>{m.full_name}{m.email?` · ${m.email}`:''}</option>)}</select></div>
      <div className="field"><label>Expires in (days)</label><input className="text-input" type="number" min="1" max="30" value={days} onChange={e=>setDays(e.target.value)}/></div>
    </div>
    {link&&<div className="notice" style={{marginTop:14}}><b>Invitation link</b><div style={{wordBreak:'break-all',marginTop:5}}>{link}</div><div className="person-meta" style={{marginTop:6}}>Single-use. Share privately with the intended member.</div></div>}
    <div className="form-actions"><button className="btn" onClick={onClose}>Cancel</button><button className="btn primary" disabled={!memberId||busy} onClick={create}>{busy?'Creating…':link?'Create another link':'Create Invitation'}</button></div>
  </div></div>;
}
