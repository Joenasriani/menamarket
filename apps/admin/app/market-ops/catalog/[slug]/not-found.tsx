import { EmptyState, PageHeader } from "@menamarket/ui";

export default function AdminCatalogDetailNotFound() {
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Catalog detail"
        title="Record not found"
        description="No market record matches this internal route."
      />
      <EmptyState
        title="No catalog record"
        description="This screen remains empty until a real market record with the requested slug exists."
      />
    </div>
  );
}
