"use client";

import { useState } from "react";
import { Download, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Combination } from "@/types";

interface VideoListProps {
  combinations: Combination[];
  onDownload: (id: string, filename: string) => void;
  onDownloadAll?: () => void;
}

export function VideoList({ combinations, onDownload, onDownloadAll }: VideoListProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const completedCombinations = combinations.filter((c) => c.status === "completed");
  const failedCombinations = combinations.filter((c) => c.status === "failed");

  if (combinations.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Generated Videos</h3>
          {completedCombinations.length > 0 && onDownloadAll && (
            <Button onClick={onDownloadAll}>
              <Download className="mr-2 h-4 w-4" />
              Download All (ZIP)
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {combinations.map((combination) => (
            <Card
              key={combination.id}
              className="flex items-center justify-between p-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium">{combination.output_filename}</p>
                  <Badge
                  variant={
                    combination.status === "completed"
                      ? "success"
                      : combination.status === "failed"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {combination.status === "completed"
                    ? "Complete"
                    : combination.status === "failed"
                    ? "Failed"
                    : combination.status === "processing"
                    ? "Processing"
                    : "Pending"}
                </Badge>
                </div>
                {combination.error && (
                  <p className="text-xs text-red-500 mt-1">{combination.error}</p>
                )}
              </div>
              {combination.status === "completed" && combination.blob_url && (
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewUrl(combination.blob_url)}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDownload(combination.id, combination.output_filename)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>

        {failedCombinations.length > 0 && (
          <p className="text-sm text-red-500">
            {failedCombinations.length} video(s) failed during processing
          </p>
        )}
      </div>

      {/* Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw] flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-12 right-0 text-white hover:bg-white/20"
              onClick={() => setPreviewUrl(null)}
            >
              <X className="h-6 w-6" />
            </Button>
            <video
              src={previewUrl}
              controls
              autoPlay
              className="max-h-[90vh] max-w-full rounded-lg shadow-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}
