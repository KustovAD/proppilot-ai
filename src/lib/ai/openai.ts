import { z } from "zod";
import type { Property } from "@/lib/types";
import { factsBlock } from "@/lib/ai/fallback";

export const propertyCopySchema = z.object({
  headline: z.string(),
  longDescription: z.string(),
  shortDescription: z.string(),
  instagramCaption: z.string(),
  facebookPost: z.string(),
  seoDescription: z.string(),
});

export const SYSTEM_PROPERTY_COPY = `You are a luxury real estate copywriter for PropPilot AI.
Rules:
- Use ONLY the facts provided.
- Never invent amenities, views, finishes, neighborhood prestige, schools, or lifestyle claims.
- If a detail is missing, omit it.
- Do not mention "AI".
- Return JSON matching the schema.`;

export function propertyUserPrompt(property: Property, instruction: string) {
  return `${instruction}\n\nFACTS\n${factsBlock(property)}`;
}

export function hasOpenAI() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export async function completeJson<T>(
  schema: z.ZodType<T>,
  system: string,
  user: string,
): Promise<{ data: T; model: string } | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  try {
    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({ apiKey: key });
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    const raw = response.choices[0]?.message?.content ?? "{}";
    const parsed = schema.parse(JSON.parse(raw));
    return { data: parsed, model: response.model };
  } catch {
    return null;
  }
}
