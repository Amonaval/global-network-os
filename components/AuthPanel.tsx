"use client";
import { useState } from "react";
import { ArrowRight, Heart, ShieldCheck } from "lucide-react";
import { signIn, signUp } from "../lib/auth";

export default function AuthPanel({ onDone }: { onDone: () => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      if (mode === "signin") await signIn(email, password);
      else { const result = await signUp(email, password, name); if (!result.session) { setError("Your account is ready. Please check your email to confirm it, then return here to sign in."); return; } }
      onDone();
    } catch (exception: any) { setError(exception.message || "We could not sign you in. Please check your details and try again."); }
    finally { setBusy(false); }
  };
  return <div className="modal-overlay"><form className="modal auth-modal family-auth" role="dialog" aria-modal="true" aria-labelledby="auth-title" onSubmit={submit}>
    <span className="warm-kicker"><Heart size={13} fill="currentColor" /> {mode === "signin" ? "Welcome back" : "Join your family"}</span>
    <h2 id="auth-title">{mode === "signin" ? "Continue to your family" : "Create your family account"}</h2>
    <p className="page-subtitle">{mode === "signin" ? "Use the email address connected to your invitation or family profile." : "Create your account, then find and connect your existing family profile."}</p>
    {mode === "signup" && <div className="field"><label htmlFor="auth-name">Your name</label><input id="auth-name" className="text-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" required /></div>}
    <div className="field"><label htmlFor="auth-email">Email address</label><input id="auth-email" className="text-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></div>
    <div className="field"><label htmlFor="auth-password">Password</label><input id="auth-password" className="text-input" type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" required /></div>
    <div className="auth-assurance"><ShieldCheck size={16} /> Your private family information remains protected.</div>
    {error && <div className="notice">{error}</div>}
    <button className="btn primary auth-submit" disabled={busy}>{busy ? "Please wait…" : <>{mode === "signin" ? "Sign in" : "Create account"}<ArrowRight size={16} /></>}</button>
    <button type="button" className="auth-switch" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>{mode === "signin" ? "New here? Create your account" : "Already have an account? Sign in"}</button>
  </form></div>;
}
