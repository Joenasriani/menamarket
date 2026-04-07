"use client";

import { useState } from "react";
import { Button, Card, PageHeader } from "@menamarket/ui";

export default function AdminHomePage() {
  const [message, setMessage] = useState("");

  async function logout() {
    const response = await fetch("/api/admin-auth/logout", { method: "POST" });
    if (response.ok) {
      window.location.href = "/login";
      return;
    }
    setMessage("Logout failed.");
  }

  return (
    <div className="stack">
      <PageHeader eyebrow="Admin" title="Protected operations shell" description="Internal surfaces now require an authenticated admin session." />
      <div className="card-grid">
        <Card title="Session guard" eyebrow="Active">Protected routes are gated by middleware and a signed HTTP-only cookie.</Card>
        <Card title="Credentials" eyebrow="Environment">Login credentials are sourced from environment variables, not hardcoded files.</Card>
        <Card title="Next step" eyebrow="Security">Role granularity and stronger session expiry can be layered later.</Card>
      </div>
      <div className="inline">
        <Button onClick={logout} variant="secondary">Sign out</Button>
        {message ? <span style={{ color: "#ffb2b2" }}>{message}</span> : null}
      </div>
    </div>
  );
}
