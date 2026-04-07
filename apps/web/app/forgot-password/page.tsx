"use client";

import { useState } from "react";
import { Button, Card, PageHeader } from "@menamarket/ui";
import { createBrowserSupabaseClient } from "../lib/supabase/client";

const fieldStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(125, 161, 196, 0.18)",
  background: "rgba(255,255,255,0.03)",
  color: "#edf3fb"
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) {
      setResult("Email is required.");
      return;
    }
    setSubmitting(true);
    setResult("");
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`
      });
      if (error) throw new Error(error.message);
      setSent(true);
      setResult(`Password reset email sent to ${email}. Check your inbox.`);
    } catch (error) {
      setResult(error instanceof Error ? error.message : "Failed to send reset email.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="section stack" style={{ maxWidth: 560, margin: "0 auto" }}>
      <PageHeader eyebrow="Password reset" title="Forgot your password?" description="Enter your email address and we will send you a link to reset your password." />
      <Card title="Reset password" eyebrow="Supabase Auth">
        {sent ? (
          <div className="stack">
            <div style={{ color: "#8ce6d6", lineHeight: 1.6 }}>{result}</div>
            <a href="/login">Back to login →</a>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="stack">
            <label className="stack">
              <span>Email</span>
              <input type="email" style={fieldStyle} value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
            </label>
            <div className="inline">
              <a href="/login">Back to login →</a>
            </div>
            <Button disabled={submitting}>{submitting ? "Sending…" : "Send reset link"}</Button>
            {result && !sent ? <div style={{ color: "#ffb2b2" }}>{result}</div> : null}
          </form>
        )}
      </Card>
    </div>
  );
}
