"use client";
import { useEffect,useState } from "react";
import { ArrowLeft,ArrowRight,Eye,EyeOff,Heart,KeyRound,Mail,ShieldCheck } from "lucide-react";
import { requestPasswordReset,resendSignupConfirmation,signIn,signUp,updatePassword } from "../lib/auth";

type AuthMode="signin"|"signup"|"forgot"|"reset";
export default function AuthPanel({ onDone, initialMode="signin", onResetDone }: { onDone: () => void; initialMode?:AuthMode; onResetDone?:()=>void }) {
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
        if(!result.session){setConfirmationPending(true);setMessage("Your account is ready. Check your email and tap the confirmation link, then return here to sign in.");return;}
        onDone();
      }else if(mode==="forgot"){
        await requestPasswordReset(email);
        setMessage("Password reset email sent. Open the link in that email on this device, then choose your new password here.");
      }else{
        if(password.length<8)throw new Error("Use at least 8 characters for your new password.");
        if(password!==confirmPassword)throw new Error("The two passwords do not match.");
        await updatePassword(password);
        setMessage("Your password has been changed. You can continue to your family now.");
        onResetDone?.();
      }
    }catch(exception:any){
      const raw=String(exception?.message||"");
      if(/invalid login credentials/i.test(raw))setError("That email and password did not match. Try again or reset your password.");
      else if(/email not confirmed/i.test(raw))setError("Please confirm your email first. Check your inbox for the Family Network confirmation message.");
      else setError(raw||"We could not complete that request. Please try again.");
    }finally{setBusy(false)}
  };
  const resend=async()=>{clear();setBusy(true);try{await resendSignupConfirmation(email);setMessage("Confirmation email sent again. Please check your inbox and spam folder.");}catch(e:any){setError(e.message||"Could not resend the confirmation email.");}finally{setBusy(false)}};
  const resetTitle=mode==="reset";
  return <div className="modal-overlay"><form className="modal auth-modal family-auth" role="dialog" aria-modal="true" aria-labelledby="auth-title" onSubmit={submit}>
    <span className="warm-kicker"><Heart size={13} fill="currentColor" /> {mode==="signin"?"Welcome back":mode==="signup"?"Join your family":mode==="forgot"?"Account help":"Choose a new password"}</span>
    <h2 id="auth-title">{mode==="signin"?"Continue to your family":mode==="signup"?"Create your family account":mode==="forgot"?"Forgot your password?":"Reset your password"}</h2>
    <p className="page-subtitle">{mode==="signin"?"Use the email address connected to your invitation or family profile.":mode==="signup"?"Create your account, then find and connect your existing family profile.":mode==="forgot"?"Enter your email and we’ll send a private password-reset link.":"Create a new password for your Family Network account."}</p>
    {mode==="signup"&&<div className="field"><label htmlFor="auth-name">Your name</label><input id="auth-name" className="text-input" value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" required /></div>}
    {mode!=="reset"&&<div className="field"><label htmlFor="auth-email">Email address</label><input id="auth-email" className="text-input" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required /></div>}
    {(mode==="signin"||mode==="signup"||mode==="reset")&&<div className="field"><label htmlFor="auth-password">{resetTitle?"New password":"Password"}</label><div className="password-field"><input id="auth-password" className="text-input" type={showPassword?"text":"password"} autoComplete={resetTitle?"new-password":mode==="signin"?"current-password":"new-password"} minLength={8} value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters" required /><button type="button" className="password-toggle" aria-label={showPassword?"Hide password":"Show password"} onClick={()=>setShowPassword(v=>!v)}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></div>}
    {mode==="reset"&&<div className="field"><label htmlFor="auth-confirm-password">Confirm new password</label><input id="auth-confirm-password" className="text-input" type={showPassword?"text":"password"} autoComplete="new-password" minLength={8} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Type it again" required /></div>}
    {mode!=="forgot"&&<div className="auth-assurance"><ShieldCheck size={16}/> Your private family information remains protected.</div>}
    {error&&<div className="notice error-notice">{error}</div>}
    {message&&<div className="notice success-notice">{message}</div>}
    <button className="btn primary auth-submit" disabled={busy}>{busy?"Please wait…":<>{mode==="signin"?"Sign in":mode==="signup"?"Create account":mode==="forgot"?"Send reset email":"Save new password"}{mode==="forgot"?<Mail size={16}/>:mode==="reset"?<KeyRound size={16}/>:<ArrowRight size={16}/>}</>}</button>
    {mode==="signin"&&<><button type="button" className="auth-link" onClick={()=>{clear();setMode("forgot")}}>Forgot password?</button><button type="button" className="auth-switch" onClick={()=>{clear();setMode("signup")}}>New here? Create your account</button></>}
    {mode==="signup"&&<><button type="button" className="auth-switch" onClick={()=>{clear();setMode("signin")}}>Already have an account? Sign in</button>{confirmationPending&&<button type="button" className="auth-link" disabled={busy} onClick={resend}>Resend confirmation email</button>}</>}
    {mode==="forgot"&&<button type="button" className="auth-switch" onClick={()=>{clear();setMode("signin")}}><ArrowLeft size={14}/> Back to sign in</button>}
  </form></div>;
}
