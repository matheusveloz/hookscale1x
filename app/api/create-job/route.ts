import { NextRequest, NextResponse } from "next/server";
import {
  createJob,
  createVideo,
  createCombination,
} from "@/lib/db";
import { generateCombinationFilename } from "@/lib/utils";

export const runtime = "edge";

interface VideoData {
  filename: string;
  blob_url: string;
  duration: number;
  file_size: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { aspectRatio, hooks, bodies } = body as {
      aspectRatio: string;
      hooks: VideoData[];
      bodies: VideoData[];
    };

    if (!hooks || !bodies || hooks.length === 0 || bodies.length === 0) {
      return NextResponse.json(
        { error: "At least 1 hook and 1 body required" },
        { status: 400 }
      );
    }

    const totalCombinations = hooks.length * bodies.length;

    // Create job
    const job = await createJob(
      `Job ${new Date().toLocaleString("en-US")}`,
      totalCombinations,
      aspectRatio
    );

    console.log(`Created job ${job.id} with ${totalCombinations} combinations`);

    // Create video records (already uploaded to Blob)
    const hookVideos = [];
    for (const hookData of hooks) {
      const video = await createVideo(
        job.id,
        "hook",
        hookData.filename,
        hookData.blob_url,
        hookData.duration,
        hookData.file_size
      );
      hookVideos.push(video);
    }

    const bodyVideos = [];
    for (const bodyData of bodies) {
      const video = await createVideo(
        job.id,
        "body",
        bodyData.filename,
        bodyData.blob_url,
        bodyData.duration,
        bodyData.file_size
      );
      bodyVideos.push(video);
    }

    // Create all combinations
    for (let i = 0; i < hookVideos.length; i++) {
      for (let j = 0; j < bodyVideos.length; j++) {
        const filename = generateCombinationFilename(
          i,
          j,
          hookVideos.length,
          bodyVideos.length
        );

        await createCombination(
          job.id,
          hookVideos[i].id,
          bodyVideos[j].id,
          filename
        );
      }
    }

    console.log(`Created ${totalCombinations} combinations for job ${job.id}`);

    return NextResponse.json({
      jobId: job.id,
      totalCombinations,
      message: "Job created successfully",
    });
  } catch (error) {
    console.error("Error in create-job API:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create job" },
      { status: 500 }
    );
  }
}
