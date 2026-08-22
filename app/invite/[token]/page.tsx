'use client';
import {useEffect,useState} from 'react';
import {useParams,useRouter} from 'next/navigation';
import {ArrowLeft,ArrowRight,CheckCircle2,Heart,ShieldCheck,TreePine,UserRound} from 'lucide-react';
import {supabase} from '../../../lib/supabase';
import {acceptInvitation,fetchInvitationPreview} from '../../../lib/remote';
import LanguageSwitcher from '../../../components/LanguageSwitcher';

export default function InvitePage(){
 const params=useParams<{token:string}>(); const router=useRouter(); const token=String(params.token);
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[name,setName]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[preview,setPreview]=useState<any>(null),[existing,setExisting]=useState(false),[confirmed,setConfirmed]=useState(false),[joined,setJoined]=useState(false),[loading,setLoading]=useState(true);
 useEffect(()=>{(async()=>{if(!supabase){setMessage('This private family invitation needs shared mode.');setLoading(false);return}try{const p=await fetchInvitationPreview(token);setPreview(p);if(!p||p.status!=='active')throw new Error(p?.status==='revoked'?'This invitation is no longer active. Ask your family for a fresh invitation.':'This invitation has expired or has already been used. Ask your family for a fresh invitation.');setName(p.member_name||'');const {data:{session}}=await supabase.auth.getSession();if(session){await acceptInvitation(token);setJoined(true)}}catch(e:any){setMessage(e.message||'We could not open this family invitation.')}finally{setLoading(false)}})()},[token]);
 const submit=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setMessage('');try{if(!supabase)throw new Error('Shared mode is required.');if(existing){const {error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error}else{const {data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name}}});if(error)throw error;if(!data.session){setMessage('One last step: confirm the email we sent you, then open this same family invitation again.');return}}await acceptInvitation(token);setJoined(true)}catch(x:any){setMessage(x.message||'We could not connect your profile. Please check your details and try again.')}finally{setBusy(false)}};
  const active=preview?.status==='active';
 if(loading)return <main className="invite-friendly-page"><section className="invite-friendly-card invite-loading"><div className="loading-mark"><TreePine/></div><h1>Opening your family invitation…</h1><p>This may take a moment on a slow connection.</p></section></main>;
 if(joined)return <main className="invite-friendly-page"><section className="invite-friendly-card invite-success"><span className="invite-heart"><CheckCircle2/></span><span className="warm-kicker">You’re connected</span><h1>Welcome to {preview?.family_name||'your family'} ❤️</h1><p>Your account is now linked to your family profile. Start with the simple family view—there is nothing else you need to set up now.</p><button className="btn primary invite-main-action" onClick={()=>router.push('/')}>Meet my family <ArrowRight size={18}/></button><small>You can explore more features whenever you feel ready.</small></section></main>;
 if(!active)return <main className="invite-friendly-page"><section className="invite-friendly-card"><span className="invite-heart"><Heart/></span><h1>Private family invitation</h1><p>{message||'This invitation cannot be used.'}</p><button className="btn invite-main-action" onClick={()=>router.push('/')}>Go to Family Network</button></section></main>;
 return <main className="invite-friendly-page"><div className="invite-language"><LanguageSwitcher/></div><section className="invite-friendly-card">
   {!confirmed?<>
    <span className="warm-kicker"><Heart size={13} fill="currentColor"/> {preview.family_name||'Your family'}</span>
    <h1>Your family is waiting for you</h1>
    <p className="invite-lead">Someone in your family has already added your place in the family.</p>
    <div className="invite-identity"><span><UserRound/></span><div><small>We found this profile</small><strong>{preview.member_name}</strong></div></div>
    <h2>Is this you?</h2>
    <button className="btn primary invite-main-action" onClick={()=>setConfirmed(true)}>Yes, this is me <ArrowRight size={18}/></button>
    <button className="invite-secondary-action" onClick={()=>router.push('/')}>No, this isn’t me</button>
    <div className="invite-privacy"><ShieldCheck size={17}/><span>This is a private, single-use invitation. Your family information is not made public.</span></div>
   </>:<form onSubmit={submit}>
    <button type="button" className="invite-back" onClick={()=>setConfirmed(false)}><ArrowLeft size={16}/> Back</button>
    <span className="warm-kicker">Almost there</span><h1>{existing?'Sign in to join':'Create your family account'}</h1>
    <p className="invite-lead">We’ll connect this account directly to <b>{preview.member_name}</b> in {preview.family_name||'your family'}.</p>
    <div className="segmented activation-toggle"><button type="button" className={!existing?'active':''} onClick={()=>setExisting(false)}>I’m new</button><button type="button" className={existing?'active':''} onClick={()=>setExisting(true)}>I already have an account</button></div>
    {!existing&&<div className="field invite-field"><label>Your name</label><input className="text-input" value={name} onChange={e=>setName(e.target.value)} required/></div>}
    <div className="field invite-field"><label>Email address</label><input className="text-input" type="email" autoComplete="email" inputMode="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
    <div className="field invite-field"><label>Password</label><input className="text-input" type="password" autoComplete={existing?'current-password':'new-password'} minLength={8} value={password} onChange={e=>setPassword(e.target.value)} required/><small>At least 8 characters.</small></div>
    {message&&<div className="notice invite-message">{message}</div>}
    <button className="btn primary invite-main-action" disabled={busy}>{busy?'Connecting…':existing?'Sign in and join my family':'Create account and join'}</button>
    <div className="invite-privacy"><ShieldCheck size={17}/><span>After joining, we’ll open the simple Home · Family · Me experience first.</span></div>
   </form>}
 </section></main>
}
