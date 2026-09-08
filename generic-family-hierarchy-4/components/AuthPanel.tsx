"use client";
import {useLanguage} from "../lib/i18n";
import { useEffect,useState } from "react";
import { ArrowLeft,ArrowRight,Eye,EyeOff,Heart,KeyRound,Mail,ShieldCheck } from "lucide-react";
import { requestPasswordReset,resendSignupConfirmation,signIn,signUp,updatePassword } from "../lib/auth";

type AuthMode="signin"|"signup"|"forgot"|"reset";
export default function AuthPanel({ onDone, initialMode="signin", onResetDone }: { onDone: () => void; initialMode?:AuthMode; onResetDone?:()=>void }) {
 const {t:tr}=useLanguage();
  const [mode,setMode]=useState<AuthMode>(initialMode),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[confirmPassword,setConfirmPassword]=useState(""),[name,setName]=useState(""),[message,setMessage]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false),[showPassword,setShowPassword]=useState(false),[confirmationPending,setConfirmationPending]=useState(false);
  useEffect(()=>setMode(initialMode),[initialMode]);
  const clear=()=>{setError("");setMessage("")};
  const submit=async(event:React.FormEvent)=>{
    event.preventDefault();clear();setBusy(true);
    try{
      if(mode==="signin"){
        await signIn(email,password);onDone();
      }else if(mode==="signup"){
        const result=await signUp(email,password,name);
        if(!result.session){setConfirmationPending(true);setMessage(tr("YourAccountIsReadyCheckYourEmailTxt"));return;}
        onDone();
      }else if(mode==="forgot"){
        await requestPasswordReset(email);
        setMessage(tr("PasswordResetEmailSentOpenTheLinkTxt"));
      }else{
        if(password.length<8)throw new Error("Use at least 8 characters for your new password.");
        if(password!==confirmPassword)throw new Error("The two passwords do not match.");
        await updatePassword(password);
        setMessage(tr("YourPasswordHasBeenChangedYouCanTxt"));
        onResetDone?.();
      }
    }catch(exception:any){
      const raw=String(exception?.message||"");
      if(/invalid login credentials/i.test(raw))setError(tr("ThatEmailAndPasswordDidNotMatchTxt"));
      else if(/email not confirmed/i.test(raw))setError(tr("PleaseConfirmYourEmailFirstCheckYourTxt"));
      else setError(raw||"We could not complete that request. Please try again.");
    }finally{setBusy(false)}
  };
  const resend=async()=>{clear();setBusy(true);try{await resendSignupConfirmation(email);setMessage(tr("ConfirmationEmailSentAgainPleaseCheckYourTxt"));}catch(e:any){setError(e.message||"Could not resend the confirmation email.");}finally{setBusy(false)}};
  const resetTitle=mode==="reset";
  return <div className="modal-overlay"><form className="modal auth-modal family-auth" data-testid="qa-auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title" onSubmit={submit}>
    <span className="warm-kicker"><Heart size={13} fill="currentColor" /> {mode==="signin"?tr("WelcomeBackTxt"):mode==="signup"?tr("JoinYourFamilyTxt"):mode==="forgot"?tr("AccountHelpTxt"):tr("ChooseANewPasswordTxt")}</span>
    <h2 id="auth-title">{mode==="signin"?tr("ContinueToYourFamilyTxt"):mode==="signup"?tr("CreateYourFamilyAccountTxt"):mode==="forgot"?tr("ForgotYourPasswordTxt"):tr("ResetYourPasswordTxt")}</h2>
    <p className="page-subtitle">{mode==="signin"?tr("UseTheEmailAddressConnectedToYourTxt"):mode==="signup"?tr("CreateYourAccountThenFindAndConnectTxt"):mode==="forgot"?tr("EnterYourEmailAndWeLlSendTxt"):tr("CreateANewPasswordForYourFamilyTxt")}</p>
    {mode==="signup"&&<div className="field"><label htmlFor="auth-name">{tr("YourNameTxt")}</label><input id="auth-name" className="text-input" value={name} onChange={e=>setName(e.target.value)} placeholder={tr("FullNameTxt")} required /></div>}
    {mode!=="reset"&&<div className="field"><label htmlFor="auth-email">{tr("EmailAddressTxt")}</label><input id="auth-email" data-testid="qa-auth-email" className="text-input" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={tr("YouExampleComTxt")} required /></div>}
    {(mode==="signin"||mode==="signup"||mode==="reset")&&<div className="field"><label htmlFor="auth-password">{resetTitle?tr("NewPasswordTxt"):tr("PasswordTxt")}</label><div className="password-field"><input id="auth-password" data-testid="qa-auth-password" className="text-input" type={showPassword?"text":"password"} autoComplete={resetTitle?"new-password":mode==="signin"?"current-password":"new-password"} minLength={8} value={password} onChange={e=>setPassword(e.target.value)} placeholder={tr("AtLeast8Characters2Txt")} required /><button type="button" className="password-toggle" aria-label={showPassword?"Hide password":"Show password"} onClick={()=>setShowPassword(v=>!v)}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></div>}
    {mode==="reset"&&<div className="field"><label htmlFor="auth-confirm-password">{tr("ConfirmNewPasswordTxt")}</label><input id="auth-confirm-password" className="text-input" type={showPassword?"text":"password"} autoComplete="new-password" minLength={8} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder={tr("TypeItAgainTxt")} required /></div>}
    {mode!=="forgot"&&<div className="auth-assurance"><ShieldCheck size={16}/> {tr("YourPrivateFamilyInformationRemainsProtectedTxt")}</div>}
    {error&&<div className="notice error-notice">{error}</div>}
    {message&&<div className="notice success-notice">{message}</div>}
    <button className="btn primary auth-submit" data-testid="qa-auth-submit" disabled={busy}>{busy?tr("PleaseWaitTxt"):<>{mode==="signin"?tr("SignInTxt"):mode==="signup"?tr("CreateAccountTxt"):mode==="forgot"?tr("SendResetEmailTxt"):tr("SaveNewPasswordTxt")}{mode==="forgot"?<Mail size={16}/>:mode==="reset"?<KeyRound size={16}/>:<ArrowRight size={16}/>}</>}</button>
    {mode==="signin"&&<><button type="button" className="auth-link" onClick={()=>{clear();setMode("forgot")}}>{tr("ForgotPasswordTxt")}</button><button type="button" className="auth-switch" onClick={()=>{clear();setMode("signup")}}>{tr("NewHereCreateYourAccountTxt")}</button></>}
    {mode==="signup"&&<><button type="button" className="auth-switch" onClick={()=>{clear();setMode("signin")}}>{tr("AlreadyHaveAnAccountSignInTxt")}</button>{confirmationPending&&<button type="button" className="auth-link" disabled={busy} onClick={resend}>{tr("ResendConfirmationEmailTxt")}</button>}</>}
    {mode==="forgot"&&<button type="button" className="auth-switch" onClick={()=>{clear();setMode("signin")}}><ArrowLeft size={14}/> {tr("BackToSignInTxt")}</button>}
  </form></div>;
}
