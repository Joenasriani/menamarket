"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "./lib/supabase/client";

type SessionResponse = {
  session?: {
    actorId: string;
    username: string;
    issuedAtIso: string;
  } | null;
};

const guestNavItems = [
  ["Markets", "/markets"],
  ["Activity", "/activity"],
  ["Compliance", "/compliance"],
  ["About", "/about"]
] as const;

const signedInNavItems = [
  ["Markets", "/markets"],
  ["Activity", "/activity"],
  ["Funding", "/funding"],
  ["Portfolio", "/portfolio"],
  ["Compliance", "/compliance"],
  ["About", "/about"]
] as const;

export function NavShell() {
  const [session, setSession] = useState<SessionResponse["session"]>(null);
  const [loaded, setLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch("/api/public/auth/session", { cache: "no-store" });
        const data = await response.json() as SessionResponse;
        if (!cancelled) setSession(data.session ?? null);
      } catch {
        if (!cancelled) setSession(null);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function signOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    await fetch("/api/public/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  const navItems = session ? signedInNavItems : guestNavItems;

  return (
    <div className="shell site-header-inner">
      <a href="/" className="brand">
        <span className="brand-mark" aria-hidden="true" />
        <span>MENAMarket</span>
      </a>
      <button
        className="hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        type="button"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
      >
        <span className={`hamburger-bar ${menuOpen ? "hamburger-bar--open" : ""}`} />
      </button>
      <nav className={`nav-links ${menuOpen ? "nav-links--open" : ""}`} aria-label="Primary navigation">
        {navItems.map(([label, href]) => (
          <a className="nav-link" key={href} href={href} onClick={() => setMenuOpen(false)}>
            {label}
          </a>
        ))}
        {loaded && session ? (
          <>
            <span className="nav-link nav-link--user" aria-label="Signed in actor">@{session.username}</span>
            <button className="nav-link nav-button" onClick={signOut} type="button">Sign out</button>
          </>
        ) : loaded && !session ? (
          <>
            <a className="nav-link nav-link--auth" href="/login" onClick={() => setMenuOpen(false)}>Log in</a>
            <a className="nav-link nav-link--signup" href="/signup" onClick={() => setMenuOpen(false)}>Sign up</a>
          </>
        ) : null}
      </nav>
    </div>
  );
}
