import type { Metadata } from "next";
import "./globals.css";
import { NavShell } from "./nav-shell";

export const metadata: Metadata = {
  title: "MENAMarket",
  description: "MENA-focused prediction market infrastructure under staged development."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <NavShell />
        </header>
        <main className="shell">{children}</main>
        <footer className="footer">
          <div className="shell inline" style={{justifyContent: "space-between"}}>
            <span>Staged MENAMarket prototype with public markets, auth, order books, ledger, matching, settlement, activity feed, and wallet rails.</span>
            <span>Stage: M20 wallet rails abstraction</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
