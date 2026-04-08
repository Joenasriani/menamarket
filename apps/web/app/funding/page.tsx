"use client";

import { Card, PageHeader } from "@menamarket/ui";
import { PreviewNotice } from "../preview-notice";

/**
 * Funding page — public preview mode.
 *
 * Funding and payout features are disabled in the current public preview.
 * The page explains what will be available and does not expose any actionable forms.
 */
export default function FundingPage() {
  return (
    <div className="section stack">
      <PageHeader
        eyebrow="Funding"
        title="Account funding"
        description="Fund your account to place orders and manage positions on MENA prediction markets."
      />

      <PreviewNotice message="Funding and payouts are not available in the current public preview. This feature will be enabled once user accounts and payment rails are live." />

      <div className="card-grid">
        <Card title="Deposit funds" eyebrow="Coming soon">
          Fund your MENAMarket account via supported payment rails. Available once user accounts are live.
        </Card>
        <Card title="Withdraw funds" eyebrow="Coming soon">
          Request payouts to your bank account or supported wallets. Available once user accounts are live.
        </Card>
        <Card title="Supported rails" eyebrow="Planned">
          Bank transfer, crypto wallets, and regional payment providers for the MENA region.
        </Card>
      </div>

      <Card title="What happens next?" eyebrow="Roadmap">
        <div className="stack" style={{ gap: 12, color: "#94a9c0" }}>
          <div>1. User account creation and authentication will be activated first.</div>
          <div>2. Payment rail integration (bank transfer, crypto) will follow.</div>
          <div>3. Funding intents and payout requests will be routed through verified channels.</div>
          <div style={{ marginTop: 4 }}>
            <a href="/about" style={{ color: "#8ce6d6" }}>Learn more about MENAMarket →</a>
          </div>
        </div>
      </Card>
    </div>
  );
}

