import { EmptyState, PageHeader, TableShell } from "@menamarket/ui";
import { listAllMarkets } from "@menamarket/api";

export default async function AdminCatalogPage() {
  const markets = await listAllMarkets();

  return (
    <div className="stack">
      <PageHeader
        eyebrow="Catalog"
        title="Repository-backed market records"
        description="This internal view reflects the real contents of data/markets.json after validation. Empty means empty."
      />
      {markets.length === 0 ? (
        <EmptyState
          title="Catalog is empty"
          description="No market records exist yet. Add reviewed records to data/markets.json to populate this screen."
        />
      ) : (
        <>
          <TableShell
            columns={["Question", "Visibility", "Status", "Updated", "Source"]}
            rows={markets.map((market) => [
              market.question,
              market.visibility,
              market.status,
              new Date(market.updatedAtIso).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short"
              }),
              market.resolutionSource
            ])}
          />
          <div className="stack" style={{ gap: 12 }}>
            {markets.map((market) => (
              <a key={market.slug} href={`/market-ops/catalog/${market.slug}`} style={{ color: "#94a9c0" }}>
                Open internal detail → {market.question}
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
