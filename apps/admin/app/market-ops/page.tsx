import { Card, PageHeader } from "@menamarket/ui";

export default function MarketOpsPage() {
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Market Ops"
        title="Operations entry point"
        description="Use the catalog route to inspect actual repository-backed market records. Review queues and actions remain deferred until later modules."
      />
      <div className="card-grid">
        <Card title="Catalog visibility" eyebrow="Live now">
          Repository-backed catalog inspection is available in the dedicated catalog route.
        </Card>
        <Card title="Review queue" eyebrow="Deferred">
          No fake tickets or placeholder moderation actions are shown in this stage.
        </Card>
        <Card title="Publishing controls" eyebrow="Deferred">
          Publication workflows require real backend permissions and audit logging before activation.
        </Card>
      </div>
    </div>
  );
}
