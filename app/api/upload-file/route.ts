import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getVideoDuration } from "@/lib/ffmpeg";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    });

    // Get video duration
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

    return NextResponse.json({
      success: true,
      blob_url: blob.url,
      filename: file.name,
      file_size: file.size,
      duration,
      type,
    });
  } catch (error) {
    console.error("Error in upload-file API:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
