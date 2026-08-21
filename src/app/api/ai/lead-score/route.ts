import { NextResponse } from "next/server";
import { z } from "zod";
import type { Lead, LeadActivity, Property } from "@/lib/types";
import { scoreLead } from "@/lib/ai/scoring";

const bodySchema = z.object({
  lead: z.custom<Lead>(),
  properties: z.custom<Property[]>(),
  activities: z.custom<LeadActivity[]>(),
});

export async function POST(req: Request) {
  try {
    const { lead, properties, activities } = bodySchema.parse(await req.json());
    const result = scoreLead(lead, properties, activities);
    return NextResponse.json({
      ok: true,
      demo: true,
      model: "proppilot-demo",
      result,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unable to score lead" },
      { status: 400 },
    );
  }
}
