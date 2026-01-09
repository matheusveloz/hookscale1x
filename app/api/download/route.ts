import { NextRequest, NextResponse } from "next/server";
import { getCombination } from "@/lib/db";

export const runtime = "nodejs";

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

    // Fetch video from blob and return with download headers
    const videoResponse = await fetch(combination.blob_url);
    if (!videoResponse.ok) {
      throw new Error('Failed to fetch video from storage');
    }

    const videoBlob = await videoResponse.blob();

    return new Response(videoBlob, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${combination.output_filename}"`,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error("Error in download API:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Download failed" },
      { status: 500 }
    );
  }
}
