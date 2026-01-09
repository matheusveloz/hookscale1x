import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import {
  createJob,
  createVideo,
  createCombination,
  initializeDatabase,
} from "@/lib/db";
import { getVideoDuration } from "@/lib/ffmpeg";
import { generateCombinationFilename } from "@/lib/utils";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes

export async function POST(request: NextRequest) {
  try {
    // Initialize database tables if needed
    await initializeDatabase();

    const formData = await request.formData();
    const hookFiles = formData.getAll("hooks") as File[];
    const bodyFiles = formData.getAll("bodies") as File[];

    if (hookFiles.length === 0 || bodyFiles.length === 0) {
      return NextResponse.json(
        { error: "É necessário enviar pelo menos 1 hook e 1 body" },
        { status: 400 }
      );
    }

    // Validate files
    const maxSize = parseInt(process.env.MAX_FILE_SIZE_MB || "100") * 1024 * 1024;
    for (const file of [...hookFiles, ...bodyFiles]) {
      if (file.type !== "video/mp4") {
        return NextResponse.json(
          { error: `Arquivo ${file.name} não é um MP4 válido` },
          { status: 400 }
        );
      }
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `Arquivo ${file.name} excede o tamanho máximo de ${maxSize / 1024 / 1024}MB` },
          { status: 400 }
        );
      }
    }

    const totalCombinations = hookFiles.length * bodyFiles.length;

    // Create job
    const job = await createJob(
      `Job ${new Date().toLocaleString("pt-BR")}`,
      totalCombinations
    );

    console.log(`Created job ${job.id} with ${totalCombinations} combinations`);

    // Upload hooks
    const hookVideos = [];
    for (const file of hookFiles) {
      try {
        // Upload to Vercel Blob
        const blob = await put(file.name, file, {
          access: "public",
          addRandomSuffix: true,
        });

        // Get video duration (save to temp file first)
        let duration = 0;
        try {
          const tempPath = path.join(os.tmpdir(), `temp-${Date.now()}-${file.name}`);
          const arrayBuffer = await file.arrayBuffer();
          fs.writeFileSync(tempPath, Buffer.from(arrayBuffer));
          duration = await getVideoDuration(tempPath);
          fs.unlinkSync(tempPath);
        } catch (err) {
          console.error("Error getting video duration:", err);
          // Use 0 if we can't get duration
        }

        // Save to database
        const video = await createVideo(
          job.id,
          "hook",
          file.name,
          blob.url,
          duration,
          file.size
        );

        hookVideos.push(video);
        console.log(`Uploaded hook: ${file.name}`);
      } catch (err) {
        console.error(`Error uploading hook ${file.name}:`, err);
        throw new Error(`Failed to upload ${file.name}`);
      }
    }

    // Upload bodies
    const bodyVideos = [];
    for (const file of bodyFiles) {
      try {
        const blob = await put(file.name, file, {
          access: "public",
          addRandomSuffix: true,
        });

        let duration = 0;
        try {
          const tempPath = path.join(os.tmpdir(), `temp-${Date.now()}-${file.name}`);
          const arrayBuffer = await file.arrayBuffer();
          fs.writeFileSync(tempPath, Buffer.from(arrayBuffer));
          duration = await getVideoDuration(tempPath);
          fs.unlinkSync(tempPath);
        } catch (err) {
          console.error("Error getting video duration:", err);
        }

        const video = await createVideo(
          job.id,
          "body",
          file.name,
          blob.url,
          duration,
          file.size
        );

        bodyVideos.push(video);
        console.log(`Uploaded body: ${file.name}`);
      } catch (err) {
        console.error(`Error uploading body ${file.name}:`, err);
        throw new Error(`Failed to upload ${file.name}`);
      }
    }

    // Create all combinations in database
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
      message: "Upload successful",
    });
  } catch (error) {
    console.error("Error in upload API:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
