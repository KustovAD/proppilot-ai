import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    openai: false,
    supabase: false,
    demoMode: true,
  });
}
