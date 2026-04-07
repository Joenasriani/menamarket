import { Badge, Button, Card, PageHeader, TableShell } from "@menamarket/ui";

export const dynamic = "force-dynamic";

import { listPublicMarkets } from "@menamarket/api";

const featureRows = [
  { area: "Market Discovery", current: "Live catalog with search, filters, and faceted browsing", status: "Active" },
  { area: "Trading Infrastructure", current: "Order book, matching engine, fills, and ledger", status: "Active" },
  { area: "Settlement & Resolution", current: "Market resolution pipeline and settlement flow", status: "Active" },
  { area: "Authentication", current: "Actor signup, login, session management", status: "Active" },
  { area: "Wallet Rails", current: "Funding intents and payout request capture", status: "Active" },
  { area: "Admin Operations", current: "Draft creation, review, publish, lifecycle, audit", status: "Active" }
];

export default async function HomePage() {
  const markets = await listPublicMarkets();
  const openCount = markets.filter((m) => m.status === "open").length;
  const categories = [...new Set(markets.map((m) => m.category))];
  const jurisdictions = [...new Set(markets.map((m) => m.jurisdiction))];

  return (
    <div className="stack">
      <section className="hero">
        <div className="hero-copy">
          <Badge tone="accent">MENA-focused prediction markets</Badge>
          <h1>Real markets. Real infrastructure. No fake signals.</h1>
          <p>
            MENAMarket is a prediction market platform built for the MENA region.
            Browse live markets spanning finance, technology, infrastructure, economics, and sports
            across Saudi Arabia, UAE, Egypt, Qatar, Morocco, Jordan, and the GCC.
          </p>
          <div className="pill-row">
            <Button href="/markets">Browse markets</Button>
            <Button href="/signup" variant="secondary">Create account</Button>
          </div>
          <div className="stats-grid">
            <Card title={`${openCount} open`} eyebrow="Live markets">
              Active prediction markets with real outcomes, pricing, and order books.
            </Card>
            <Card title={`${categories.length} categories`} eyebrow="Coverage">
              {categories.join(", ")}.
            </Card>
            <Card title={`${jurisdictions.length} jurisdictions`} eyebrow="Regions">
              {jurisdictions.join(", ")}.
            </Card>
          </div>
        </div>
        <aside className="hero-panel stack">
          <PageHeader eyebrow="Platform capabilities" title="Full-stack market infrastructure" description="Every feature shown is backed by real data, validated schemas, and auditable operations." />
          <TableShell columns={["Area", "Description", "Status"]} rows={featureRows.map((row) => [row.area, row.current, row.status])} />
        </aside>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Explore the platform</h2>
          <p>Browse markets, track activity, manage your portfolio, and fund your account — all built on auditable infrastructure.</p>
        </div>
        <div className="card-grid">
          <Card title="Markets" eyebrow="Discovery">
            Search and filter prediction markets by category, jurisdiction, and status. View outcomes, probabilities, and order books.
            <div className="card-action-link"><a href="/markets">Browse all markets →</a></div>
          </Card>
          <Card title="Portfolio" eyebrow="Positions">
            Sign in to view your open positions, pending orders, and account activity in one place.
            <div className="card-action-link"><a href="/portfolio">View portfolio →</a></div>
          </Card>
          <Card title="Activity feed" eyebrow="Live updates">
            Track real-time market activity including new orders, fills, and market state changes.
            <div className="card-action-link"><a href="/activity">View activity →</a></div>
          </Card>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Built with integrity</h2>
          <p>Every component is backed by real data, validated schemas, and compliance-first design. No decorative trading theater.</p>
        </div>
        <div className="card-grid">
          <Card title="Schema-validated data" eyebrow="Data integrity">
            All markets, orders, fills, and ledger entries are validated against JSON schemas before persistence.
          </Card>
          <Card title="Auditable operations" eyebrow="Transparency">
            Every admin action — market creation, publishing, lifecycle changes — is logged with full audit trails.
          </Card>
          <Card title="Compliance-first" eyebrow="Governance">
            Jurisdiction tracking, resolution sources, and market rules are required fields — not optional metadata.
            <div className="card-action-link"><a href="/compliance">Review constraints →</a></div>
          </Card>
        </div>
      </section>
    </div>
  );
}
