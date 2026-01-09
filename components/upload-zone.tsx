"use client";

import { useCallback, useState } from "react";
import { Upload, X, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn, formatBytes, validateVideoFile } from "@/lib/utils";
import type { VideoType } from "@/types";
import type { UploadedVideo } from "@/types/uploaded-video";

interface UploadZoneProps {
  type: VideoType;
  videos: UploadedVideo[];
  onVideosChange: (videos: UploadedVideo[]) => void;
}

export function UploadZone({ type, videos, onVideosChange }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File) => {
    const newVideo: UploadedVideo = {
      file,
      type,
      uploading: true,
      progress: 0,
    };

    // Add to list immediately
    onVideosChange([...videos, newVideo]);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch("/api/upload-file", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      // Update video with blob_url
      onVideosChange(prev =>
        prev.map(v =>
          v.file === file
            ? { ...v, blob_url: data.blob_url, duration: data.duration, uploading: false, progress: 100 }
            : v
        )
      );
    } catch (err) {
      console.error("Upload error:", err);
      // Mark as error
      onVideosChange(prev =>
        prev.map(v =>
          v.file === file
            ? { ...v, uploading: false, error: "Upload failed" }
            : v
        )
      );
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      setError(null);

      const droppedFiles = Array.from(e.dataTransfer.files);
      const videoFiles: File[] = [];

      for (const file of droppedFiles) {
        const validation = validateVideoFile(file);
        if (!validation.valid) {
          setError(validation.error || "Invalid file");
          return;
        }
        // Upload immediately
        uploadFile(file);
      }
    },
    [videos, onVideosChange, uploadFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      const selectedFiles = Array.from(e.target.files || []);

      for (const file of selectedFiles) {
        const validation = validateVideoFile(file);
        if (!validation.valid) {
          setError(validation.error || "Invalid file");
          return;
        }
        // Upload immediately
        uploadFile(file);
      }
    },
    [videos, onVideosChange, uploadFile]
  );

  const removeVideo = (index: number) => {
    onVideosChange(videos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">
          {type === "hook" ? "Hooks" : "Bodies"}
        </h3>
        <span className="text-xs text-foreground/50">{videos.length} file(s)</span>
      </div>

      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed transition-all",
          isDragging && "border-green-500 bg-green-500/10 scale-[1.02]",
          error && "border-red-500",
          !isDragging && !error && "border-foreground/20 hover:border-green-500/50 bg-foreground/5"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <label className="flex cursor-pointer flex-col items-center justify-center p-8">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all",
            isDragging ? "bg-green-500" : "bg-foreground/10"
          )}>
            <Upload className={cn(
              "h-6 w-6 transition-colors",
              isDragging ? "text-white" : "text-foreground/40"
            )} />
          </div>
          <p className="mb-1 text-sm font-medium">
            Drop files or <span className="text-green-500">browse</span>
          </p>
          <p className="text-xs text-foreground/40">
            .mp4 files up to 100MB
          </p>
          <input
            type="file"
            className="hidden"
            accept="video/mp4"
            multiple
            onChange={handleFileInput}
          />
        </label>
      </div>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {videos.length > 0 && (
        <div className="space-y-2">
          {videos.map((video, index) => (
            <div key={index} className="p-3 rounded-lg bg-foreground/5 border border-foreground/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold flex-shrink-0",
                    video.blob_url ? "bg-green-500 text-white" : "bg-foreground/20 text-foreground/60"
                  )}>
                    {video.uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                     video.blob_url ? <CheckCircle2 className="w-4 h-4" /> : 
                     index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm">{video.file.name}</p>
                    <p className="text-xs text-foreground/40">{formatBytes(video.file.size)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeVideo(index)}
                  className="ml-2 h-8 w-8 hover:bg-red-500/10 hover:text-red-500"
                  disabled={video.uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {video.uploading && (
                <div className="space-y-1">
                  <Progress value={50} className="h-1" />
                  <p className="text-xs text-foreground/40 text-center">Uploading...</p>
                </div>
              )}
              {video.error && (
                <p className="text-xs text-red-500 mt-1">{video.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
