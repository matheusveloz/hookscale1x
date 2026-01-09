"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {aspectRatios.map((ratio) => (
          <Card
            key={ratio.value}
            className={cn(
              "cursor-pointer p-4 transition-all hover:shadow-md",
              selected === ratio.value
                ? "border-2 border-foreground bg-foreground/5"
                : "border border-foreground/20"
            )}
            onClick={() => onSelect(ratio.value)}
          >
            <div className="flex flex-col items-center gap-2">
              {/* Visual representation */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div
                  className={cn(
                    "bg-foreground/20 rounded",
                    ratio.value === "9:16" && "w-6 h-12",
                    ratio.value === "1:1" && "w-10 h-10",
                    ratio.value === "3:4" && "w-8 h-11",
                    ratio.value === "16:9" && "w-12 h-7"
                  )}
                />
              </div>

              {/* Label */}
              <div className="text-center">
                <p className="font-semibold text-sm">{ratio.value}</p>
                <p className="text-xs text-foreground/60">{ratio.label}</p>
                <p className="text-xs text-foreground/40 mt-1">{ratio.dimensions}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
