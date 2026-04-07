import { Badge, Card, PageHeader } from "@menamarket/ui";

const items = [
  "Jurisdiction selection before launch",
  "Market wording standards before publication",
  "No live-money flow without legal and operational controls",
  "No fake yields, balances, prices, or active market depth"
];

export default function CompliancePage() {
  return (
    <div className="section stack">
      <PageHeader eyebrow="Compliance" title="Control-first product framing" description="MENAMarket is being built as an operational system, not a decorative demo. Legal gating and abuse controls come before public activation." />
      <div className="card-grid">
        {items.map((item) => (
          <Card key={item} title={item} eyebrow="Constraint"><Badge tone="warning">Required</Badge></Card>
        ))}
      </div>
    </div>
  );
}
