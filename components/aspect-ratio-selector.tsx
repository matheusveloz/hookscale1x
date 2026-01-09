"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

export type AspectRatio = "9:16" | "1:1" | "3:4" | "16:9";

interface AspectRatioSelectorProps {
  selected: AspectRatio;
  onSelect: (ratio: AspectRatio) => void;
}

const aspectRatios: { value: AspectRatio; label: string; dimensions: string }[] = [
  { value: "9:16", label: "Stories/Reels", dimensions: "1080x1920" },
  { value: "1:1", label: "Instagram Post", dimensions: "1080x1080" },
  { value: "3:4", label: "Portrait", dimensions: "1080x1440" },
  { value: "16:9", label: "YouTube/Landscape", dimensions: "1920x1080" },
];

export function AspectRatioSelector({ selected, onSelect }: AspectRatioSelectorProps) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold mb-1">Video Format</h3>
        <p className="text-sm text-foreground/60">
          Choose the aspect ratio for your final videos
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {aspectRatios.map((ratio) => (
          <Card
            key={ratio.value}
            className={cn(
              "cursor-pointer p-5 transition-all hover:shadow-lg hover:scale-105",
              selected === ratio.value
                ? "border-2 border-green-500 bg-green-500/5 shadow-lg"
                : "border border-foreground/10 hover:border-foreground/30"
            )}
            onClick={() => onSelect(ratio.value)}
          >
            <div className="flex flex-col items-center gap-3">
              {/* Visual representation */}
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div
                  className={cn(
                    "rounded-lg shadow-inner transition-all",
                    selected === ratio.value
                      ? "bg-green-500"
                      : "bg-foreground/10",
                    ratio.value === "9:16" && "w-7 h-14",
                    ratio.value === "1:1" && "w-12 h-12",
                    ratio.value === "3:4" && "w-9 h-12",
                    ratio.value === "16:9" && "w-14 h-8"
                  )}
                />
              </div>

              {/* Label */}
              <div className="text-center">
                <p className={cn(
                  "font-bold text-base mb-1",
                  selected === ratio.value && "text-green-600 dark:text-green-400"
                )}>
                  {ratio.value}
                </p>
                <p className="text-xs font-medium text-foreground/70">{ratio.label}</p>
                <p className="text-xs text-foreground/40 mt-1">{ratio.dimensions}</p>
              </div>

              {selected === ratio.value && (
                <CheckCircle2 className="w-5 h-5 text-green-500 absolute top-2 right-2" />
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
