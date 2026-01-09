"use client";

import { useCallback, useState } from "react";
import { Upload, X, CheckCircle2, FileVideo, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn, validateVideoFile } from "@/lib/utils";
import type { VideoType } from "@/types";
import type { UploadedVideo } from "@/types/uploaded-video";

interface UploadZoneProps {
  type: VideoType;
  videos: UploadedVideo[];
  onVideosChange: (videos: UploadedVideo[]) => void;
  compact?: boolean;
}

export function UploadZone({ type, videos, onVideosChange, compact = false }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const uploadFiles = async (files: File[]) => {
    setIsUploading(true);
    setUploadProgress(0);

    const newVideos: UploadedVideo[] = files.map(file => ({
      file,
      type,
      uploading: true,
    }));

    const currentVideos = [...videos, ...newVideos];
    onVideosChange(currentVideos);

    let completed = 0;
    const total = files.length;

    const results = await Promise.all(
      files.map(async (file) => {
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
          completed++;
          setUploadProgress(Math.round((completed / total) * 100));
          return { file, success: true, blob_url: data.blob_url, duration: data.duration };
        } catch (err) {
          console.error("Upload error:", err);
          completed++;
          setUploadProgress(Math.round((completed / total) * 100));
          return { file, success: false, error: "Upload failed" };
        }
      })
    );

    const updatedVideos = currentVideos.map(v => {
      const result = results.find(r => r.file === v.file);
      if (result) {
        if (result.success) {
          return { ...v, blob_url: result.blob_url, duration: result.duration, uploading: false };
        } else {
          return { ...v, uploading: false, error: result.error };
        }
      }
      return v;
    });

    onVideosChange(updatedVideos);
    setIsUploading(false);
    setUploadProgress(0);
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
      const validFiles: File[] = [];

      for (const file of droppedFiles) {
        const validation = validateVideoFile(file);
        if (!validation.valid) {
          setError(validation.error || "Invalid file");
          return;
        }
        validFiles.push(file);
      }

      if (validFiles.length > 0) {
        uploadFiles(validFiles);
      }
    },
    [uploadFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      const selectedFiles = Array.from(e.target.files || []);
      const validFiles: File[] = [];

      for (const file of selectedFiles) {
        const validation = validateVideoFile(file);
        if (!validation.valid) {
          setError(validation.error || "Invalid file");
          return;
        }
        validFiles.push(file);
      }

      if (validFiles.length > 0) {
        uploadFiles(validFiles);
      }
    },
    [uploadFiles]
  );

  const clearAll = () => {
    onVideosChange([]);
  };

  const removeVideo = (index: number) => {
    onVideosChange(videos.filter((_, i) => i !== index));
  };

  const uploadedCount = videos.filter(v => v.blob_url).length;
  const hasErrors = videos.some(v => v.error);

  return (
    <div className="space-y-2">
      {/* Drop zone */}
      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed transition-all",
          isDragging && "border-green-500 bg-green-500/10",
          error && "border-red-500",
          !isDragging && !error && "border-foreground/20 hover:border-green-500/50 bg-foreground/5"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <label className={cn(
          "flex cursor-pointer flex-col items-center justify-center",
          compact ? "p-4" : "p-8"
        )}>
          <div className={cn(
            "rounded-lg flex items-center justify-center mb-2 transition-all",
            compact ? "w-8 h-8" : "w-12 h-12 rounded-xl mb-3",
            isDragging ? "bg-green-500" : "bg-foreground/10"
          )}>
            <Upload className={cn(
              "transition-colors",
              compact ? "h-4 w-4" : "h-6 w-6",
              isDragging ? "text-white" : "text-foreground/40"
            )} />
          </div>
          <p className={cn("font-medium", compact ? "text-xs" : "text-sm mb-1")}>
            Drop or <span className="text-green-500">browse</span>
          </p>
          {!compact && (
            <p className="text-xs text-foreground/40">.mp4 up to 100MB</p>
          )}
          <input
            type="file"
            className="hidden"
            accept="video/mp4"
            multiple
            onChange={handleFileInput}
          />
        </label>
      </div>

      {/* Upload progress bar */}
      {isUploading && (
        <div className="space-y-1">
          <Progress value={uploadProgress} className="h-1.5" />
          <p className="text-xs text-foreground/50 text-center">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {/* Files List */}
      {videos.length > 0 && (
        <div className="space-y-2">
          {/* Header with toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-foreground/5 border border-foreground/10 hover:bg-foreground/10 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-6 h-6 rounded flex items-center justify-center",
                uploadedCount === videos.length ? "bg-green-500 text-white" : "bg-foreground/20"
              )}>
                {uploadedCount === videos.length ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <FileVideo className="w-3.5 h-3.5 text-foreground/50" />
                )}
              </div>
              <span className="text-xs">
                <span className="font-medium">{videos.length}</span>
                <span className="text-foreground/50"> file{videos.length !== 1 ? 's' : ''}</span>
                {uploadedCount === videos.length && (
                  <span className="text-green-500 ml-1">✓ ready</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  clearAll();
                }}
                className="h-6 px-2 text-xs text-foreground/40 hover:text-red-500"
              >
                Clear All
              </Button>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-foreground/40" />
              ) : (
                <ChevronDown className="w-4 h-4 text-foreground/40" />
              )}
            </div>
          </button>

          {/* Expanded list */}
          {isExpanded && (
            <div className="space-y-1.5">
              {videos.map((video, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 rounded-lg bg-background border border-foreground/10 hover:border-green-500/30 transition-all"
                >
                  {/* Status icon */}
                  <div className={cn(
                    "w-7 h-7 rounded flex items-center justify-center flex-shrink-0",
                    video.blob_url ? "bg-green-500 text-white" :
                    video.uploading ? "bg-foreground/10" :
                    video.error ? "bg-red-500/20" : "bg-foreground/10"
                  )}>
                    {video.uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-foreground/50" />
                    ) : video.blob_url ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : video.error ? (
                      <X className="w-4 h-4 text-red-500" />
                    ) : (
                      <span className="text-xs font-medium">{index + 1}</span>
                    )}
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{video.file.name}</p>
                    <div className="flex items-center gap-2 text-xs text-foreground/40">
                      <span>{formatBytes(video.file.size)}</span>
                      {video.uploading && video.progress && (
                        <span className="text-green-500">• {video.progress}%</span>
                      )}
                      {video.error && (
                        <span className="text-red-500">• {video.error}</span>
                      )}
                    </div>
                  </div>

                  {/* Delete button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVideo(index)}
                    disabled={video.uploading}
                    className="h-7 w-7 p-0 hover:bg-red-500/10 hover:text-red-500 flex-shrink-0"
                    title="Remove this file"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
