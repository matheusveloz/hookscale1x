"use client";

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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {aspectRatios.map((ratio) => (
        <div
          key={ratio.value}
          className={cn(
            "relative cursor-pointer p-4 rounded-lg transition-all",
            selected === ratio.value
              ? "bg-green-500/10 border-2 border-green-500"
              : "bg-foreground/5 border border-foreground/10 hover:border-foreground/30"
          )}
          onClick={() => onSelect(ratio.value)}
        >
          <div className="flex flex-col items-center gap-3">
            {/* Visual representation */}
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div
                className={cn(
                  "rounded transition-all",
                  selected === ratio.value
                    ? "bg-green-500"
                    : "bg-foreground/20",
                  ratio.value === "9:16" && "w-5 h-10",
                  ratio.value === "1:1" && "w-9 h-9",
                  ratio.value === "3:4" && "w-7 h-9",
                  ratio.value === "16:9" && "w-11 h-6"
                )}
              />
            </div>

            {/* Label */}
            <div className="text-center">
              <p className={cn(
                "font-semibold text-sm",
                selected === ratio.value ? "text-green-500" : ""
              )}>
                {ratio.value}
              </p>
              <p className="text-xs text-foreground/50 mt-0.5">{ratio.label}</p>
            </div>

            {selected === ratio.value && (
              <CheckCircle2 className="w-4 h-4 absolute top-2 right-2 text-green-500" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
