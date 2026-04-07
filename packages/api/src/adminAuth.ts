import crypto from "node:crypto";

export const ADMIN_SESSION_COOKIE = "menamarket_admin_session";

type SessionPayload = {
  username: string;
  issuedAtIso: string;
};

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getAdminLoginUsername(): string {
  return requiredEnv("ADMIN_LOGIN_USERNAME");
}

export function getAdminLoginPassword(): string {
  const password = requiredEnv("ADMIN_LOGIN_PASSWORD");
  if (process.env.NODE_ENV === "production") {
    const WEAK_DEFAULTS = new Set(["change-me", "changeme", "password", "admin", "12345678", "secret"]);
    if (WEAK_DEFAULTS.has(password.toLowerCase())) {
      throw new Error("ADMIN_LOGIN_PASSWORD must not use a default or well-known weak value in production.");
    }
    if (password.length < 12) {
      throw new Error("ADMIN_LOGIN_PASSWORD must be at least 12 characters in production.");
    }
  }
  return password;
}

export function getAdminSessionSecret(): string {
  const secret = requiredEnv("ADMIN_SESSION_SECRET");
  if (process.env.NODE_ENV === "production") {
    if (secret.startsWith("replace-with-a-")) {
      throw new Error("ADMIN_SESSION_SECRET must not use a placeholder value in production.");
    }
    if (secret.length < 32) {
      throw new Error("ADMIN_SESSION_SECRET must be at least 32 characters in production.");
    }
  }
  return secret;
}

export function getAdminSessionMaxAgeSeconds(): number {
  const raw = process.env.ADMIN_SESSION_MAX_AGE_SECONDS ?? "43200";
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error("Invalid ADMIN_SESSION_MAX_AGE_SECONDS.");
  }
  return parsed;
}

export function validateAdminCredentials(input: unknown): { username: string; password: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Login payload must be an object.");
  }
  const value = input as Record<string, unknown>;
  if (typeof value.username !== "string" || value.username.trim().length === 0) {
    throw new Error("Invalid field: username");
  }
  if (typeof value.password !== "string" || value.password.trim().length === 0) {
    throw new Error("Invalid field: password");
  }
  return { username: value.username, password: value.password };
}

export function authenticateAdmin(input: unknown): { username: string } {
  const payload = validateAdminCredentials(input);
  const expectedUsername = getAdminLoginUsername();
  const expectedPassword = getAdminLoginPassword();

  if (payload.username !== expectedUsername || payload.password !== expectedPassword) {
    throw new Error("Invalid admin credentials.");
  }

  return { username: payload.username };
}

function sign(data: string): string {
  return crypto.createHmac("sha256", getAdminSessionSecret()).update(data).digest("hex");
}

export function createAdminSessionToken(username: string): string {
  const payload: SessionPayload = {
    username,
    issuedAtIso: new Date().toISOString()
  };
  const raw = Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url");
  const signature = sign(raw);
  return `${raw}.${signature}`;
}

export function verifyAdminSessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return null;
  }
  const separatorIndex = token.lastIndexOf(".");
  if (separatorIndex <= 0 || separatorIndex === token.length - 1) {
    return null;
  }

  const raw = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);
  if (!raw || !signature) {
    return null;
  }
  const expected = sign(raw);
  if (signature !== expected) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf-8")) as SessionPayload;
    if (!parsed.username || !parsed.issuedAtIso) {
      return null;
    }
    const issued = Date.parse(parsed.issuedAtIso);
    if (!Number.isFinite(issued)) {
      return null;
    }
    const ageSeconds = Math.floor((Date.now() - issued) / 1000);
    if (ageSeconds > getAdminSessionMaxAgeSeconds()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function isProtectedAdminPath(pathname: string): boolean {
  if (pathname === "/login") return false;
  if (pathname.startsWith("/api/admin-auth/")) return false;
  return pathname === "/" ||
    pathname.startsWith("/market-ops") ||
    pathname.startsWith("/audit") ||
    pathname.startsWith("/api/market-") ||
    pathname.startsWith("/api/audit");
}
