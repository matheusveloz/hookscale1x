"use client";

import { useCallback, useState } from "react";
import { Upload, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, formatBytes, validateVideoFile } from "@/lib/utils";
import type { VideoType } from "@/types";

interface UploadZoneProps {
  type: VideoType;
  files: File[];
  onFilesChange: (files: File[]) => void;
}

export function UploadZone({ type, files, onFilesChange }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        videoFiles.push(file);
      }

      onFilesChange([...files, ...videoFiles]);
    },
    [files, onFilesChange]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      const selectedFiles = Array.from(e.target.files || []);
      const videoFiles: File[] = [];

      for (const file of selectedFiles) {
        const validation = validateVideoFile(file);
        if (!validation.valid) {
          setError(validation.error || "Invalid file");
          return;
        }
        videoFiles.push(file);
      }

      onFilesChange([...files, ...videoFiles]);
    },
    [files, onFilesChange]
  );

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {type === "hook" ? "Hooks" : "Bodies"}
        </h3>
        <span className="text-sm text-foreground/60">{files.length} file(s)</span>
      </div>

      <Card
        className={cn(
          "relative border-2 border-dashed transition-colors",
          isDragging && "border-foreground bg-foreground/5",
          error && "border-red-500"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <label className="flex cursor-pointer flex-col items-center justify-center p-12">
          <Upload className="mb-4 h-12 w-12 text-foreground/40" />
          <p className="mb-2 text-sm font-medium">
            Drag & drop or click to select
          </p>
          <p className="text-xs text-foreground/60">
            Only .mp4 files (max 100MB)
          </p>
          <input
            type="file"
            className="hidden"
            accept="video/mp4"
            multiple
            onChange={handleFileInput}
          />
        </label>
      </Card>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <Card key={index} className="flex items-center justify-between p-3">
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-foreground/60">{formatBytes(file.size)}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFile(index)}
                className="ml-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
