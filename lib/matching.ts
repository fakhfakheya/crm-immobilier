import { Lead, Property } from "@/app/generated/prisma/client";

export type MatchResult = {
  property: Property;
  score: number;
  penalties: string[];
};

export function computeMatchScore(lead: Lead, property: Property): MatchResult {
  let score = 100;
  const penalties: string[] = [];

  // Pénalité budget
  if (lead.budgetMin != null && property.price < lead.budgetMin) {
    const gap = lead.budgetMin - property.price;
    const percent = Math.min(30, Math.round((gap / lead.budgetMin) * 100));
    score -= percent;
    penalties.push(`-${percent}% (en dessous du budget min)`);
  }

  if (lead.budgetMax != null && property.price > lead.budgetMax) {
    const gap = property.price - lead.budgetMax;
    const percent = Math.min(40, Math.round((gap / lead.budgetMax) * 100));
    score -= percent;
    penalties.push(`-${percent}% (dépasse le budget max)`);
  }

  return {
    property,
    score: Math.max(0, Math.round(score)),
    penalties,
  };
}

export function getTopMatches(
  lead: Lead,
  properties: Property[],
  limit = 5
): MatchResult[] {
  const available = properties.filter((p) => p.status === "AVAILABLE");

  return available
    .map((property) => computeMatchScore(lead, property))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}