import { listPublicMarkets, type MarketCatalogRecord, MARKET_STATUSES, type MarketStatus } from "./markets.js";

export type MarketDiscoveryFilters = {
  q?: string;
  category?: string;
  jurisdiction?: string;
  status?: MarketStatus;
};

export type DiscoveryFacet = {
  value: string;
  count: number;
};

export type DiscoverySummary = {
  total: number;
  categories: DiscoveryFacet[];
  jurisdictions: DiscoveryFacet[];
  statuses: DiscoveryFacet[];
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function toFacet(values: string[]): DiscoveryFacet[] {
  const counts = new Map<string, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value));
}

export async function listDiscoverySummary(): Promise<DiscoverySummary> {
  const markets = await listPublicMarkets();
  return {
    total: markets.length,
    categories: toFacet(markets.map((market) => market.category)),
    jurisdictions: toFacet(markets.map((market) => market.jurisdiction)),
    statuses: toFacet(markets.map((market) => market.status))
  };
}

export async function filterPublicMarkets(filters: MarketDiscoveryFilters): Promise<MarketCatalogRecord[]> {
  const markets = await listPublicMarkets();

  return markets.filter((market) => {
    if (filters.q) {
      const haystack = [
        market.question,
        market.category,
        market.jurisdiction,
        market.description ?? "",
        market.resolutionSource,
        market.notes ?? ""
      ].map(normalize).join(" ");
      if (!haystack.includes(normalize(filters.q))) {
        return false
      }
    }

    if (filters.category && normalize(market.category) !== normalize(filters.category)) {
      return false
    }

    if (filters.jurisdiction && normalize(market.jurisdiction) !== normalize(filters.jurisdiction)) {
      return false
    }

    if (filters.status && market.status !== filters.status) {
      return false
    }

    return true
  });
}

export function isDiscoveryStatus(value: string | undefined): value is MarketStatus {
  if (!value) return false;
  return MARKET_STATUSES.includes(value as MarketStatus);
}
