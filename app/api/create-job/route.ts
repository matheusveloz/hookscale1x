import { NextRequest, NextResponse } from "next/server";
import {
  createJob,
  createVideo,
  createCombination,
} from "@/lib/db";

export const runtime = "edge";

interface VideoData {
  filename: string;
  blob_url: string;
  duration: number;
  file_size: number;
}

interface BlockData {
  blockId: string;
  type: 'hook' | 'body' | 'cta';
  customName?: string;
  videos: VideoData[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { aspectRatio, structure } = body as {
      aspectRatio: string;
      structure: BlockData[];
    };

    // Validate structure
    if (!structure || structure.length === 0) {
      return NextResponse.json(
        { error: "At least 1 block required" },
        { status: 400 }
      );
    }

    // Check all blocks have videos
    for (const block of structure) {
      if (!block.videos || block.videos.length === 0) {
        return NextResponse.json(
          { error: `Block "${block.customName || block.type}" needs at least 1 video` },
          { status: 400 }
        );
      }
    }

    // Calculate total combinations (product of all block video counts)
    const totalCombinations = structure.reduce((acc, block) => acc * block.videos.length, 1);

    // Create job with structure
    const structureData = structure.map(b => ({ 
      type: b.type, 
      customName: b.customName, 
      blockId: b.blockId 
    }));
    
    const job = await createJob(
      `Job ${new Date().toLocaleString("en-US")}`,
      totalCombinations,
      aspectRatio,
      structureData
    );

    console.log(`✓ Created job ${job.id} with ${totalCombinations} combinations`);

    // Create video records for each block
    const videosByBlock: Record<string, { id: string; filename: string }[]> = {};

    for (const block of structure) {
      console.log(`Creating videos for block ${block.blockId} (${block.type}): ${block.videos.length} videos`);
      videosByBlock[block.blockId] = [];
      
      for (const videoData of block.videos) {
        const video = await createVideo(
          job.id,
          block.type,
          videoData.filename,
          videoData.blob_url,
          videoData.duration,
          videoData.file_size
        );
        console.log(`  ✓ Created video ${video.id} (${videoData.filename})`);
        videosByBlock[block.blockId].push({ id: video.id, filename: videoData.filename });
      }
    }

    console.log('Videos created by block:', Object.entries(videosByBlock).map(([blockId, videos]) => 
      ({ blockId, count: videos.length, ids: videos.map(v => v.id) })
    ));

    // Generate all combinations recursively
    const generateCombinations = (
      blockIndex: number,
      currentCombo: { videoId: string; filename: string }[]
    ): { videoId: string; filename: string }[][] => {
      if (blockIndex >= structure.length) {
        return [currentCombo];
      }

      const block = structure[blockIndex];
      const blockVideos = videosByBlock[block.blockId];
      const results: { videoId: string; filename: string }[][] = [];

      for (const video of blockVideos) {
        const newCombo = [...currentCombo, video];
        results.push(...generateCombinations(blockIndex + 1, newCombo));
      }

      return results;
    };

    const allCombinations = generateCombinations(0, []);

    // Create combination records
    let comboIndex = 1;
    for (const combo of allCombinations) {
      // Use first video as hook_video_id, second as body_video_id for DB compatibility
      const hookVideoId = combo[0]?.id;
      const bodyVideoId = combo[1]?.id || combo[0]?.id;

      // All video IDs in order for N-video concatenation
      const allVideoIds = combo.map(v => v.id);
      console.log(`Combo #${comboIndex} video IDs:`, allVideoIds);

      // Generate filename from all parts
      const filenameParts = combo.map((v) => {
        const name = v.filename.replace(/\.[^/.]+$/, ""); // Remove extension
        return name.substring(0, 15); // Limit length
      });
      const filename = `combo_${comboIndex}_${filenameParts.join("_")}.mp4`;

      await createCombination(
        job.id,
        hookVideoId,
        bodyVideoId,
        filename,
        allVideoIds // Pass all video IDs
      );
      comboIndex++;
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
