"use client";

import { useMemo, useState } from "react";
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
  const [result, setResult] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const nextPath = useMemo(() => {
    if (typeof window === "undefined") return "/";
    const url = new URL(window.location.href);
    return url.searchParams.get("next") || "/";
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setResult("");
    try {
      const response = await fetch("/api/admin-auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password, next: nextPath })
      });
      const data = await response.json() as { redirectTo?: string; message?: string };
      if (!response.ok) {
        throw new Error(data.message ?? "Login failed.");
      }
      window.location.href = data.redirectTo ?? "/";
    } catch (error) {
      setResult(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="stack" style={{ maxWidth: 560, margin: "48px auto" }}>
      <PageHeader
        eyebrow="Admin login"
        title="Protected internal access"
        description="Admin routes and admin APIs are now protected by a server-side session cookie gate."
      />
      <Card title="Sign in" eyebrow="Environment-backed credentials">
        <form onSubmit={onSubmit} className="stack">
          <label className="stack">
            <span>Username</span>
            <input style={fieldStyle} value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" />
          </label>
          <label className="stack">
            <span>Password</span>
            <input style={fieldStyle} type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
          </label>
          <div className="inline" style={{ justifyContent: "space-between" }}>
            <Badge tone="warning">Admin routes only</Badge>
            <Badge>Next: {nextPath}</Badge>
          </div>
          <Button>{submitting ? "Signing in..." : "Sign in"}</Button>
          {result ? <div style={{ color: "#ffb2b2" }}>{result}</div> : null}
        </form>
      </Card>
    </div>
  );
}
