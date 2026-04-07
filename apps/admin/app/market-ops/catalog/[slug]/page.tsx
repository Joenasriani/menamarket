import { notFound } from "next/navigation";
import { Badge, Card, EmptyState, PageHeader, TableShell } from "@menamarket/ui";
import { getAnyMarketBySlug } from "@menamarket/api";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function AdminMarketDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const market = await getAnyMarketBySlug(slug);

  if (!market) {
    return notFound();
  }

  return (
    <div className="stack">
      <PageHeader
        eyebrow="Catalog detail"
        title={market.question}
        description="Internal repository-backed view of a single market record."
      />
      <div className="inline">
        <Badge tone="accent">{market.status}</Badge>
        <Badge>{market.visibility}</Badge>
        <Badge>{market.jurisdiction}</Badge>
        <Badge>{market.outcomeType}</Badge>
      </div>
      <TableShell
        columns={["Field", "Value"]}
        rows={[
          ["ID", market.id],
          ["Slug", market.slug],
          ["Category", market.category],
          ["Resolution source", market.resolutionSource],
          ["Resolution title", market.resolutionTitle],
          ["Resolution basis", market.resolutionBasis],
          ["Close time", new Date(market.closeTimeIso).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })],
          ["Created", new Date(market.createdAtIso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })],
          ["Updated", new Date(market.updatedAtIso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })]
        ]}
      />
      <div className="card-grid">
        <Card title="Rules" eyebrow="Stored field">
          <ol style={{ margin: 0, paddingLeft: 18 }}>
            {market.rules.map((rule) => (
              <li key={rule} style={{ marginBottom: 10 }}>{rule}</li>
            ))}
          </ol>
        </Card>
        <Card title="Examples" eyebrow="Stored field">
          {market.resolutionExamples && market.resolutionExamples.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {market.resolutionExamples.map((example) => (
                <li key={example} style={{ marginBottom: 10 }}>{example}</li>
              ))}
            </ul>
          ) : (
            "No examples stored yet."
          )}
        </Card>
        <Card title="Source link" eyebrow="Stored field">
          {market.sourceLink ?? "No source link stored yet."}
        </Card>
      </div>
      {!market.description && !market.notes ? (
        <EmptyState
          title="Minimal narrative fields"
          description="This market exists, but only structured resolution fields are populated right now."
        />
      ) : null}
    </div>
  );
}
