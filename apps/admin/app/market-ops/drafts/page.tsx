import { EmptyState, PageHeader, TableShell } from "@menamarket/ui";
import { listMarketDrafts } from "@menamarket/api";

export default async function DraftsPage() {
  const drafts = await listMarketDrafts();

  return (
    <div className="stack">
      <PageHeader
        eyebrow="Drafts"
        title="File-backed market drafts"
        description="These records live in data/market-drafts.json and remain internal until later publishing workflows exist."
      />
      {drafts.length === 0 ? (
        <EmptyState
          title="No drafts created yet"
          description="Create a draft from the admin form. No fake examples are injected here."
        />
      ) : (
        <>
          <TableShell
            columns={["Question", "Draft status", "Visibility", "Close time", "Slug"]}
            rows={drafts.map((draft) => [
              draft.question,
              draft.draftStatus,
              draft.visibility,
              new Date(draft.closeTimeIso).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short"
              }),
              draft.slug
            ])}
          />
          <div className="stack" style={{ gap: 12 }}>
            {drafts.map((draft) => (
              <a key={draft.slug} href={`/market-ops/drafts/${draft.slug}`} style={{ color: "#94a9c0" }}>
                Open draft detail → {draft.question}
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
