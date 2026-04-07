"use client";

import { useEffect, useState } from "react";
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

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [result, setResult] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
        setTimedOut(false);
      }
    });

    const timeout = setTimeout(() => {
      setTimedOut(true);
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(error.message);
      setDone(true);
      setResult("Password updated successfully. You can now sign in with your new password.");
    } catch (error) {
      setResult(error instanceof Error ? error.message : "Failed to update password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="section stack" style={{ maxWidth: 560, margin: "0 auto" }}>
      <PageHeader eyebrow="Password reset" title="Set a new password" description="Enter and confirm your new password below." />
      <Card title="New password" eyebrow="Supabase Auth">
        {done ? (
          <div className="stack">
            <div style={{ color: "#8ce6d6", lineHeight: 1.6 }}>{result}</div>
            <a href="/login">Sign in with new password →</a>
          </div>
        ) : !ready ? (
          <div className="stack">
            {timedOut ? (
              <div style={{ color: "#ffb2b2", lineHeight: 1.6 }}>
                Your reset link could not be verified. This can happen if the link has expired, was already used, or was not opened in the same browser.{" "}
                <a href="/forgot-password">Request a new reset link →</a>
              </div>
            ) : (
              <>
                <div style={{ color: "#94a9c0" }}>Verifying your reset link…</div>
                <div style={{ color: "#94a9c0", fontSize: 14 }}>
                  Make sure you clicked the link directly from your email.
                </div>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={onSubmit} className="stack">
            <label className="stack">
              <span>New password</span>
              <input type="password" style={fieldStyle} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete="new-password" />
            </label>
            <label className="stack">
              <span>Confirm new password</span>
              <input type="password" style={fieldStyle} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={8} autoComplete="new-password" />
            </label>
            <Button disabled={submitting}>{submitting ? "Updating…" : "Update password"}</Button>
            {result ? <div style={{ color: "#ffb2b2" }}>{result}</div> : null}
          </form>
        )}
      </Card>
    </div>
  );
}
