"use client";

import { useEffect, useState } from "react";

type SessionResponse = {
  session?: {
    actorId: string;
    username: string;
    issuedAtIso: string;
  } | null;
};

const guestNavItems = [
  ["Home", "/"],
  ["Markets", "/markets"],
  ["Activity", "/activity"],
  ["Funding", "/funding"],
  ["Portfolio", "/portfolio"],
  ["Login", "/login"],
  ["Signup", "/signup"],
  ["Compliance", "/compliance"],
  ["About", "/about"]
] as const;

const signedInNavItems = [
  ["Home", "/"],
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
      <nav className="nav-links" aria-label="Primary navigation">
        {navItems.map(([label, href]) => (
          <a className="nav-link" key={href} href={href}>
            {label}
          </a>
        ))}
        {loaded && session ? (
          <>
            <span className="nav-link" aria-label="Signed in actor">@{session.username}</span>
            <button className="nav-link nav-button" onClick={signOut} type="button">Sign out</button>
          </>
        ) : null}
      </nav>
    </div>
  );
}
