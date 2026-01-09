"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  current: number;
  total: number;
  currentFile?: string;
  className?: string;
}

export function ProgressBar({ current, total, currentFile, className }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          {current} de {total} vídeos processados
        </span>
        <span className="text-foreground/60">{percentage}%</span>
      </div>
      <Progress value={percentage} />
      {currentFile && (
        <p className="text-xs text-foreground/60 truncate">
          Processando: {currentFile}
        </p>
      )}
    </div>
  );
}
