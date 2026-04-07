import { cookies } from "next/headers";
import { Badge, Card, EmptyState, PageHeader, TableShell } from "@menamarket/ui";
import { ACTOR_SESSION_COOKIE, getActorPositions, listOrders, verifyActorSessionToken } from "@menamarket/api";

export default async function PortfolioPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACTOR_SESSION_COOKIE)?.value;
  const session = verifyActorSessionToken(token);

  if (!session) {
    return (
      <div className="section stack">
        <PageHeader eyebrow="Portfolio" title="Portfolio requires an actor session" description="Sign in to view open order exposure tied to your actor account." />
        <EmptyState title="You are not signed in" description="Login is required before MENAMarket can resolve your actor positions and account-linked activity." action={<a href="/login">Go to login →</a>} />
      </div>
    );
  }

  const [positions, openOrders] = await Promise.all([
    getActorPositions(session.actorId),
    listOrders({ actorId: session.actorId, status: "open" })
  ]);

  return (
    <div className="section stack">
      <PageHeader eyebrow="Portfolio" title={`Actor portfolio for @${session.username}`} description="Current view shows open order exposure grouped by market and outcome for the signed-in actor session." />
      <div className="inline">
        <Badge tone="accent">Signed in</Badge>
        <Badge>{session.actorId}</Badge>
        <Badge>{positions.length} position groups</Badge>
        <Badge>{openOrders.length} open orders</Badge>
      </div>

      {positions.length ? (
        <TableShell
          columns={["Market", "Outcome", "Open buys", "Open sells"]}
          rows={positions.map((position) => [
            position.marketSlug,
            position.outcomeId,
            String(position.openBuyQuantity),
            String(position.openSellQuantity)
          ])}
        />
      ) : (
        <EmptyState title="No open position groups" description="This actor has no currently open buy or sell exposure in the order system." />
      )}

      <Card title="Open orders" eyebrow="Live actor scope">
        {openOrders.length ? (
          <div className="stack" style={{ gap: 10 }}>
            {openOrders.map((order) => (
              <div key={order.id}>
                {order.marketSlug} · {order.outcomeId} · {order.side} · qty {order.quantity} @ {order.limitPrice.toFixed(2)}
              </div>
            ))}
          </div>
        ) : (
          <div>No open orders for this actor.</div>
        )}
      </Card>
    </div>
  );
}
