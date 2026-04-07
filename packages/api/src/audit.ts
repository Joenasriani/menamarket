import fs from "node:fs/promises";
import path from "node:path";

export type AuditEntry = {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  timestampIso: string;
  metadata: Record<string, unknown>;
};

export type AuditLog = {
  entries: AuditEntry[];
};

export type AuditFilters = {
  action?: string;
  targetType?: string;
  targetId?: string;
  q?: string;
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function validateAuditLog(input: unknown): AuditLog {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Audit log must be an object.");
  }

  const value = input as Record<string, unknown>;
  if (!Array.isArray(value.entries)) {
    throw new Error("Audit log must contain an entries array.");
  }

  return {
    entries: value.entries.map((item) => {
      const entry = item as Record<string, unknown>;
      if (
        typeof entry.id !== "string" ||
        typeof entry.action !== "string" ||
        typeof entry.targetType !== "string" ||
        typeof entry.targetId !== "string" ||
        typeof entry.timestampIso !== "string" ||
        !entry.metadata ||
        typeof entry.metadata !== "object" ||
        Array.isArray(entry.metadata)
      ) {
        throw new Error("Invalid audit entry.");
      }

      return {
        id: entry.id,
        action: entry.action,
        targetType: entry.targetType,
        targetId: entry.targetId,
        timestampIso: entry.timestampIso,
        metadata: entry.metadata as Record<string, unknown>
      };
    })
  };
}

export async function readAuditLog(): Promise<AuditLog> {
  const filePath = path.resolve(process.cwd(), "data/audit-log.json");
  const contents = await fs.readFile(filePath, "utf-8");
  return validateAuditLog(JSON.parse(contents));
}

export async function listAuditEntries(filters: AuditFilters = {}): Promise<AuditEntry[]> {
  const log = await readAuditLog();

  return [...log.entries]
    .sort((a, b) => a.timestampIso.localeCompare(b.timestampIso))
    .reverse()
    .filter((entry) => {
      if (filters.action && normalize(entry.action) !== normalize(filters.action)) {
        return false;
      }
      if (filters.targetType && normalize(entry.targetType) !== normalize(filters.targetType)) {
        return false;
      }
      if (filters.targetId && normalize(entry.targetId) !== normalize(filters.targetId)) {
        return false;
      }
      if (filters.q) {
        const haystack = [
          entry.action,
          entry.targetType,
          entry.targetId,
          entry.timestampIso,
          JSON.stringify(entry.metadata)
        ].map(normalize).join(" ");
        if (!haystack.includes(normalize(filters.q))) {
          return false;
        }
      }
      return true;
    });
}

export async function auditFacetSummary(): Promise<{
  total: number;
  actions: { value: string; count: number }[];
  targetTypes: { value: string; count: number }[];
}> {
  const entries = await listAuditEntries();
  const summarize = (items: string[]) => {
    const counts = new Map<string, number>();
    for (const value of items) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value.localeCompare(b.value));
  };

  return {
    total: entries.length,
    actions: summarize(entries.map((entry) => entry.action)),
    targetTypes: summarize(entries.map((entry) => entry.targetType))
  };
}
