"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Combination } from "@/types";

interface VideoGridProps {
  combinations: Combination[];
}

export function VideoGrid({ combinations }: VideoGridProps) {
  if (combinations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Generated Videos</h3>

      {/* Grid - 3 per row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {combinations.map((combination) => (
          <div
            key={combination.id}
            className="rounded-lg border border-foreground/10 overflow-hidden bg-foreground/5 hover:shadow-lg transition-shadow"
          >
            {/* Video Preview */}
            {combination.status === "completed" && combination.blob_url ? (
              <div className="aspect-video bg-black">
                <video
                  src={combination.blob_url}
                  className="w-full h-full object-contain"
                  controls
                  preload="metadata"
                />
              </div>
            ) : (
              <div className="aspect-video bg-foreground/10 flex items-center justify-center">
                <Badge
                  variant={
                    combination.status === "failed"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {combination.status === "processing"
                    ? "Processing..."
                    : combination.status === "failed"
                    ? "Failed"
                    : "Pending"}
                </Badge>
              </div>
            )}

            {/* Info */}
            <div className="p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium truncate flex-1">
                  {combination.output_filename}
                </p>
                <Badge
                  variant={combination.status === "completed" ? "success" : "secondary"}
                  className="text-xs flex-shrink-0"
                >
                  {combination.status}
                </Badge>
              </div>

              {combination.error && (
                <p className="text-xs text-red-500 line-clamp-2">{combination.error}</p>
              )}

              {combination.status === "completed" && combination.blob_url && (
                <a
                  href={combination.blob_url}
                  download={combination.output_filename}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 w-full bg-green-500 hover:bg-green-600 text-white transition-colors"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Show more indicator */}
      {combinations.length > 12 && (
        <p className="text-xs text-center text-foreground/40 pt-4">
          Scroll down to load more videos
        </p>
      )}
    </div>
  );
}
