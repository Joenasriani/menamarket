import { EmptyState, PageHeader, TableShell } from "@menamarket/ui";
import { listReviewReadyDrafts } from "@menamarket/api";
import PublishDraftButton from "./publish-draft-button";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const drafts = await listReviewReadyDrafts();

  return (
    <div className="stack">
      <PageHeader
        eyebrow="Review & publish"
        title="Explicit promotion into the public catalog"
        description="Only review_ready drafts appear here. Publishing writes a real market record into data/markets.json and logs the action."
      />
      {drafts.length === 0 ? (
        <EmptyState
          title="No review_ready drafts"
          description="Move a draft into review_ready state from the create form before it becomes eligible for publishing."
        />
      ) : (
        <>
          <TableShell
            columns={["Question", "Slug", "Visibility", "Close time", "Action"]}
            rows={drafts.map((draft) => [
              draft.question,
              draft.slug,
              draft.visibility,
              new Date(draft.closeTimeIso).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short"
              }),
              "Publish from action panel below"
            ])}
          />
          <div className="stack" style={{ gap: 16 }}>
            {drafts.map((draft) => (
              <div key={draft.slug} style={{display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", padding: 16, borderRadius: 16, border: "1px solid rgba(125, 161, 196, 0.18)", background: "rgba(255,255,255,0.03)"}}>
                <div>
                  <div style={{fontWeight: 600}}>{draft.question}</div>
                  <div style={{color: "#94a9c0", marginTop: 6}}>{draft.slug}</div>
                </div>
                <PublishDraftButton slug={draft.slug} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
