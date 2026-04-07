import { EmptyState, PageHeader } from "@menamarket/ui";

export default function MarketNotFound() {
  return (
    <div className="section stack">
      <PageHeader
        eyebrow="Markets"
        title="Market not found"
        description="No public market record matches this route."
      />
      <EmptyState
        title="Nothing to render"
        description="This route stays truthful: if the catalog does not contain the slug, the page does not invent a market."
      />
    </div>
  );
}
