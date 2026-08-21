import type {
  Lead,
  LeadActivity,
  LeadScoreResult,
  Property,
} from "@/lib/types";

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function statusTimeline(status: Lead["status"]) {
  switch (status) {
    case "New":
      return 8;
    case "Contacted":
      return 14;
    case "Viewing":
      return 18;
    case "Negotiating":
      return 20;
    case "Won":
      return 22;
    case "Lost":
      return 4;
  }
}

export function scoreLead(
  lead: Lead,
  properties: Property[],
  activities: LeadActivity[],
): LeadScoreResult {
  const related = properties.filter((p) => {
    if (lead.interestedPropertyId && p.id === lead.interestedPropertyId) return true;
    return p.city === lead.preferredLocation && p.propertyType === lead.propertyType;
  });
  const primary =
    properties.find((p) => p.id === lead.interestedPropertyId) ?? related[0];

  let budgetFit = 10;
  if (primary) {
    if (primary.price >= lead.budgetMin && primary.price <= lead.budgetMax) budgetFit = 22;
    else if (primary.price <= lead.budgetMax * 1.1 && primary.price >= lead.budgetMin * 0.85)
      budgetFit = 16;
    else if (primary.price > lead.budgetMax) budgetFit = 6;
    else budgetFit = 12;
  } else {
    budgetFit = lead.budgetMax >= 1_000_000 ? 12 : 8;
  }

  const locationFit = primary
    ? primary.city === lead.preferredLocation
      ? 16
      : 6
    : properties.some((p) => p.city === lead.preferredLocation)
      ? 12
      : 5;

  const preferenceFit = primary
    ? primary.propertyType === lead.propertyType
      ? 14
      : 6
    : 8;

  const recentActs = activities.filter((a) => a.leadId === lead.id);
  const engagement = clamp(recentActs.length * 4, 0, 16);

  const timeline = statusTimeline(lead.status);

  const last = lead.lastContactedAt ? Date.parse(lead.lastContactedAt) : 0;
  const daysSince = last ? (Date.parse("2026-08-18T10:00:00.000Z") - last) / 86_400_000 : 99;
  const interactions =
    lead.status === "Lost"
      ? 2
      : last === 0
        ? 4
        : daysSince <= 3
          ? 12
          : daysSince <= 10
            ? 8
            : 5;

  const score = clamp(
    budgetFit + locationFit + preferenceFit + engagement + timeline + interactions,
  );

  const reasons: string[] = [];
  if (primary && primary.price >= lead.budgetMin && primary.price <= lead.budgetMax) {
    reasons.push("budget aligns with the listed price");
  } else if (primary && primary.price > lead.budgetMax) {
    reasons.push("listed price sits above the stated budget");
  } else {
    reasons.push("budget is directionally consistent with inventory in this band");
  }
  if (primary?.city === lead.preferredLocation) reasons.push(`location matches ${lead.preferredLocation}`);
  if (primary?.propertyType === lead.propertyType)
    reasons.push(`preference for ${lead.propertyType.toLowerCase()}s is met`);
  if (recentActs.length >= 2) reasons.push(`${recentActs.length} recorded interactions`);
  if (lead.status === "Negotiating" || lead.status === "Viewing")
    reasons.push(`pipeline stage is ${lead.status.toLowerCase()}`);
  if (lead.status === "Lost") reasons.push("file is marked lost, which caps the score");

  const nextAction =
    lead.status === "New"
      ? "Call within 4 hours and confirm budget, location, and timeline using only stated facts."
      : lead.status === "Contacted"
        ? "Book a viewing on a matching listed property. Do not introduce unlisted amenities."
        : lead.status === "Viewing"
          ? "Send a factual recap of the viewing and propose a second visit or written offer path."
          : lead.status === "Negotiating"
            ? "Issue heads of terms limited to price, timing, and items already in the listing."
            : lead.status === "Won"
              ? "Run closing checklist and commission note. No further sales outreach."
              : "Record the loss reason and stop active pursuit unless the client re-opens.";

  return {
    score,
    reason: reasons.join("; ") + ".",
    nextAction,
    breakdown: {
      budgetFit,
      locationFit,
      preferenceFit,
      engagement,
      timeline,
      interactions,
    },
  };
}
