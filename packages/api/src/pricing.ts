import { getPublicMarketBySlug } from "./markets.js";

export async function getPublicMarketPricing(slug: string) {
  const market = await getPublicMarketBySlug(slug);
  if (!market) return null;

  return {
    slug: market.slug,
    outcomeType: market.outcomeType,
    priceUpdatedAtIso: market.priceUpdatedAtIso ?? market.updatedAtIso,
    outcomes: market.outcomes
  };
}
