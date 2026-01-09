import { NextRequest } from "next/server";
import { processJobCombinations } from "@/lib/video-processor";
import { getJob } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const { jobId } = await request.json();

    if (!jobId) {
      return new Response(
        JSON.stringify({ error: "Job ID is required" }),
        { status: 400 }
      );
    }

    // Verify job exists
    const job = await getJob(jobId);
    if (!job) {
      return new Response(
        JSON.stringify({ error: "Job not found" }),
        { status: 404 }
      );
    }

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (data: any) => {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        };

        try {
          // Send initial event
          sendEvent({
            status: "processing",
            progress: 0,
            total: job.total_combinations,
            message: "Iniciando processamento...",
          });

          // Process combinations
          await processJobCombinations(jobId, {
            onProgress: (progress, total, currentFile) => {
              sendEvent({
                status: "processing",
                progress,
                total,
                currentFile,
                percentage: Math.round((progress / total) * 100),
              });
            },
            onError: (error) => {
              sendEvent({
                status: "error",
                error,
              });
            },
          });

          // Send completion event
          sendEvent({
            status: "completed",
            progress: job.total_combinations,
            total: job.total_combinations,
            message: "Processamento concluído!",
          });

          controller.close();
        } catch (error) {
          console.error("Error processing job:", error);
          sendEvent({
            status: "failed",
            error: error instanceof Error ? error.message : "Processing failed",
          });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in process API:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to process" }),
      { status: 500 }
    );
  }
}
