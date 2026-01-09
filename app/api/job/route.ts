import { NextRequest, NextResponse } from "next/server";
import { getJob, getCombinationsByJob } from "@/lib/db";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get("id");

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

    return NextResponse.json({
      job,
      combinations,
    });
  } catch (error) {
    console.error("Error in job API:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch job" },
      { status: 500 }
    );
  }
}
