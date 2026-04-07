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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
    setSubmitting(true);
    setResult("");
    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw new Error(error.message);

      const access_token = data.session?.access_token;
      if (!access_token) throw new Error("No session returned from sign-in.");

      const response = await fetch("/api/public/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ access_token })
      });
      const json = await response.json() as { actor?: { username: string }; message?: string };
      if (!response.ok) throw new Error(json.message ?? "Login failed.");

      setResult(`Signed in as ${json.actor?.username ?? email}. Redirecting…`);
      window.location.href = "/portfolio";
    } catch (error) {
      setResult(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="section stack" style={{ maxWidth: 560, margin: "0 auto" }}>
      <PageHeader eyebrow="Sign in" title="Sign in to your account" description="Sign in with your email and password to access your portfolio, place orders, and manage your account." />
      <Card title="Login" eyebrow="Supabase Auth">
        <form onSubmit={onSubmit} className="stack">
          <label className="stack">
            <span>Email</span>
            <input type="email" style={fieldStyle} value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
          </label>
          <label className="stack">
            <span>Password</span>
            <input type="password" style={fieldStyle} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete="current-password" />
          </label>
          <div className="inline">
            <Badge tone="accent">Supabase Auth</Badge>
            <a href="/forgot-password">Forgot password? →</a>
            <a href="/signup">Create account →</a>
          </div>
          <Button disabled={submitting}>{submitting ? "Signing in…" : "Sign in"}</Button>
          {result ? <div style={{ color: result.startsWith("Signed in") ? "#8ce6d6" : "#ffb2b2" }}>{result}</div> : null}
        </form>
      </Card>
    </div>
  );
}
