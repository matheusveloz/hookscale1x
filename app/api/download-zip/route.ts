import { NextRequest, NextResponse } from "next/server";
import { getCombinationsByJob, getJob } from "@/lib/db";
import archiver from "archiver";
import { Readable } from "stream";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    const job = await getJob(jobId);
    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    const combinations = await getCombinationsByJob(jobId);
    const completedCombinations = combinations.filter(
      (c) => c.status === "completed" && c.blob_url
    );

    if (completedCombinations.length === 0) {
      return NextResponse.json(
        { error: "No completed videos to download" },
        { status: 400 }
      );
    }

    // Create ZIP archive
    const archive = archiver("zip", {
      zlib: { level: 0 }, // No compression for videos
    });

    // Handle archive errors
    archive.on("error", (err) => {
      console.error("Archive error:", err);
      throw err;
    });

    // Add each video to the archive
    for (const combination of completedCombinations) {
      try {
        const response = await fetch(combination.blob_url!);
        if (!response.ok) {
          console.error(`Failed to fetch ${combination.output_filename}`);
          continue;
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        archive.append(buffer, { name: combination.output_filename });
      } catch (err) {
        console.error(`Error adding ${combination.output_filename} to archive:`, err);
      }
    }

    // Finalize the archive
    archive.finalize();

    // Convert archive to web stream
    const nodeStream = archive;
    const webStream = Readable.toWeb(nodeStream) as ReadableStream;

    return new Response(webStream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="hookscale-job-${jobId}.zip"`,
      },
    });
  } catch (error) {
    console.error("Error in download-zip API:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "ZIP creation failed" },
      { status: 500 }
    );
  }
}
