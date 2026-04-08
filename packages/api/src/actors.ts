import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

export type ActorRecord = {
  id: string;
  username: string;
  passwordHash: string;
  displayName?: string;
  createdAtIso: string;
  updatedAtIso: string;
};

export type ActorCatalog = {
  actors: ActorRecord[];
};

export type SignupInput = {
  username: string;
  password: string;
  displayName?: string;
};

export type LoginInput = {
  username: string;
  password: string;
};

function isIsoDateTime(value: string): boolean {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && value.includes("T");
}

function assertString(value: unknown, field: string, minLength = 1): asserts value is string {
  if (typeof value !== "string" || value.trim().length < minLength) {
    throw new Error(`Invalid field: ${field}`);
  }
}

export function validateActorCatalog(input: unknown): ActorCatalog {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Actor catalog must be an object.");
  }
  const value = input as Record<string, unknown>;
  if (!Array.isArray(value.actors)) {
    throw new Error("Actor catalog must contain an actors array.");
  }

  const actors = value.actors.map((item) => {
    const actor = item as Record<string, unknown>;
    if (
      typeof actor.id !== "string" ||
      typeof actor.username !== "string" ||
      actor.username.trim().length < 3 ||
      typeof actor.passwordHash !== "string" ||
      actor.passwordHash.trim().length === 0 ||
      (actor.displayName !== undefined && typeof actor.displayName !== "string") ||
      typeof actor.createdAtIso !== "string" ||
      !isIsoDateTime(actor.createdAtIso) ||
      typeof actor.updatedAtIso !== "string" ||
      !isIsoDateTime(actor.updatedAtIso)
    ) {
      throw new Error("Invalid actor record.");
    }
    return actor as ActorRecord;
  });

  return { actors };
}

async function readActorCatalog(): Promise<ActorCatalog> {
  const filePath = path.resolve(process.cwd(), "data/actors.json");
  return validateActorCatalog(JSON.parse(await fs.readFile(filePath, "utf-8")));
}

async function writeActorCatalog(next: ActorCatalog): Promise<void> {
  const filePath = path.resolve(process.cwd(), "data/actors.json");
  try {
    await fs.writeFile(filePath, JSON.stringify(next, null, 2) + "\n", "utf-8");
  } catch (err) {
    const isReadOnly = err instanceof Error &&
      (err.message.includes("EROFS") || err.message.includes("read-only"));
    throw new Error(
      isReadOnly
        ? "Persistent writes are unavailable in this deployment. Connect a database to enable trading."
        : (err instanceof Error ? err.message : "Write failed.")
    );
  }
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derived}`;
}

function verifyPassword(password: string, stored: string): boolean {
  if (stored.startsWith("scrypt:")) {
    const parts = stored.split(":");
    if (parts.length !== 3) return false;
    const salt = parts[1]!;
    const hash = parts[2]!;
    const derived = crypto.scryptSync(password, salt, 64).toString("hex");
    const derivedBuf = Buffer.from(derived, "hex");
    const hashBuf = Buffer.from(hash, "hex");
    if (derivedBuf.length !== hashBuf.length) return false;
    return crypto.timingSafeEqual(derivedBuf, hashBuf);
  }
  // Legacy SHA-256 fallback for any pre-existing actors (deprecated; will be removed once all accounts migrate)
  const legacy = crypto.createHash("sha256").update(password).digest("hex");
  const legacyBuf = Buffer.from(legacy, "hex");
  const storedBuf = Buffer.from(stored, "hex");
  if (legacyBuf.length !== storedBuf.length) return false;
  return crypto.timingSafeEqual(legacyBuf, storedBuf);
}

export function validateSignupInput(input: unknown): SignupInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Signup input must be an object.");
  }
  const value = input as Record<string, unknown>;
  assertString(value.username, "username", 3);
  assertString(value.password, "password", 8);
  if (!/^[a-zA-Z0-9_-]+$/.test(value.username)) {
    throw new Error("Invalid field: username");
  }
  if (value.displayName !== undefined && typeof value.displayName !== "string") {
    throw new Error("Invalid field: displayName");
  }
  return {
    username: value.username,
    password: value.password,
    ...(value.displayName !== undefined && { displayName: value.displayName as string })
  };
}

export function validateLoginInput(input: unknown): LoginInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Login input must be an object.");
  }
  const value = input as Record<string, unknown>;
  assertString(value.username, "username", 3);
  assertString(value.password, "password", 8);
  return { username: value.username, password: value.password };
}

export async function listActors(): Promise<ActorRecord[]> {
  const catalog = await readActorCatalog();
  return [...catalog.actors].sort((a, b) => a.username.localeCompare(b.username));
}

export async function getActorByUsername(username: string): Promise<ActorRecord | null> {
  const catalog = await readActorCatalog();
  return catalog.actors.find((actor) => actor.username === username) ?? null;
}

export async function createActor(input: unknown): Promise<ActorRecord> {
  const validated = validateSignupInput(input);
  const catalog = await readActorCatalog();

  if (catalog.actors.some((actor) => actor.username === validated.username)) {
    throw new Error("Username already exists.");
  }

  const now = new Date().toISOString();
  const actor: ActorRecord = {
    id: `actor_${crypto.randomBytes(8).toString("hex")}`,
    username: validated.username,
    passwordHash: hashPassword(validated.password),
    ...(validated.displayName !== undefined && { displayName: validated.displayName }),
    createdAtIso: now,
    updatedAtIso: now
  };

  await writeActorCatalog({ actors: [...catalog.actors, actor] });
  return actor;
}

export async function authenticateActor(input: unknown): Promise<ActorRecord> {
  const validated = validateLoginInput(input);
  const actor = await getActorByUsername(validated.username);
  if (!actor) throw new Error("Invalid actor credentials.");

  if (!verifyPassword(validated.password, actor.passwordHash)) {
    throw new Error("Invalid actor credentials.");
  }

  return actor;
}

export async function getActorById(id: string): Promise<ActorRecord | null> {
  const catalog = await readActorCatalog();
  return catalog.actors.find((actor) => actor.id === id) ?? null;
}

export type SupabaseUserInput = {
  id: string;
  email: string;
  username?: string;
};

function deriveUsernameFromEmail(email: string): string {
  const prefix = email.split("@")[0] ?? "user";
  const sanitized = prefix.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30);
  return sanitized.length >= 3 ? sanitized : `user_${sanitized}`.slice(0, 30);
}

/**
 * Finds an existing actor by Supabase user ID or creates a new one.
 * Used after Supabase authentication to bridge Supabase identity with
 * the local actor record required by the order/position system.
 */
export async function upsertActorFromSupabase(input: SupabaseUserInput): Promise<ActorRecord> {
  const existing = await getActorById(input.id);
  if (existing) return existing;

  const catalog = await readActorCatalog();
  const existingUsernames = new Set(catalog.actors.map((a) => a.username));

  const base = input.username
    ? input.username.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30)
    : deriveUsernameFromEmail(input.email);

  let username = base;
  let suffix = 1;
  while (existingUsernames.has(username)) {
    username = `${base}${suffix}`;
    suffix++;
  }

  const now = new Date().toISOString();
  const actor: ActorRecord = {
    id: input.id,
    username,
    passwordHash: "supabase:no-local-password",
    createdAtIso: now,
    updatedAtIso: now
  };

  await writeActorCatalog({ actors: [...catalog.actors, actor] });
  return actor;
}
