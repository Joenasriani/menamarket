import type { Metadata } from "next";
import { Badge, Card, EmptyState, PageHeader } from "@menamarket/ui";
import { filterPublicMarkets, isDiscoveryStatus, listDiscoverySummary } from "@menamarket/api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Markets — MENAMarket",
  description: "Browse and filter MENA-focused prediction markets."
};

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
  const merged = { ...params, ...next };
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(merged)) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  const qs = searchParams.toString();
  return qs ? `/markets?${qs}` : "/markets";
}

function clearFilterHref(
  params: { q?: string; category?: string; jurisdiction?: string; status?: string },
  key: "q" | "category" | "jurisdiction" | "status"
): string {
  const searchParams = new URLSearchParams();
  for (const [entryKey, entryValue] of Object.entries(params)) {
    if (entryKey !== key && entryValue) {
      searchParams.set(entryKey, entryValue);
    }
  }
  const qs = searchParams.toString();
  return qs ? `/markets?${qs}` : "/markets";
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

  const hasActiveFilters = Boolean(params.q || params.category || params.jurisdiction || status);

  return (
    <div className="section stack">
      <PageHeader
        eyebrow="Markets"
        title="Prediction markets"
        description="Browse real prediction markets covering finance, technology, geopolitics, and more across the MENA region."
      />

      {/* ── Search form ──────────────────────────────────────────────── */}
      <form action="/markets" method="GET" className="inline" style={{ flexWrap: "wrap", gap: 10 }}>
        <label
          htmlFor="market-search"
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: "hidden",
            clip: "rect(0,0,0,0)",
            whiteSpace: "nowrap",
            border: 0
          }}
        >
          Search markets
        </label>
        <input
          id="market-search"
          type="search"
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Search markets…"
          style={{
            flex: "1 1 240px",
            padding: "10px 14px",
            borderRadius: 999,
            border: "1px solid rgba(125, 161, 196, 0.22)",
            background: "rgba(255,255,255,0.04)",
            color: "#edf3fb",
            fontSize: 14,
            minWidth: 200
          }}
        />
        <button
          type="submit"
          aria-label="Search markets"
          style={{
            padding: "10px 20px",
            borderRadius: 999,
            border: "1px solid rgba(55, 195, 166, 0.2)",
            background: "linear-gradient(135deg, #37c3a6, #4aa3ff)",
            color: "#08131f",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer"
          }}
        >
          Search
        </button>
        {hasActiveFilters && (
          <a
            href="/markets"
            style={{ padding: "10px 16px", borderRadius: 999, border: "1px solid rgba(125, 161, 196, 0.18)", color: "#94a9c0", fontSize: 13 }}
          >
            Clear all filters ×
          </a>
        )}
      </form>

      {/* ── Filter facets ─────────────────────────────────────────────── */}
      {(summary.categories.length > 0 || summary.jurisdictions.length > 0 || summary.statuses.length > 0) && (
        <div className="stack" style={{ gap: 10 }}>
          {summary.categories.length > 0 && (
            <div className="inline" style={{ gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "#94a9c0", textTransform: "uppercase", letterSpacing: "0.06em", minWidth: 80 }}>Category</span>
              {summary.categories.map((facet) => (
                <a key={facet.value} href={buildFilterHref(params, { category: facet.value })}>
                  <Badge tone={params.category === facet.value ? "accent" : "neutral"}>
                    {facet.value} ({facet.count})
                  </Badge>
                </a>
              ))}
              {params.category && (
                <a href={clearFilterHref(params, "category")} style={{ fontSize: 12, color: "#94a9c0" }}>clear ×</a>
              )}
            </div>
          )}
          {summary.jurisdictions.length > 0 && (
            <div className="inline" style={{ gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "#94a9c0", textTransform: "uppercase", letterSpacing: "0.06em", minWidth: 80 }}>Region</span>
              {summary.jurisdictions.map((facet) => (
                <a key={facet.value} href={buildFilterHref(params, { jurisdiction: facet.value })}>
                  <Badge tone={params.jurisdiction === facet.value ? "accent" : "neutral"}>
                    {facet.value} ({facet.count})
                  </Badge>
                </a>
              ))}
              {params.jurisdiction && (
                <a href={clearFilterHref(params, "jurisdiction")} style={{ fontSize: 12, color: "#94a9c0" }}>clear ×</a>
              )}
            </div>
          )}
          {summary.statuses.length > 0 && (
            <div className="inline" style={{ gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "#94a9c0", textTransform: "uppercase", letterSpacing: "0.06em", minWidth: 80 }}>Status</span>
              {summary.statuses.map((facet) => (
                <a key={facet.value} href={buildFilterHref(params, { status: facet.value })}>
                  <Badge tone={status === facet.value ? "accent" : "neutral"}>
                    {facet.value} ({facet.count})
                  </Badge>
                </a>
              ))}
              {status && (
                <a href={clearFilterHref(params, "status")} style={{ fontSize: 12, color: "#94a9c0" }}>clear ×</a>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Results ───────────────────────────────────────────────────── */}
      <div style={{ fontSize: 13, color: "#94a9c0" }}>
        {markets.length === 0 ? "No markets match the current filters." : `${markets.length} market${markets.length === 1 ? "" : "s"}`}
        {hasActiveFilters ? " (filtered)" : ""}
      </div>

      {markets.length === 0 ? (
        <EmptyState
          title="No markets match the current filters"
          description="Try clearing your filters or searching with different terms."
          action={<a href="/markets" style={{ color: "#8ce6d6" }}>View all markets →</a>}
        />
      ) : (
        <div className="card-grid">
          {markets.map((market) => (
            <a key={market.slug} href={`/markets/${market.slug}`} aria-label={`Open market detail for: ${market.question}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
              <Card title={market.question} eyebrow={market.category}>
                <div className="stack" style={{ gap: 12 }}>
                  {/* Outcome probabilities */}
                  <div className="stack" style={{ gap: 8 }}>
                    {market.outcomes.slice(0, 4).map((outcome) => {
                      const pct = Math.round(outcome.probability * 100);
                      return (
                        <div key={outcome.id} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a9c0" }}>
                            <span>{outcome.label}</span>
                            <span style={{ color: "#8ce6d6", fontWeight: 600 }}>{pct}¢</span>
                          </div>
                          <div style={{ height: 4, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: "#37c3a6" }} />
                          </div>
                        </div>
                      );
                    })}
                    {market.outcomes.length > 4 && (
                      <div style={{ fontSize: 12, color: "#94a9c0" }}>+{market.outcomes.length - 4} more outcomes</div>
                    )}
                  </div>
                  <div className="inline">
                    <Badge tone="accent">{market.status}</Badge>
                    <Badge>{market.jurisdiction}</Badge>
                  </div>
                  <div style={{ fontSize: 12, color: "#94a9c0" }}>
                    Closes{" "}
                    {new Date(market.closeTimeIso).toLocaleDateString("en-US", {
                      dateStyle: "medium"
                    })}
                  </div>
                  <div style={{ color: "#8ce6d6", fontSize: 13 }}>View market →</div>
                </div>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
