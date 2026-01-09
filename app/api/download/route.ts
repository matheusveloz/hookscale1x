import { NextRequest, NextResponse } from "next/server";
import { getCombination } from "@/lib/db";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const combinationId = searchParams.get("id");

    if (!combinationId) {
      return NextResponse.json(
        { error: "Combination ID is required" },
        { status: 400 }
      );
    }

    const combination = await getCombination(combinationId);

    if (!combination) {
      return NextResponse.json(
        { error: "Combination not found" },
        { status: 404 }
      );
    }

    if (combination.status !== "completed" || !combination.blob_url) {
      return NextResponse.json(
        { error: "Video not ready for download" },
        { status: 400 }
      );
    }

    // Redirect to blob URL with download header
    return NextResponse.redirect(combination.blob_url);
  } catch (error) {
    console.error("Error in download API:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Download failed" },
      { status: 500 }
    );
  }
}
