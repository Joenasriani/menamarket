"use client";

import { useState } from "react";
import { Badge, Button, Card, PageHeader } from "@menamarket/ui";
import { createBrowserSupabaseClient } from "../lib/supabase/client";

const fieldStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(125, 161, 196, 0.18)",
  background: "rgba(255,255,255,0.03)",
  color: "#edf3fb"
};

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [result, setResult] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) {
      setResult("Email is required.");
      return;
    }
    if (!password || password.length < 8) {
      setResult("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setResult("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    setResult("");
    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw new Error(error.message);

      if (data.session) {
        // Auto-confirmed (email confirmation disabled in Supabase dashboard)
        const access_token = data.session.access_token;
        const response = await fetch("/api/public/auth/signup", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ access_token })
        });
        const json = await response.json() as { actor?: { username: string }; message?: string };
        if (!response.ok) throw new Error(json.message ?? "Signup failed.");
        setResult(`Account created! Welcome, ${json.actor?.username ?? email}. Redirecting…`);
        window.location.href = "/portfolio";
      } else {
        // Email confirmation required — user must click the link in their inbox
        setAwaitingConfirmation(true);
        setResult("Account created! Please check your email to confirm your account.");
      }
    } catch (error) {
      setResult(error instanceof Error ? error.message : "Signup failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="section stack" style={{ maxWidth: 560, margin: "0 auto" }}>
      <PageHeader eyebrow="Create account" title="Create your MENAMarket account" description="Sign up with your email to place orders, track positions, and interact with MENA prediction markets." />
      <Card title="Sign up" eyebrow="Supabase Auth">
        {awaitingConfirmation ? (
          <div className="stack">
            <div style={{ color: "#8ce6d6", lineHeight: 1.6 }}>
              A confirmation email has been sent to <strong>{email}</strong>. Click the link in the email to activate your account and sign in.
            </div>
            <a href="/login">Back to login →</a>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="stack">
            <label className="stack">
              <span>Email</span>
              <input type="email" style={fieldStyle} value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
            </label>
            <label className="stack">
              <span>Password</span>
              <input type="password" style={fieldStyle} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete="new-password" />
            </label>
            <label className="stack">
              <span>Confirm password</span>
              <input type="password" style={fieldStyle} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={8} autoComplete="new-password" />
            </label>
            <div className="inline">
              <Badge tone="warning">Min password: 8 chars</Badge>
              <a href="/login">Already have an account? →</a>
            </div>
            <Button disabled={submitting}>{submitting ? "Creating account…" : "Create account"}</Button>
            {result ? <div style={{ color: result.startsWith("Account created") ? "#8ce6d6" : "#ffb2b2" }}>{result}</div> : null}
          </form>
        )}
      </Card>
    </div>
  );
}
