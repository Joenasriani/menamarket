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
    setSubmitting(true);
    setResult("");
    try {
      const response = await fetch("/api/public/auth/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password, displayName: displayName || undefined })
      });
      const data = await response.json() as { actor?: { username: string }, message?: string };
      if (!response.ok) throw new Error(data.message ?? "Signup failed.");
      setResult(`Created actor ${data.actor?.username ?? username}`);
    } catch (error) {
      setResult(error instanceof Error ? error.message : "Signup failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="section stack" style={{ maxWidth: 560, margin: "0 auto" }}>
      <PageHeader eyebrow="Actor signup" title="Create an actor account" description="This account layer is local-first and lightweight, preparing future order and portfolio flows." />
      <Card title="Signup" eyebrow="Public session">
        <form onSubmit={onSubmit} className="stack">
          <label className="stack">
            <span>Username</span>
            <input style={fieldStyle} value={username} onChange={(event) => setUsername(event.target.value)} />
          </label>
          <label className="stack">
            <span>Display name</span>
            <input style={fieldStyle} value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
          </label>
          <label className="stack">
            <span>Password</span>
            <input type="password" style={fieldStyle} value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <div className="inline">
            <Badge tone="warning">Min password: 8 chars</Badge>
            <a href="/login">Already have an account? →</a>
          </div>
          <Button>{submitting ? "Creating..." : "Create account"}</Button>
          {result ? <div style={{ color: result.startsWith("Created actor") ? "#8ce6d6" : "#ffb2b2" }}>{result}</div> : null}
        </form>
      </Card>
    </div>
  );
}
