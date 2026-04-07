import { Badge, Card, EmptyState, PageHeader } from "@menamarket/ui";
import { auditFacetSummary, listAuditEntries } from "@menamarket/api";

type SearchParams = Promise<{
  q?: string;
  action?: string;
  targetType?: string;
}>;

function buildFilterHref(
  params: { q?: string; action?: string; targetType?: string },
  next: Partial<{ q: string; action: string; targetType: string }>
): string {
  const url = new URL("http://menamarket.local/audit");
  const merged = { ...params, ...next };
  for (const [key, value] of Object.entries(merged)) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }
  return url.pathname + (url.search ? url.search : "");
}

function clearFilterHref(
  params: { q?: string; action?: string; targetType?: string },
  key: "q" | "action" | "targetType"
): string {
  const url = new URL("http://menamarket.local/audit");
  for (const [entryKey, entryValue] of Object.entries(params)) {
    if (entryKey !== key && entryValue) {
      url.searchParams.set(entryKey, entryValue);
    }
  }
  return url.pathname + (url.search ? url.search : "");
}

export default async function AuditPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const [summary, entries] = await Promise.all([
    auditFacetSummary(),
    listAuditEntries({
      q: params.q,
      action: params.action,
      targetType: params.targetType
    })
  ]);

  return (
    <div className="stack">
      <PageHeader
        eyebrow="Audit"
        title="Internal audit history"
        description="This screen surfaces real audit events only. No fabricated analytics, no synthetic severity scores."
      />

      <div className="card-grid">
        <Card title={`Entries: ${summary.total}`} eyebrow="Audit size">
          Total file-backed audit events currently stored.
        </Card>
        <Card title={`Actions: ${summary.actions.length}`} eyebrow="Facet count">
          Distinct action types present in the audit trail.
        </Card>
        <Card title={`Target types: ${summary.targetTypes.length}`} eyebrow="Facet count">
          Distinct target object classes currently logged.
        </Card>
      </div>

      <Card title="Active filters" eyebrow="Query state">
        <div className="inline">
          {params.q ? <Badge tone="accent">q: {params.q}</Badge> : <Badge>q: none</Badge>}
          {params.action ? <Badge tone="accent">action: {params.action}</Badge> : <Badge>action: none</Badge>}
          {params.targetType ? <Badge tone="accent">targetType: {params.targetType}</Badge> : <Badge>targetType: none</Badge>}
        </div>
      </Card>

      <div className="card-grid">
        <Card title="Quick search" eyebrow="Text query">
          <div className="stack" style={{ gap: 10 }}>
            <a href={buildFilterHref(params, { q: "published" })}>Try q=published</a>
            <a href={clearFilterHref(params, "q")}>Clear q</a>
          </div>
        </Card>
        <Card title="Actions" eyebrow="Real facets">
          <div className="stack" style={{ gap: 10 }}>
            {summary.actions.length === 0 ? (
              <div style={{ color: "#94a9c0" }}>No action facets yet.</div>
            ) : summary.actions.map((facet) => (
              <a key={facet.value} href={buildFilterHref(params, { action: facet.value })}>
                {facet.value} ({facet.count})
              </a>
            ))}
            <a href={clearFilterHref(params, "action")}>Clear action</a>
          </div>
        </Card>
        <Card title="Target types" eyebrow="Real facets">
          <div className="stack" style={{ gap: 10 }}>
            {summary.targetTypes.length === 0 ? (
              <div style={{ color: "#94a9c0" }}>No target-type facets yet.</div>
            ) : summary.targetTypes.map((facet) => (
              <a key={facet.value} href={buildFilterHref(params, { targetType: facet.value })}>
                {facet.value} ({facet.count})
              </a>
            ))}
            <a href={clearFilterHref(params, "targetType")}>Clear target type</a>
          </div>
        </Card>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          title="No audit entries match the current filters"
          description="The audit viewer reflects only real stored events, so an empty result means there is nothing matching the filter set."
        />
      ) : (
        <div className="stack" style={{ gap: 16 }}>
          {entries.map((entry) => (
            <Card key={entry.id} title={entry.action} eyebrow={entry.targetType}>
              <div className="stack" style={{ gap: 10 }}>
                <div>Target ID: {entry.targetId}</div>
                <div>Timestamp: {new Date(entry.timestampIso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</div>
                <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  Metadata: {JSON.stringify(entry.metadata, null, 2)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
