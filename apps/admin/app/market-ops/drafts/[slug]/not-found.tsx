import { EmptyState, PageHeader } from "@menamarket/ui";

export default function DraftNotFound() {
  return (
    <div className="stack">
      <PageHeader eyebrow="Draft detail" title="Draft not found" description="No stored draft matches this route." />
      <EmptyState title="No draft record" description="This route remains empty until a real draft with this slug exists." />
    </div>
  );
}
