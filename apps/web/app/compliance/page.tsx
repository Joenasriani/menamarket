import { Badge, Card, PageHeader } from "@menamarket/ui";

const operationalConstraints = [
  { title: "Jurisdiction tracking", description: "Every market is tagged with an ISO jurisdiction code. Markets are only visible in regions where they are permitted to operate." },
  { title: "Resolution source required", description: "Markets must declare an authoritative resolution source and evidence standard before publication. No ambiguous resolution criteria." },
  { title: "Market rules mandatory", description: "Clear rules for edge cases, partial outcomes, and timing disputes are required fields — not optional metadata." },
  { title: "Audit trail for all operations", description: "Every admin action — market creation, publishing, lifecycle transitions, resolution — is durably logged with timestamps and metadata." }
];

const financialConstraints = [
  { title: "No fabricated balances", description: "Account balances reflect real ledger entries only. No synthetic display balances or demo funds." },
  { title: "Validated order matching", description: "Orders match through a price-priority engine with fills recorded in the ledger. No simulated fills." },
  { title: "Settlement integrity", description: "Market settlements pay out based on resolution outcomes and verified position records. No manual overrides without audit." },
  { title: "Controlled funding rails", description: "Funding and payout requests are captured through controlled rails with status tracking. No direct balance manipulation." }
];

export default function CompliancePage() {
  return (
    <div className="section stack">
      <PageHeader eyebrow="Compliance" title="Control-first platform design" description="MENAMarket is built as an operational system with compliance, auditability, and integrity wired into the foundation — not added as an afterthought." />

      <section>
        <h2 style={{margin: "0 0 16px"}}>Operational constraints</h2>
        <div className="card-grid">
          {operationalConstraints.map((item) => (
            <Card key={item.title} title={item.title} eyebrow="Required">
              {item.description}
              <div style={{marginTop: 12}}><Badge tone="warning">Enforced</Badge></div>
            </Card>
          ))}
        </div>
      </section>

      <section className="section-gap">
        <h2 style={{margin: "0 0 16px"}}>Financial controls</h2>
        <div className="card-grid">
          {financialConstraints.map((item) => (
            <Card key={item.title} title={item.title} eyebrow="Required">
              {item.description}
              <div style={{marginTop: 12}}><Badge tone="warning">Enforced</Badge></div>
            </Card>
          ))}
        </div>
      </section>

      <section className="section-gap">
        <h2 style={{margin: "0 0 16px"}}>Supported jurisdictions</h2>
        <div className="card-grid">
          <Card title="Saudi Arabia (SAU)" eyebrow="Active">Markets subject to Saudi CMA oversight and Tadawul reporting standards.</Card>
          <Card title="United Arab Emirates (ARE)" eyebrow="Active">Markets subject to UAE Securities and Commodities Authority regulatory framework.</Card>
          <Card title="Egypt (EGY)" eyebrow="Active">Markets subject to Central Bank of Egypt and FRA oversight.</Card>
          <Card title="Qatar (QAT)" eyebrow="Active">Markets subject to Qatar Financial Centre Regulatory Authority standards.</Card>
          <Card title="Morocco (MAR)" eyebrow="Active">Markets subject to Moroccan Capital Market Authority guidelines.</Card>
          <Card title="Jordan (JOR)" eyebrow="Active">Markets subject to Jordan Securities Commission oversight.</Card>
          <Card title="GCC (Regional)" eyebrow="Active">Cross-border GCC markets subject to applicable member state regulations.</Card>
        </div>
      </section>
    </div>
  );
}
