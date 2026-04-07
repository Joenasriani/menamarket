import {
  filterPublicMarkets,
  getPublicMarketBySlug,
  getResolutionByMarketSlug,
  isDiscoveryStatus,
  listDiscoverySummary
} from "./index.js";
import { getPublicMarketPricing } from "./pricing.js";

export type PublicMarketQuery = {
  q?: string;
  category?: string;
  jurisdiction?: string;
  status?: string;
  page?: number;
  pageSize?: number;
};

export function parsePageNumber(value: string | null | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function listPublicMarketsApi(query: PublicMarketQuery) {
  const status = isDiscoveryStatus(query.status) ? query.status : undefined;
  const page = query.page && query.page > 0 ? query.page : 1;
  const pageSize = query.pageSize && query.pageSize > 0 ? Math.min(query.pageSize, 100) : 20;

  const filtered = await filterPublicMarkets({
    ...(query.q !== undefined && { q: query.q }),
    ...(query.category !== undefined && { category: query.category }),
    ...(query.jurisdiction !== undefined && { jurisdiction: query.jurisdiction }),
    ...(status !== undefined && { status })
  });

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return { items, pagination: { page, pageSize, total, pageCount } };
}

export async function getPublicMarketApi(slug: string) {
  const market = await getPublicMarketBySlug(slug);
  const resolution = await getResolutionByMarketSlug(slug);
  const pricing = await getPublicMarketPricing(slug);
  return { market, resolution, pricing };
}

export async function getPublicStatusApi(slug: string) {
  const market = await getPublicMarketBySlug(slug);
  const resolution = await getResolutionByMarketSlug(slug);
  if (!market) return null;

  return {
    slug: market.slug,
    status: market.status,
    closeTimeIso: market.closeTimeIso,
    resolutionState: resolution ? "resolved" : market.status === "awaiting_resolution" ? "awaiting_resolution" : "unresolved",
    outcome: resolution?.outcome ?? null,
    updatedAtIso: market.updatedAtIso
  };
}

export async function getPublicDiscoveryApi() {
  return listDiscoverySummary();
}
