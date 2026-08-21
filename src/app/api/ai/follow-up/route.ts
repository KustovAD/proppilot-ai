import { NextResponse } from "next/server";
import { z } from "zod";
import type { FollowUpTone, Lead, LeadActivity, Property } from "@/lib/types";
import { fallbackFollowUp } from "@/lib/ai/fallback";

const bodySchema = z.object({
  lead: z.custom<Lead>(),
  property: z.custom<Property | undefined>().optional(),
  activities: z.custom<LeadActivity[]>(),
  tone: z.enum(["Friendly", "Professional", "Urgent", "Luxury"]),
});

export async function POST(req: Request) {
  try {
    const { lead, property, activities, tone } = bodySchema.parse(await req.json()) as {
      lead: Lead;
      property?: Property;
      activities: LeadActivity[];
      tone: FollowUpTone;
    };
    const result = fallbackFollowUp(lead, property, activities, tone);
    return NextResponse.json({ ok: true, demo: true, model: "proppilot-demo", result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unable to generate follow-up" },
      { status: 400 },
    );
  }
}
