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

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!username.trim() || username.trim().length < 3) {
      setResult("Username must be at least 3 characters.");
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username.trim())) {
      setResult("Username may only contain letters, numbers, underscores, and dashes.");
      return;
    }
    if (!password || password.length < 8) {
      setResult("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    setResult("");
    try {
      const response = await fetch("/api/public/auth/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password, displayName: displayName.trim() || undefined })
      });
      const data = await response.json() as { actor?: { username: string }, message?: string };
      if (!response.ok) throw new Error(data.message ?? "Signup failed.");
      setResult(`Account created! Redirecting to your portfolio…`);
      setTimeout(() => {
        window.location.href = "/portfolio";
      }, 800);
    } catch (error) {
      setResult(error instanceof Error ? error.message : "Signup failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="section stack" style={{ maxWidth: 560, margin: "0 auto" }}>
      <PageHeader eyebrow="Actor signup" title="Create an actor account" description="Create your account to place orders, track positions, and interact with MENA prediction markets." />
      <Card title="Signup" eyebrow="Public session">
        <form onSubmit={onSubmit} className="stack">
          <label className="stack">
            <span>Username</span>
            <input style={fieldStyle} value={username} onChange={(event) => setUsername(event.target.value)} required minLength={3} pattern="[a-zA-Z0-9_-]+" autoComplete="username" />
          </label>
          <label className="stack">
            <span>Display name <span style={{ color: "#94a9c0" }}>(optional)</span></span>
            <input style={fieldStyle} value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="name" />
          </label>
          <label className="stack">
            <span>Password</span>
            <input type="password" style={fieldStyle} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete="new-password" />
          </label>
          <div className="inline">
            <Badge tone="warning">Min password: 8 chars</Badge>
            <a href="/login">Already have an account? →</a>
          </div>
          <Button disabled={submitting}>{submitting ? "Creating…" : "Create account"}</Button>
          {result ? <div style={{ color: result.startsWith("Account created") ? "#8ce6d6" : "#ffb2b2" }}>{result}</div> : null}
        </form>
      </Card>
    </div>
  );
}
