import {useLanguage} from "../../../lib/i18n";
'use client';
import {useEffect,useState} from 'react';
import {useParams,useRouter} from 'next/navigation';
import {ArrowLeft,ArrowRight,CheckCircle2,Heart,ShieldCheck,TreePine,UserRound} from 'lucide-react';
import {supabase} from '../../../lib/supabase';
import {acceptInvitation,fetchInvitationPreview} from '../../../lib/remote';
import LanguageSwitcher from '../../../components/LanguageSwitcher';

export default function InvitePage(){
 const {t:tr}=useLanguage();
 const params=useParams<{token:string}>(); const router=useRouter(); const token=String(params.token);
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[name,setName]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[preview,setPreview]=useState<any>(null),[existing,setExisting]=useState(false),[confirmed,setConfirmed]=useState(false),[joined,setJoined]=useState(false),[loading,setLoading]=useState(true);
 useEffect(()=>{(async()=>{if(!supabase){setMessage(tr("ThisPrivateFamilyInvitationNeedsSharedModeTxt"));setLoading(false);return}try{const p=await fetchInvitationPreview(token);setPreview(p);if(!p||p.status!=='active')throw new Error(p?.status==='revoked'?'This invitation is no longer active. Ask your family for a fresh invitation.':'This invitation has expired or has already been used. Ask your family for a fresh invitation.');setName(p.member_name||'');const {data:{session}}=await supabase.auth.getSession();if(session){await acceptInvitation(token);setJoined(true)}}catch(e:any){setMessage(e.message||'We could not open this family invitation.')}finally{setLoading(false)}})()},[token]);
 const submit=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setMessage('');try{if(!supabase)throw new Error('Shared mode is required.');if(existing){const {error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error}else{const {data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name}}});if(error)throw error;if(!data.session){setMessage(tr("OneLastStepConfirmTheEmailWeTxt"));return}}await acceptInvitation(token);setJoined(true)}catch(x:any){setMessage(x.message||'We could not connect your profile. Please check your details and try again.')}finally{setBusy(false)}};
  const active=preview?.status==='active';
 if(loading)return <main className="invite-friendly-page"><section className="invite-friendly-card invite-loading"><div className="loading-mark"><TreePine/></div><h1>{tr("OpeningYourFamilyInvitationTxt")}</h1><p>{tr("ThisMayTakeAMomentOnATxt")}</p></section></main>;
 if(joined)return <main className="invite-friendly-page"><section className="invite-friendly-card invite-success"><span className="invite-heart"><CheckCircle2/></span><span className="warm-kicker">{tr("YouReConnectedTxt")}</span><h1>{tr("WelcomeToTxt")}{" "}{preview?.family_name||tr("YourFamilyTxt")} ❤️</h1><p>{tr("YourAccountIsNowLinkedToYourTxt")}</p><button className="btn primary invite-main-action" onClick={()=>router.push('/')}>{tr("MeetMyFamilyTxt")}{" "}<ArrowRight size={18}/></button><small>{tr("YouCanExploreMoreFeaturesWheneverYouTxt")}</small></section></main>;
 if(!active)return <main className="invite-friendly-page"><section className="invite-friendly-card"><span className="invite-heart"><Heart/></span><h1>{tr("PrivateFamilyInvitationTxt")}</h1><p>{message||tr("ThisInvitationCannotBeUsedTxt")}</p><button className="btn invite-main-action" onClick={()=>router.push('/')}>{tr("GoToFamilyNetworkTxt")}</button></section></main>;
 return <main className="invite-friendly-page"><div className="invite-language"><LanguageSwitcher/></div><section className="invite-friendly-card">
   {!confirmed?<>
    <span className="warm-kicker"><Heart size={13} fill="currentColor"/> {preview.family_name||tr("YourFamily2Txt")}</span>
    <h1>{tr("YourFamilyIsWaitingForYouTxt")}</h1>
    <p className="invite-lead">{tr("SomeoneInYourFamilyHasAlreadyAddedTxt")}</p>
    <div className="invite-identity"><span><UserRound/></span><div><small>{tr("WeFoundThisProfileTxt")}</small><strong>{preview.member_name}</strong></div></div>
    <h2>{tr("IsThisYouTxt")}</h2>
    <button className="btn primary invite-main-action" onClick={()=>setConfirmed(true)}>{tr("YesThisIsMeTxt")}{" "}<ArrowRight size={18}/></button>
    <button className="invite-secondary-action" onClick={()=>router.push('/')}>{tr("NoThisIsnTMeTxt")}</button>
    <div className="invite-privacy"><ShieldCheck size={17}/><span>{tr("ThisIsAPrivateSingleUseInvitationTxt")}</span></div>
   </>:<form onSubmit={submit}>
    <button type="button" className="invite-back" onClick={()=>setConfirmed(false)}><ArrowLeft size={16}/> {tr("BackTxt")}</button>
    <span className="warm-kicker">{tr("AlmostThereTxt")}</span><h1>{existing?tr("SignInToJoinTxt"):tr("CreateYourFamilyAccountTxt")}</h1>
    <p className="invite-lead">{tr("WeLlConnectThisAccountDirectlyToTxt")}{" "}<b>{preview.member_name}</b> {tr("InTxt")}{" "}{preview.family_name||tr("YourFamilyTxt")}.</p>
    <div className="segmented activation-toggle"><button type="button" className={!existing?'active':''} onClick={()=>setExisting(false)}>{tr("IMNewTxt")}</button><button type="button" className={existing?'active':''} onClick={()=>setExisting(true)}>{tr("IAlreadyHaveAnAccountTxt")}</button></div>
    {!existing&&<div className="field invite-field"><label>{tr("YourNameTxt")}</label><input className="text-input" value={name} onChange={e=>setName(e.target.value)} required/></div>}
    <div className="field invite-field"><label>{tr("EmailAddressTxt")}</label><input className="text-input" type="email" autoComplete="email" inputMode="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
    <div className="field invite-field"><label>{tr("PasswordTxt")}</label><input className="text-input" type="password" autoComplete={existing?'current-password':'new-password'} minLength={8} value={password} onChange={e=>setPassword(e.target.value)} required/><small>{tr("AtLeast8CharactersTxt")}</small></div>
    {message&&<div className="notice invite-message">{message}</div>}
    <button className="btn primary invite-main-action" disabled={busy}>{busy?tr("ConnectingTxt"):existing?tr("SignInAndJoinMyFamilyTxt"):tr("CreateAccountAndJoinTxt")}</button>
    <div className="invite-privacy"><ShieldCheck size={17}/><span>{tr("AfterJoiningWeLlOpenTheSimpleTxt")}</span></div>
   </form>}
 </section></main>
}
