import { Badge, Card, PageHeader } from "@menamarket/ui";

export default function AboutPage() {
  return (
    <div className="section stack">
      <PageHeader eyebrow="About" title="MENAMarket" description="A prediction market platform built specifically for the Middle East and North Africa region, combining rigorous market infrastructure with compliance-first design." />

      <div className="card-grid">
        <Card title="MENA-focused markets" eyebrow="Regional expertise">
          Markets spanning Saudi Arabia, UAE, Egypt, Qatar, Morocco, Jordan, and the broader GCC — covering finance, technology, infrastructure, economics, and sports.
        </Card>
        <Card title="Original identity" eyebrow="Independent brand">
          MENAMarket uses its own naming, design system, and product identity. The platform is built from the ground up to serve the MENA market landscape.
        </Card>
        <Card title="Truthful interface" eyebrow="Product integrity">
          Every element shown is backed by real data and validated schemas. No fabricated prices, mock balances, or decorative order books.
        </Card>
      </div>

      <section className="section-gap">
        <h2 style={{margin: "0 0 16px"}}>How it works</h2>
        <div className="card-grid">
          <Card title="1. Browse markets" eyebrow="Discover">
            Explore prediction markets with clear questions, defined outcomes, resolution sources, and jurisdiction tags. Filter by category, region, or status.
          </Card>
          <Card title="2. Place orders" eyebrow="Trade">
            Submit buy or sell orders on market outcomes at your chosen price. The order book matches buyers and sellers through a transparent matching engine.
          </Card>
          <Card title="3. Track positions" eyebrow="Manage">
            Monitor your open positions, pending orders, and account balance through your portfolio. All transactions are recorded in an auditable ledger.
          </Card>
        </div>
      </section>

      <section className="section-gap">
        <h2 style={{margin: "0 0 16px"}}>Platform principles</h2>
        <div className="card-grid">
          <Card title="Every market has rules" eyebrow="Market integrity">
            Markets require clear resolution criteria, evidence sources, and edge-case rules before they go live. No ambiguous wording.
          </Card>
          <Card title="Every action is logged" eyebrow="Auditability">
            Market creation, publishing, lifecycle changes, and financial operations are durably logged in the audit trail.
          </Card>
          <Card title="Compliance before features" eyebrow="Governance">
            <Badge tone="warning">Jurisdiction-first</Badge>
            <span style={{display: "block", marginTop: 8}}>
              Geographic controls, regulatory constraints, and operational safeguards are built into the foundation — not bolted on later.
            </span>
          </Card>
        </div>
      </section>
    </div>
  );
}
