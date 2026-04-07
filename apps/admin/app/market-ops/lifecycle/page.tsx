import { EmptyState, PageHeader } from "@menamarket/ui";
import { allowedLifecycleActions, getResolutionByMarketSlug, listAllMarkets } from "@menamarket/api";
import LifecycleActionPanel from "./lifecycle-action-panel";

export const dynamic = "force-dynamic";

export default async function LifecyclePage() {
  const markets = await listAllMarkets();

  return (
    <div className="stack">
      <PageHeader
        eyebrow="Lifecycle"
        title="Market lifecycle controls"
        description="Actions are shown only when valid for the current market state. Every action writes an audit entry."
      />
      {markets.length === 0 ? (
        <EmptyState
          title="No markets available"
          description="Publish at least one market before lifecycle actions become available."
        />
      ) : (
        <div className="stack" style={{ gap: 18 }}>
          {await Promise.all(markets.map(async (market) => {
            const actions = allowedLifecycleActions(market.status);
            const resolution = await getResolutionByMarketSlug(market.slug);
            return (
              <div key={market.slug} style={{padding: 18, borderRadius: 18, border: "1px solid rgba(125, 161, 196, 0.18)", background: "rgba(255,255,255,0.03)"}}>
                <div style={{display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap"}}>
                  <div>
                    <div style={{fontWeight: 700, marginBottom: 8}}>{market.question}</div>
                    <div style={{color: "#94a9c0"}}>{market.slug}</div>
                    <div style={{color: "#94a9c0", marginTop: 6}}>Current state: {market.status}</div>
                    {resolution ? (
                      <div style={{color: "#8ce6d6", marginTop: 6}}>Resolved outcome: {resolution.outcome}</div>
                    ) : null}
                  </div>
                  <LifecycleActionPanel slug={market.slug} currentStatus={market.status} allowedActions={actions} />
                </div>
              </div>
            );
          }))}
        </div>
      )}
    </div>
  );
}
