import { Badge, Card, EmptyState, PageHeader } from "@menamarket/ui";
import { filterPublicMarkets, isDiscoveryStatus, listDiscoverySummary } from "@menamarket/api";

type SearchParams = Promise<{
  q?: string;
  category?: string;
  jurisdiction?: string;
  status?: string;
}>;

function buildFilterHref(
  params: { q?: string; category?: string; jurisdiction?: string; status?: string },
  next: Partial<{ q: string; category: string; jurisdiction: string; status: string }>
): string {
  const url = new URL("http://menamarket.local/markets");
  const merged = { ...params, ...next };

  for (const [key, value] of Object.entries(merged)) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }

  return url.pathname + (url.search ? url.search : "");
}

function clearFilterHref(
  params: { q?: string; category?: string; jurisdiction?: string; status?: string },
  key: "q" | "category" | "jurisdiction" | "status"
): string {
  const url = new URL("http://menamarket.local/markets");
  for (const [entryKey, entryValue] of Object.entries(params)) {
    if (entryKey !== key && entryValue) {
      url.searchParams.set(entryKey, entryValue);
    }
  }
  return url.pathname + (url.search ? url.search : "");
}

export default async function MarketsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const status = isDiscoveryStatus(params.status) ? params.status : undefined;

  const [summary, markets] = await Promise.all([
    listDiscoverySummary(),
    filterPublicMarkets({
      ...(params.q !== undefined && { q: params.q }),
      ...(params.category !== undefined && { category: params.category }),
      ...(params.jurisdiction !== undefined && { jurisdiction: params.jurisdiction }),
      ...(status !== undefined && { status })
    })
  ]);

  return (
    <div className="section stack">
      <PageHeader
        eyebrow="Markets"
        title="Public market discovery"
        description="Search and filter only against real published market records. No synthetic trends or invented highlights are shown."
      />

      <div className="card-grid">
        <Card title={`Total public markets: ${summary.total}`} eyebrow="Catalog size">
          The discovery surface reflects the real contents of the public market catalog.
        </Card>
        <Card title={`Categories: ${summary.categories.length}`} eyebrow="Facet count">
          Categories are derived from actual public records, not editorial placeholders.
        </Card>
        <Card title={`Jurisdictions: ${summary.jurisdictions.length}`} eyebrow="Facet count">
          Jurisdictions appear only when real market records exist for them.
        </Card>
      </div>

      <Card title="Active filters" eyebrow="Query state">
        <div className="inline">
          {params.q ? <Badge tone="accent">q: {params.q}</Badge> : <Badge>q: none</Badge>}
          {params.category ? <Badge tone="accent">category: {params.category}</Badge> : <Badge>category: none</Badge>}
          {params.jurisdiction ? <Badge tone="accent">jurisdiction: {params.jurisdiction}</Badge> : <Badge>jurisdiction: none</Badge>}
          {status ? <Badge tone="accent">status: {status}</Badge> : <Badge>status: none</Badge>}
        </div>
      </Card>

      <div className="card-grid">
        <Card title="Search" eyebrow="Text query">
          <div className="stack" style={{ gap: 10 }}>
            <a href={buildFilterHref(params, { q: "election" })}>Try q=election</a>
            <a href={clearFilterHref(params, "q")}>Clear q</a>
          </div>
        </Card>
        <Card title="Categories" eyebrow="Real facets">
          <div className="stack" style={{ gap: 10 }}>
            {summary.categories.length === 0 ? (
              <div style={{ color: "#94a9c0" }}>No category facets yet.</div>
            ) : summary.categories.map((facet) => (
              <a key={facet.value} href={buildFilterHref(params, { category: facet.value })}>
                {facet.value} ({facet.count})
              </a>
            ))}
            <a href={clearFilterHref(params, "category")}>Clear category</a>
          </div>
        </Card>
        <Card title="Jurisdictions" eyebrow="Real facets">
          <div className="stack" style={{ gap: 10 }}>
            {summary.jurisdictions.length === 0 ? (
              <div style={{ color: "#94a9c0" }}>No jurisdiction facets yet.</div>
            ) : summary.jurisdictions.map((facet) => (
              <a key={facet.value} href={buildFilterHref(params, { jurisdiction: facet.value })}>
                {facet.value} ({facet.count})
              </a>
            ))}
            <a href={clearFilterHref(params, "jurisdiction")}>Clear jurisdiction</a>
          </div>
        </Card>
      </div>

      <Card title="Statuses" eyebrow="Real facets">
        <div className="inline">
          {summary.statuses.length === 0 ? (
            <span style={{ color: "#94a9c0" }}>No status facets yet.</span>
          ) : summary.statuses.map((facet) => (
            <a key={facet.value} href={buildFilterHref(params, { status: facet.value })}>
              <Badge>{facet.value} ({facet.count})</Badge>
            </a>
          ))}
          <a href={clearFilterHref(params, "status")}>Clear status</a>
        </div>
      </Card>

      {markets.length === 0 ? (
        <EmptyState
          title="No markets match the current filters"
          description="This state is truthful: the search and facet filters are active, but no published market records currently match them."
        />
      ) : (
        <div className="card-grid">
          {markets.map((market) => (
            <Card key={market.slug} title={market.question} eyebrow={market.category}>
              <div className="stack" style={{ gap: 12 }}>
                <div className="inline">
                  <Badge tone="accent">{market.status}</Badge>
                  <Badge>{market.jurisdiction}</Badge>
                  <Badge>{market.visibility}</Badge>
                </div>
                <div>Resolution source: {market.resolutionSource}</div>
                <div>
                  Close time:{" "}
                  {new Date(market.closeTimeIso).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short"
                  })}
                </div>
                <a href={`/markets/${market.slug}`}>Open market detail →</a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
