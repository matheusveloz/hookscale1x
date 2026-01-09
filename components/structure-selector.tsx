"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GripVertical, Plus, X, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VideoStructure, StructureBlock } from "@/types/uploaded-video";

interface StructureSelectorProps {
  structure: VideoStructure;
  onStructureChange: (structure: VideoStructure) => void;
}

const defaultLabels = {
  hook: "Hook",
  body: "Body",
  cta: "CTA",
};

export function StructureSelector({ structure, onStructureChange }: StructureSelectorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const addBlock = (type: 'hook' | 'body' | 'cta') => {
    const newBlock: StructureBlock = {
      type,
      id: `${type}-${Date.now()}-${Math.random()}`,
    };
    onStructureChange([...structure, newBlock]);
  };

  const removeBlock = (index: number) => {
    onStructureChange(structure.filter((_, i) => i !== index));
  };

  const updateBlockName = (index: number, customName: string) => {
    const blockType = structure[index].type;
    // Update ALL blocks of the same type
    onStructureChange(
      structure.map((block) =>
        block.type === blockType ? { ...block, customName } : block
      )
    );
    setEditingIndex(null);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newStructure = [...structure];
    const draggedItem = newStructure[draggedIndex];
    newStructure.splice(draggedIndex, 1);
    newStructure.splice(index, 0, draggedItem);

    setDraggedIndex(index);
    onStructureChange(newStructure);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const startEdit = (index: number, currentName?: string) => {
    setEditingIndex(index);
    setEditValue(currentName || defaultLabels[structure[index].type]);
  };

  // Count how many of each type are already in structure
  const countByType = (type: 'hook' | 'body' | 'cta') => {
    return structure.filter(b => b.type === type).length;
  };

  // Can add up to 3 of each type
  const canAddMore = (type: 'hook' | 'body' | 'cta') => {
    return countByType(type) < 3;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Video Structure</h3>
        <p className="text-xs text-foreground/50">Order of combination</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 min-h-[80px] p-4 rounded-lg border-2 border-dashed border-foreground/20 bg-foreground/5">
        {structure.map((block, index) => (
          <div
            key={block.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={cn(
              "flex items-center gap-2 pl-2 pr-1 py-1.5 rounded-lg bg-foreground text-background cursor-move transition-all",
              draggedIndex === index && "opacity-50 scale-95"
            )}
          >
            <GripVertical className="w-3 h-3 text-background/40" />
            
            {editingIndex === index ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => updateBlockName(index, editValue)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") updateBlockName(index, editValue);
                  if (e.key === "Escape") setEditingIndex(null);
                }}
                autoFocus
                className="w-24 px-2 py-0.5 text-sm bg-background text-foreground border border-foreground/20 outline-none rounded"
              />
            ) : (
              <span 
                className="text-sm font-medium cursor-text"
                onDoubleClick={() => startEdit(index, block.customName)}
              >
                {block.customName || defaultLabels[block.type]}
              </span>
            )}
            
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => startEdit(index, block.customName)}
                className="p-1 hover:bg-white/20 rounded"
                title="Edit name"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={() => removeBlock(index)}
                className="p-1 hover:bg-red-500 rounded"
                title="Remove"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        {structure.length === 0 && (
          <p className="text-sm text-foreground/40 w-full text-center py-2">
            Add blocks to define your video structure
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-foreground/50">Add block:</span>
        {(['hook', 'body', 'cta'] as const).map((type) => {
          const count = countByType(type);
          const canAdd = count < 3;
          
          return (
            <Button
              key={type}
              onClick={() => addBlock(type)}
              size="sm"
              variant="outline"
              className="text-xs"
              disabled={!canAdd}
            >
              <Plus className="w-3 h-3 mr-1" />
              {defaultLabels[type as keyof typeof defaultLabels]}
              {count > 0 && (
                <span className="ml-1 text-xs text-foreground/40">({count}/3)</span>
              )}
            </Button>
          );
        })}
      </div>

      <div className="text-xs text-foreground/40 bg-foreground/5 p-3 rounded-lg">
        <div className="flex items-center justify-between mb-1">
          <strong>Preview:</strong>
          <span className="text-foreground/30">
            {structure.length} block{structure.length !== 1 ? 's' : ''}
          </span>
        </div>
        <p className="text-foreground/60">
          {structure.map(b => b.customName || defaultLabels[b.type]).join(' → ') || 'No structure defined'}
        </p>
      </div>
      
      <div className="flex items-center justify-between text-xs text-foreground/30">
        <span>💡 Drag to reorder • Double-click to rename</span>
        <span>Max 3 of each type</span>
      </div>
    </div>
  );
}
