import { cookies } from "next/headers";
import type { Metadata } from "next";
import { Badge, Card, EmptyState, PageHeader, TableShell } from "@menamarket/ui";
import { ACTOR_SESSION_COOKIE, getActorPositions, getLedgerAccount, listOrders, verifyActorSessionToken } from "@menamarket/api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portfolio — MENAMarket",
  description: "View your open positions, order exposure, and account balance."
};

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

  const [positions, openOrders, ledgerAccount] = await Promise.all([
    getActorPositions(session.actorId),
    listOrders({ actorId: session.actorId, status: "open" }),
    getLedgerAccount(session.actorId)
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

      {ledgerAccount ? (
        <div className="card-grid">
          <Card title="Cash balance" eyebrow="Ledger">
            <div className="stack" style={{ gap: 8 }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 600, color: "#edf3fb" }}>
                {ledgerAccount.cashBalance.toFixed(2)} <span style={{ fontSize: "0.75rem", color: "#94a9c0" }}>units</span>
              </div>
              <div>Reserved: {ledgerAccount.cashReserved.toFixed(2)} units</div>
              <div>Available: {(ledgerAccount.cashBalance - ledgerAccount.cashReserved).toFixed(2)} units</div>
            </div>
          </Card>
          <Card title="Holdings" eyebrow="Ledger">
            {ledgerAccount.holdings.length ? (
              <div className="stack" style={{ gap: 8 }}>
                {ledgerAccount.holdings.map((holding) => (
                  <div key={`${holding.marketSlug}:${holding.outcomeId}`}>
                    {holding.marketSlug} · {holding.outcomeId} · qty {holding.quantity}
                    {holding.reservedQuantity > 0 ? ` (${holding.reservedQuantity} reserved)` : ""}
                  </div>
                ))}
              </div>
            ) : (
              <div>No holdings on record.</div>
            )}
          </Card>
          <Card title="Account updated" eyebrow="Ledger">
            {new Date(ledgerAccount.updatedAtIso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
          </Card>
        </div>
      ) : (
        <EmptyState title="No ledger account" description="No ledger account is linked to this actor. Fund your account to create a ledger record." action={<a href="/funding">Go to funding →</a>} />
      )}

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
