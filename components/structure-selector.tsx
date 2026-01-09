"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, MoveUp, MoveDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VideoStructure } from "@/types/uploaded-video";

interface StructureSelectorProps {
  structure: VideoStructure;
  onStructureChange: (structure: VideoStructure) => void;
}

const blockLabels = {
  hook: "Hook",
  body: "Body",
  cta: "CTA",
};

const blockColors = {
  hook: "bg-blue-500",
  body: "bg-purple-500",
  cta: "bg-amber-500",
};

export function StructureSelector({ structure, onStructureChange }: StructureSelectorProps) {
  const [showMenu, setShowMenu] = useState(false);

  const addBlock = (type: 'hook' | 'body' | 'cta') => {
    onStructureChange([...structure, type]);
    setShowMenu(false);
  };

  const removeBlock = (index: number) => {
    onStructureChange(structure.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newStructure = [...structure];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < structure.length) {
      [newStructure[index], newStructure[targetIndex]] = [newStructure[targetIndex], newStructure[index]];
      onStructureChange(newStructure);
    }
  };

  const availableBlocks = ['hook', 'body', 'cta'].filter(
    type => !structure.includes(type as any) || type === 'cta'
  ) as ('hook' | 'body' | 'cta')[];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Video Structure</h3>
        <p className="text-xs text-foreground/50">Order of combination</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 min-h-[60px] p-3 rounded-lg border-2 border-dashed border-foreground/20 bg-foreground/5">
        {structure.map((type, index) => (
          <div
            key={`${type}-${index}`}
            className="flex items-center gap-1 pl-3 pr-1 py-1 rounded-full bg-foreground text-background"
          >
            <span className="text-sm font-medium">{blockLabels[type]}</span>
            
            <div className="flex items-center gap-0.5 ml-1">
              {index > 0 && (
                <button
                  onClick={() => moveBlock(index, 'up')}
                  className="p-1 hover:bg-white/20 rounded"
                >
                  <MoveUp className="w-3 h-3" />
                </button>
              )}
              {index < structure.length - 1 && (
                <button
                  onClick={() => moveBlock(index, 'down')}
                  className="p-1 hover:bg-white/20 rounded"
                >
                  <MoveDown className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={() => removeBlock(index)}
                className="p-1 hover:bg-red-500 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        {structure.length === 0 && (
          <p className="text-sm text-foreground/40">Add blocks to define structure</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-foreground/50">Add block:</span>
        {availableBlocks.map((type) => (
          <Button
            key={type}
            onClick={() => addBlock(type)}
            size="sm"
            variant="outline"
            className="text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            {blockLabels[type]}
          </Button>
        ))}
      </div>

      <div className="text-xs text-foreground/40 bg-foreground/5 p-2 rounded">
        <strong>Preview:</strong> {structure.map(t => blockLabels[t]).join(' → ') || 'No structure defined'}
      </div>
    </div>
  );
}
