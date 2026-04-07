import { notFound } from "next/navigation";
import { Badge, Card, EmptyState, PageHeader, TableShell } from "@menamarket/ui";
import { getMarketDraftBySlug } from "@menamarket/api";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function DraftDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const draft = await getMarketDraftBySlug(slug);

  if (!draft) {
    return notFound();
  }

  return (
    <div className="stack">
      <PageHeader
        eyebrow="Draft detail"
        title={draft.question}
        description="Internal draft record loaded from the file-backed draft catalog."
      />
      <div className="inline">
        <Badge tone="accent">{draft.draftStatus}</Badge>
        <Badge>{draft.visibility}</Badge>
        <Badge>{draft.jurisdiction}</Badge>
      </div>
      <TableShell
        columns={["Field", "Value"]}
        rows={[
          ["ID", draft.id],
          ["Slug", draft.slug],
          ["Category", draft.category],
          ["Resolution source", draft.resolutionSource],
          ["Close time", new Date(draft.closeTimeIso).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })],
          ["Created", new Date(draft.createdAtIso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })],
          ["Updated", new Date(draft.updatedAtIso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })]
        ]}
      />
      <div className="card-grid">
        <Card title="Description" eyebrow="Stored field">
          {draft.description ?? "No description stored yet."}
        </Card>
        <Card title="Notes" eyebrow="Stored field">
          {draft.notes ?? "No notes stored yet."}
        </Card>
        <Card title="Publishing" eyebrow="Deferred">
          Draft promotion into the public market catalog is intentionally deferred until a later module with audit-safe workflows.
        </Card>
      </div>
      {!draft.description && !draft.notes ? (
        <EmptyState title="Minimal draft" description="Only required fields are stored for this draft." />
      ) : null}
    </div>
  );
}
