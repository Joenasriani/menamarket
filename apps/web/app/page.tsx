import { Badge, Button, Card } from "@menamarket/ui";
import { listPublicMarkets } from "@menamarket/api";
import type { MarketCatalogRecord } from "@menamarket/api";
import { PreviewNotice } from "./preview-notice";

export const dynamic = "force-dynamic";

/** Renders a compact probability bar for one outcome. */
function ProbBar({ label, probability }: { label: string; probability: number }) {
  const pct = Math.round(probability * 100);
  const isYes = label.toLowerCase() === "yes";
  const barColor = isYes ? "#37c3a6" : "rgba(255,255,255,0.12)";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a9c0" }}>
        <span>{label}</span>
        <span style={{ color: isYes ? "#8ce6d6" : "#edf3fb", fontWeight: 600 }}>{pct}¢</span>
      </div>
      <div style={{ height: 5, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: barColor, transition: "width 400ms ease" }} />
      </div>
    </div>
  );
}

/** Single market card — shows question, outcome probabilities, and metadata. */
function MarketCard({ market }: { market: MarketCatalogRecord }) {
  const isBinary = market.outcomeType === "binary";
  const displayOutcomes = isBinary ? market.outcomes : market.outcomes.slice(0, 3);
  const closeDate = new Date(market.closeTimeIso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const statusTone = market.status === "open" ? "accent" : market.status === "halted" ? "warning" : "neutral";

  return (
    <a
      href={`/markets/${market.slug}`}
      style={{ textDecoration: "none", color: "inherit", display: "block" }}
      aria-label={`Open market: ${market.question}`}
    >
      <div style={{
        background: "rgba(10, 23, 36, 0.82)",
        border: "1px solid rgba(125, 161, 196, 0.18)",
        borderRadius: 22,
        padding: 22,
        boxShadow: "0 20px 40px rgba(0,0,0,0.16)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        height: "100%",
        transition: "border-color 150ms ease",
      }}>
        {/* Category eyebrow */}
        <div style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: "#94a9c0" }}>
          {market.category}
        </div>

        {/* Question */}
        <div style={{ fontSize: "1rem", fontWeight: 600, lineHeight: 1.45, color: "#edf3fb" }}>
          {market.question}
        </div>

        {/* Outcome probability bars */}
        <div style={{ display: "flex", flexDirection: isBinary ? "row" : "column", gap: isBinary ? 14 : 8 }}>
          {displayOutcomes.map((outcome) => (
            <ProbBar key={outcome.id} label={outcome.label} probability={outcome.probability} />
          ))}
          {!isBinary && market.outcomes.length > 3 && (
            <div style={{ fontSize: 12, color: "#94a9c0" }}>+{market.outcomes.length - 3} more outcomes</div>
          )}
        </div>

        {/* Metadata row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: "auto" }}>
          <Badge tone={statusTone}>{market.status}</Badge>
          <Badge>{market.jurisdiction}</Badge>
        </div>

        {/* Close date */}
        <div style={{ fontSize: 12, color: "#94a9c0" }}>Closes {closeDate}</div>
      </div>
    </a>
  );
}

export default async function HomePage() {
  const markets = await listPublicMarkets();
  const openMarkets = markets.filter((m) => m.status === "open");
  const featuredMarkets = openMarkets.slice(0, 6);
  const categories = [...new Set(markets.map((m) => m.category))];
  const jurisdictions = [...new Set(markets.map((m) => m.jurisdiction))];

  return (
    <div className="stack">
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-copy">
          <Badge tone="accent">MENA-focused prediction markets</Badge>
          <h1>Bet on the future of the MENA region.</h1>
          <p>
            Browse real prediction markets covering finance, technology,
            infrastructure, and geopolitics across Saudi Arabia, UAE, Egypt, Qatar,
            Morocco, Jordan, and the GCC — no account required to browse.
          </p>
          <div className="pill-row">
            <Button href="/markets">Browse all markets</Button>
            <Button href="/about" variant="secondary">About MENAMarket</Button>
          </div>
          <div className="stats-grid">
            <Card title={`${openMarkets.length} open`} eyebrow="Live markets">
              Active prediction markets with real outcomes and live pricing.
            </Card>
            <Card title={`${categories.length} categories`} eyebrow="Coverage">
              {categories.join(", ")}.
            </Card>
            <Card title={`${jurisdictions.length} jurisdictions`} eyebrow="Regions">
              {jurisdictions.join(", ")}.
            </Card>
          </div>
        </div>

        <aside className="hero-panel stack">
          <div style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: "#94a9c0" }}>
            How it works
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { n: "1", title: "Browse markets", body: "Explore public markets freely — no login needed. See live odds, outcomes, and probabilities." },
              { n: "2", title: "Sign up when ready", body: "User accounts and trading are coming soon. Sign-up and funding features will be activated in a future release." },
              { n: "3", title: "Track your positions", body: "Once accounts are live, view your portfolio, open orders, and ledger balance in your account dashboard." },
            ].map(({ n, title, body }) => (
              <div key={n} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 28, height: 28, borderRadius: 999, background: "linear-gradient(135deg,#37c3a6,#4aa3ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#08131f", flexShrink: 0 }}>{n}</div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: 13, color: "#94a9c0", lineHeight: 1.6 }}>{body}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      {/* ── Featured Markets ───────────────────────────────────────────── */}
      {featuredMarkets.length > 0 && (
        <section className="section">
          <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h2 style={{ margin: "0 0 6px" }}>Live markets</h2>
              <p style={{ margin: 0, color: "#94a9c0" }}>
                Browse open prediction markets. Prices shown in cents (¢). No sign-in required.
              </p>
            </div>
            <a href="/markets" style={{ color: "#8ce6d6", fontWeight: 600, fontSize: 14, whiteSpace: "nowrap" }}>
              View all markets →
            </a>
          </div>
          <div className="card-grid">
            {featuredMarkets.map((market) => (
              <MarketCard key={market.slug} market={market} />
            ))}
          </div>
        </section>
      )}

      {/* ── Browse by Category ─────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2>Browse by category</h2>
            <p>Filter markets by topic to find what you're interested in.</p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {categories.map((cat) => (
              <a key={cat} href={`/markets?category=${encodeURIComponent(cat)}`}>
                <Badge>{cat}</Badge>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── Platform Links ─────────────────────────────────────────────── */}
      <section className="section">
        <div className="section-header">
          <h2>Explore the platform</h2>
          <p>Browse markets and track activity. Account features are coming soon.</p>
        </div>
        <PreviewNotice message="Public preview — market browsing is available now. Portfolio, funding, and trading features will be enabled once user accounts are live." />
        <div className="card-grid" style={{ marginTop: 16 }}>
          <Card title="All markets" eyebrow="Available now">
            Search and filter prediction markets by category, jurisdiction, and status.
            <div className="card-action-link"><a href="/markets">Browse all markets →</a></div>
          </Card>
          <Card title="Activity feed" eyebrow="Available now">
            Track live market activity including new orders, fills, and state changes.
            <div className="card-action-link"><a href="/activity">View activity →</a></div>
          </Card>
          <Card title="Portfolio" eyebrow="Coming soon">
            View open positions, pending orders, and account balance. Available once user accounts are live.
          </Card>
        </div>
      </section>
    </div>
  );
}
