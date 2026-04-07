import { notFound } from "next/navigation";
import { Badge, Card, EmptyState, PageHeader, TableShell } from "@menamarket/ui";
import { AiMarketSummary } from "./ai-market-summary";
import { getOrderBook, getPublicMarketBySlug, getPublicMarketPricing, getResolutionByMarketSlug } from "@menamarket/api";

type PageProps = { params: Promise<{ slug: string }> };

export default async function MarketDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const market = await getPublicMarketBySlug(slug);
  if (!market) notFound();

  const [resolution, pricing, orderBook] = await Promise.all([
    getResolutionByMarketSlug(slug),
    getPublicMarketPricing(slug),
    getOrderBook(slug)
  ]);

  return (
    <div className="section stack">
      <PageHeader eyebrow={market.category} title={market.question} description={market.description ?? "This market record has no extended description yet."} />
      <div className="inline">
        <Badge tone="accent">{market.status}</Badge>
        <Badge>{market.jurisdiction}</Badge>
        <Badge>{market.visibility}</Badge>
        <Badge>{market.outcomeType}</Badge>
      </div>

      <TableShell
        columns={["Field", "Value"]}
        rows={[
          ["Resolution source", market.resolutionSource],
          ["Resolution title", market.resolutionTitle],
          ["Resolution basis", market.resolutionBasis],
          ["Close time", new Date(market.closeTimeIso).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })],
          ["Price updated", pricing?.priceUpdatedAtIso ? new Date(pricing.priceUpdatedAtIso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "No pricing timestamp"],
          ["Open buys", String(orderBook.buys.length)],
          ["Open sells", String(orderBook.sells.length)]
        ]}
      />

      <div className="card-grid">
        <Card title="Outcomes and prices" eyebrow="Read-only snapshot">
          <div className="stack" style={{ gap: 12 }}>
            {pricing?.outcomes.map((outcome) => (
              <div key={outcome.id} style={{display: "flex", justifyContent: "space-between", gap: 12}}>
                <span>{outcome.label}</span>
                <span>p={outcome.probability.toFixed(2)} | price={outcome.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Open buy orders" eyebrow="Off-chain book">
          {orderBook.buys.length ? (
            <div className="stack" style={{ gap: 10 }}>
              {orderBook.buys.map((order) => (
                <div key={order.id}>{order.outcomeId} · qty {order.quantity} @ {order.limitPrice.toFixed(2)}</div>
              ))}
            </div>
          ) : "No open buy orders."}
        </Card>
        <Card title="Open sell orders" eyebrow="Off-chain book">
          {orderBook.sells.length ? (
            <div className="stack" style={{ gap: 10 }}>
              {orderBook.sells.map((order) => (
                <div key={order.id}>{order.outcomeId} · qty {order.quantity} @ {order.limitPrice.toFixed(2)}</div>
              ))}
            </div>
          ) : "No open sell orders."}
        </Card>
      </div>

      <AiMarketSummary slug={slug} question={market.question} outcomes={market.outcomes.map((outcome) => ({ id: outcome.id, label: outcome.label }))} {...(market.description !== undefined && { description: market.description })} />

      {resolution ? (
        <Card title="Resolution record" eyebrow="Outcome">
          <div style={{display: "flex", flexDirection: "column", gap: 10}}>
            <div>Outcome: {resolution.outcome}</div>
            <div>Evidence: {resolution.evidence}</div>
            <div>Source link: {resolution.sourceLink}</div>
            <div>Resolved at: {new Date(resolution.resolvedAtIso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</div>
          </div>
        </Card>
      ) : market.notes ? (
        <Card title="Notes" eyebrow="Record field present">{market.notes}</Card>
      ) : (
        <EmptyState title="No supplemental notes or resolution" description="No additional notes are stored for this public market record, and it has not been resolved yet." />
      )}
    </div>
  );
}
