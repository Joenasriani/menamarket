import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MENAMarket Admin",
  description: "Admin shell for MENAMarket market operations."
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="admin-shell">
          <aside className="admin-sidebar">
            <a href="/" className="brand">
              <span className="brand-mark" aria-hidden="true" />
              <span>MENAMarket Admin</span>
            </a>
            <nav className="admin-nav" aria-label="Admin navigation">
              <a href="/">Overview</a>
              <a href="/market-ops">Market Ops</a>
              <a href="/market-ops/catalog">Catalog</a>
              <a href="/market-ops/drafts">Drafts</a>
              <a href="/market-ops/review">Review & Publish</a>
              <a href="/market-ops/lifecycle">Lifecycle</a>
              <a href="/audit">Audit</a>
              <a href="/market-ops/create">Create Draft</a>
            </nav>
          </aside>
          <main className="admin-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
