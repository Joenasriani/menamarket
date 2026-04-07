import { Badge, Button, Card, EmptyState, ErrorState, PageHeader, TableShell } from "@menamarket/ui";

const featureRows = [
  { area: "Market Operations", current: "Question standards, policy notes, legal gating, and admin preparation", next: "Structured market drafting and review" },
  { area: "Trading Core", current: "Architecture and shell only", next: "Order book and market pages in later modules" },
  { area: "Compliance", current: "Jurisdiction-first product framing", next: "Rule engine, geography controls, and logging" }
];

export default function HomePage() {
  return (
    <div className="stack">
      <section className="hero">
        <div className="hero-copy">
          <Badge tone="accent">MENA-first market infrastructure</Badge>
          <h1>Build a serious market product without fake signals.</h1>
          <p>
            MENAMarket starts with governance, shell architecture, and a controlled product surface.
            This stage intentionally avoids fabricated prices, mock portfolio balances, and decorative order books.
          </p>
          <div className="pill-row">
            <Button href="/markets">Browse structure</Button>
            <Button href="/compliance" variant="secondary">Review constraints</Button>
          </div>
          <div className="stats-grid">
            <Card title="Surface ready" eyebrow="Web shell">Distinct brand, reusable components, responsive layouts, and stable page structure.</Card>
            <Card title="Admin shell" eyebrow="Operations">Internal navigation for market operations planning without fake controls.</Card>
            <Card title="Next focus" eyebrow="Module flow">Market catalog and event pages after shell hardening.</Card>
          </div>
        </div>
        <aside className="hero-panel stack">
          <PageHeader eyebrow="Principles" title="No decorative trading theater" description="Every visible area in this stage is either structural, informative, or intentionally empty." />
          <TableShell columns={["Area", "Current state", "Next module"]} rows={featureRows.map((row) => [row.area, row.current, row.next])} />
        </aside>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Foundation areas</h2>
          <p>These sections are intentionally product-real, but feature-light until the corresponding modules are implemented.</p>
        </div>
        <div className="card-grid">
          <Card title="Markets" eyebrow="Public navigation">Structured routes for market discovery without fake listings.</Card>
          <Card title="Portfolio" eyebrow="Account surface">A real route reserved for future authenticated positions and activity.</Card>
          <Card title="Compliance" eyebrow="Operational discipline">Product framing starts with geography, regulation, and control requirements.</Card>
        </div>
      </section>

      <section className="section info-grid">
        <EmptyState title="No live markets yet" description="Market listings will appear only after the market catalog and event-page modules are implemented." action={<Button href="/markets" variant="secondary">Open markets route</Button>} />
        <ErrorState title="No execution engine enabled" description="Trading, settlement, and wallet actions remain disabled until the matching and contract layers exist." />
        <Card title="What you can review now" eyebrow="Current utility">
          Layout quality, navigation flow, design tokens, shared components, and route structure.
          <div style={{marginTop: 16}}><a href="/about">Read the product framing →</a></div>
        </Card>
      </section>
    </div>
  );
}
