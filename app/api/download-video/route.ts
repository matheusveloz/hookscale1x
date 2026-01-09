import { NextRequest } from "next/server";
import { getCombination } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const combinationId = searchParams.get("id");

    if (!combinationId) {
      return new Response("Combination ID is required", { status: 400 });
    }

    const combination = await getCombination(combinationId);

    if (!combination || !combination.blob_url) {
      return new Response("Video not found", { status: 404 });
    }

    // Fetch video from blob
    const videoResponse = await fetch(combination.blob_url);
    
    if (!videoResponse.ok) {
      return new Response("Failed to fetch video", { status: 500 });
    }

    // Return video with download headers
    return new Response(videoResponse.body, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${combination.output_filename}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return new Response("Download failed", { status: 500 });
  }
}
