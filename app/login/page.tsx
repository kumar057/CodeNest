"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setMessage("Enter your email and password to continue.");
      return;
    }
    localStorage.setItem("codenest-user", email);
    setMessage("Login saved on this device. Welcome to CodeNest!");
    setTimeout(() => (window.location.href = "/"), 700);
  }

  return (
    <main className="login-page">
      <div className="login-orb orb-one" />
      <div className="login-orb orb-two" />
      <div className="login-grid" />
      <div className="login-scene" aria-hidden="true">
        <div className="cube">
          <span>⌘</span>
          <span>&lt;/&gt;</span>
          <span>01</span>
          <span>AI</span>
          <span>SQL</span>
          <span>PY</span>
        </div>
        <div className="orbit orbit-a" />
        <div className="orbit orbit-b" />
      </div>

      <section className="login-card">
        <Link href="/" className="login-brand">
          <span className="brand-mark">⌘</span>
          <span>CodeNest</span>
        </Link>
        <div className="login-copy">
          <span className="eyebrow">AI CODING TUTOR</span>
          <h1>Welcome back.</h1>
          <p>Sign in and continue learning Python, SQL, Java and more.</p>
        </div>

        <form onSubmit={submit} className="login-form">
          <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" /></label>
          <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" /></label>
          <button className="login-submit" type="submit">Continue <span>→</span></button>
        </form>

        {message && <p className="login-message">{message}</p>}
        <div className="login-divider"><span>or</span></div>
        <Link href="/" className="guest-button">Continue as guest</Link>
        <p className="login-note">Your CodeNest learning session stays in this browser.</p>
      </section>
    </main>
  );
}
