import type { StructureBlock } from '@/types/uploaded-video';
import type { Video } from '@/types';

/**
 * Generate combinations respecting the structure order
 * Example: [Hook, CTA, Body] with 2 hooks, 1 CTA, 3 bodies = 6 videos
 * Each video will be: hook1+cta1+body1, hook1+cta1+body2, etc.
 */
export function generateStructuredCombinations(
  structure: StructureBlock[],
  videosByType: Record<string, Video[]>
): Array<{
  videos: { type: string; videoId: string; customName?: string }[];
  filename: string;
}> {
  const combinations: Array<{
    videos: { type: string; videoId: string; customName?: string }[];
    filename: string;
  }> = [];

  // Get videos for each block in structure
  const blockVideos = structure.map(block => ({
    block,
    videos: videosByType[block.type] || [],
  }));

  // Generate all combinations recursively
  function generateCombos(
    index: number,
    current: { type: string; videoId: string; customName?: string }[]
  ) {
    if (index === blockVideos.length) {
      // Generate filename
      const parts = current.map((v, i) => {
        const block = structure[i];
        const name = block.customName || block.type;
        const videos = blockVideos[i].videos;
        const videoIndex = videos.findIndex(vid => vid.id === v.videoId);
        return `${name}${videoIndex + 1}`;
      });
      const filename = `${parts.join('_')}.mp4`;
      
      combinations.push({
        videos: [...current],
        filename,
      });
      return;
    }

    const { block, videos } = blockVideos[index];
    for (const video of videos) {
      generateCombos(index + 1, [
        ...current,
        {
          type: block.type,
          videoId: video.id,
          customName: block.customName,
        },
      ]);
    }
  }

  generateCombos(0, []);
  return combinations;
}
