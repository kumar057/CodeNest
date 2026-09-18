"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    if (!email || !password || (mode === "register" && !name)) {
      setMessage("Please fill in all required fields.");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        setMessage("Account created. Check your email if confirmation is enabled, then sign in.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = "/";
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed. Check your Supabase settings.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-noise" />
      <div className="auth-glow auth-glow-a" />
      <div className="auth-glow auth-glow-b" />

      <div className="auth-stage" aria-hidden="true">
        <div className="auth-orbit auth-orbit-1" />
        <div className="auth-orbit auth-orbit-2" />
        <div className="auth-orbit auth-orbit-3" />
        <div className="auth-core">
          <div className="core-face core-front">⌘</div>
          <div className="core-face core-back">&lt;/&gt;</div>
          <div className="core-face core-right">PY</div>
          <div className="core-face core-left">SQL</div>
          <div className="core-face core-top">AI</div>
          <div className="core-face core-bottom">JS</div>
        </div>
        <span className="code-particle p1">const learn = true;</span>
        <span className="code-particle p2">SELECT * FROM skills;</span>
        <span className="code-particle p3">print("hello")</span>
      </div>

      <section className="auth-card">
        <Link href="/" className="auth-brand">
          <span className="auth-logo">⌘</span>
          <span>CodeNest</span>
        </Link>

        <div className="auth-heading">
          <span className="auth-kicker">YOUR AI CODING SPACE</span>
          <h1>{mode === "login" ? "Welcome back." : "Create your account."}</h1>
          <p>{mode === "login" ? "Continue your coding journey, one question at a time." : "Save your learning progress and build your skills with CodeNest."}</p>
        </div>

        <div className="auth-switch">
          <button className={mode === "login" ? "selected" : ""} onClick={() => { setMode("login"); setMessage(""); }}>Log in</button>
          <button className={mode === "register" ? "selected" : ""} onClick={() => { setMode("register"); setMessage(""); }}>Register</button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {mode === "register" && (
            <label>Full name
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Praveen Kumar" autoComplete="name" />
            </label>
          )}
          <label>Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
          </label>
          <label>Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 characters" minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} />
          </label>
          <button className="auth-submit" disabled={busy}>
            <span>{busy ? "Please wait..." : mode === "login" ? "Enter CodeNest" : "Create my account"}</span>
            {!busy && <b>→</b>}
          </button>
        </form>

        {message && <div className={message.toLowerCase().includes("created") ? "auth-message success" : "auth-message"}>{message}</div>}

        <div className="auth-or"><span>or</span></div>
        <Link href="/" className="auth-guest">Continue without an account</Link>
        <p className="auth-foot">By continuing, you agree to use CodeNest responsibly while learning.</p>
      </section>
    </main>
  );
}
