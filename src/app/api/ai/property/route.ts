import { NextResponse } from "next/server";
import { z } from "zod";
import type { Property } from "@/lib/types";
import { fallbackEmailCampaign, fallbackPropertyDescription, fallbackSocialPost } from "@/lib/ai/fallback";

const bodySchema = z.object({
  action: z.enum(["generate", "improve", "social", "email"]),
  property: z.custom<Property>(),
});

export async function POST(req: Request) {
  try {
    const { action, property } = bodySchema.parse(await req.json());
    const copy = fallbackPropertyDescription(property);
    const social = fallbackSocialPost(property);
    const email = fallbackEmailCampaign(property);

    return NextResponse.json({
      ok: true,
      demo: true,
      model: "proppilot-demo",
      copy,
      social:
        action === "social" || action === "generate"
          ? { instagram: copy.instagramCaption, facebook: copy.facebookPost, headline: copy.headline }
          : social,
      email:
        action === "email" || action === "generate"
          ? {
              subject: `${copy.headline}`,
              preheader: copy.seoDescription.slice(0, 90),
              body: `Dear client,\n\n${copy.longDescription}\n\nMeridian Private Estates`,
            }
          : email,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unable to generate copy" },
      { status: 400 },
    );
  }
}
