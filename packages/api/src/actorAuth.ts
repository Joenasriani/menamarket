import crypto from "node:crypto";
import type { ActorRecord } from "./actors.js";

export const ACTOR_SESSION_COOKIE = "menamarket_actor_session";

type ActorSessionPayload = {
  actorId: string;
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

export function getActorSessionSecret(): string {
  return requiredEnv("ACTOR_SESSION_SECRET");
}

export function getActorSessionMaxAgeSeconds(): number {
  const raw = process.env.ACTOR_SESSION_MAX_AGE_SECONDS ?? "2592000";
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error("Invalid ACTOR_SESSION_MAX_AGE_SECONDS.");
  }
  return parsed;
}

function sign(data: string): string {
  return crypto.createHmac("sha256", getActorSessionSecret()).update(data).digest("hex");
}

export function createActorSessionToken(actor: Pick<ActorRecord, "id" | "username">): string {
  const payload: ActorSessionPayload = {
    actorId: actor.id,
    username: actor.username,
    issuedAtIso: new Date().toISOString()
  };
  const raw = Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url");
  const signature = sign(raw);
  return `${raw}.${signature}`;
}

export function verifyActorSessionToken(token: string | undefined | null): ActorSessionPayload | null {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return null;
  }
  const separatorIndex = token.lastIndexOf(".");
  if (separatorIndex <= 0 || separatorIndex === token.length - 1) return null;

  const raw = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);
  if (!raw || !signature) return null;

  const expected = sign(raw);
  if (signature !== expected) return null;

  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf-8")) as ActorSessionPayload;
    if (!parsed.actorId || !parsed.username || !parsed.issuedAtIso) return null;

    const issued = Date.parse(parsed.issuedAtIso);
    if (!Number.isFinite(issued)) return null;

    const ageSeconds = Math.floor((Date.now() - issued) / 1000);
    if (ageSeconds > getActorSessionMaxAgeSeconds()) return null;

    return parsed;
  } catch {
    return null;
  }
}
