import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { Job } from "@/types";

export const runtime = "edge";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching recent jobs:", error);
      return NextResponse.json(
        { error: "Failed to fetch jobs" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      jobs: (data as Job[]) || [],
    });
  } catch (error) {
    console.error("Error in recent jobs API:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
