import type { AspectRatio } from '@/types';

export interface AspectRatioDimensions {
  width: number;
  height: number;
}

export function getAspectRatioDimensions(aspectRatio: AspectRatio): AspectRatioDimensions {
  const dimensions: Record<AspectRatio, AspectRatioDimensions> = {
    '9:16': { width: 1080, height: 1920 }, // Stories/Reels
    '1:1': { width: 1080, height: 1080 },  // Instagram Post
    '3:4': { width: 1080, height: 1440 },  // Portrait
    '16:9': { width: 1920, height: 1080 }, // YouTube/Landscape
  };

  return dimensions[aspectRatio] || dimensions['16:9'];
}
