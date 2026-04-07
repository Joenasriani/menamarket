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
            <span>© {new Date().getFullYear()} MENAMarket — MENA-focused prediction market infrastructure</span>
            <span style={{display: "flex", gap: 16}}>
              <a href="/about">About</a>
              <a href="/compliance">Compliance</a>
              <a href="/markets">Markets</a>
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
