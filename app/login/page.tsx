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
        <div className="scene-stars"><i/><i/><i/><i/><i/><i/><i/><i/></div>
        <div className="scene-ring ring-a" />
        <div className="scene-ring ring-b" />
        <div className="scene-ring ring-c" />
        <div className="scene-core">
          <div className="core-shadow" />
          <div className="holo-cube">
            <span className="cube-face f-front">⌘</span>
            <span className="cube-face f-back">&lt;/&gt;</span>
            <span className="cube-face f-right">PY</span>
            <span className="cube-face f-left">SQL</span>
            <span className="cube-face f-top">AI</span>
            <span className="cube-face f-bottom">JS</span>
          </div>
          <div className="energy-orbit orbit-x"><b>AI</b></div>
          <div className="energy-orbit orbit-y"><b>PY</b></div>
        </div>
        <div className="floating-panel panel-a"><small>LEARN</small><strong>Python</strong><em>01</em></div>
        <div className="floating-panel panel-b"><small>QUERY</small><strong>SELECT *</strong><em>SQL</em></div>
        <div className="floating-panel panel-c"><small>BUILD</small><strong>AI / ML</strong><em>06</em></div>
        <div className="code-stream stream-a">const learn = true;</div>
        <div className="code-stream stream-b">model.fit(data)</div>
        <div className="code-stream stream-c">print("hello")</div>
        <div className="scene-label"><span className="live-dot"/>AI CODING CORE</div>
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
