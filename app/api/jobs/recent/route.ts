import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { Job } from "@/types";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "5");
    const offset = page * limit;

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching recent jobs:", error);
      return NextResponse.json(
        { error: "Failed to fetch jobs" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      jobs: (data as Job[]) || [],
      page,
      hasMore: data && data.length === limit,
    });
  } catch (error) {
    console.error("Error in recent jobs API:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
