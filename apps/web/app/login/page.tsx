"use client";

import { useState } from "react";
import { Badge, Button, Card, PageHeader } from "@menamarket/ui";

const fieldStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(125, 161, 196, 0.18)",
  background: "rgba(255,255,255,0.03)",
  color: "#edf3fb"
};

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!username.trim() || username.trim().length < 3) {
      setResult("Username must be at least 3 characters.");
      return;
    }
    if (!password || password.length < 8) {
      setResult("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    setResult("");
    try {
      const response = await fetch("/api/public/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password })
      });
      const data = await response.json() as { actor?: { username: string }, message?: string };
      if (!response.ok) throw new Error(data.message ?? "Login failed.");
      setResult(`Signed in as ${data.actor?.username ?? username}. Redirecting…`);
      setTimeout(() => {
        window.location.href = "/portfolio";
      }, 800);
    } catch (error) {
      setResult(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="section stack" style={{ maxWidth: 560, margin: "0 auto" }}>
      <PageHeader eyebrow="Actor login" title="Sign in to your actor account" description="Sign in with your actor credentials to access your portfolio, place orders, and manage your account." />
      <Card title="Login" eyebrow="Public session">
        <form onSubmit={onSubmit} className="stack">
          <label className="stack">
            <span>Username</span>
            <input style={fieldStyle} value={username} onChange={(event) => setUsername(event.target.value)} required minLength={3} autoComplete="username" />
          </label>
          <label className="stack">
            <span>Password</span>
            <input type="password" style={fieldStyle} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete="current-password" />
          </label>
          <div className="inline">
            <Badge tone="accent">Actor session</Badge>
            <a href="/signup">Create account →</a>
          </div>
          <Button disabled={submitting}>{submitting ? "Signing in…" : "Sign in"}</Button>
          {result ? <div style={{ color: result.startsWith("Signed in") ? "#8ce6d6" : "#ffb2b2" }}>{result}</div> : null}
        </form>
      </Card>
    </div>
  );
}
