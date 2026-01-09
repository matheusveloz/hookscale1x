import * as path from 'path';
import * as os from 'os';
import { downloadFromBlob, uploadToBlob, cleanupTempFiles } from './blob-storage';
import { concatenateMultipleVideos } from './ffmpeg';
import {
  getVideosByJob,
  getPendingCombinations,
  updateCombination,
  updateJobProgress,
  updateJobStatus,
  updateJobZipUrl,
  getJob,
} from './db';
import { getAspectRatioDimensions } from './aspect-ratio-helper';
import { generateAndUploadZip } from './zip-generator';
import type { Combination, Video, AspectRatio } from '@/types';

const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '8');

export interface ProcessCallback {
  onProgress: (progress: number, total: number, currentFile: string) => void;
  onError: (error: string) => void;
}

export async function processJobCombinations(
  jobId: string,
  callbacks: ProcessCallback
): Promise<void> {
  try {
    // Update job status to processing
    await updateJobStatus(jobId, 'processing');

    // Get job details (including aspect ratio)
    const job = await getJob(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    const aspectRatio = (job.aspect_ratio || '16:9') as AspectRatio;
    const dimensions = getAspectRatioDimensions(aspectRatio);

    console.log(`Processing with aspect ratio: ${aspectRatio} (${dimensions.width}x${dimensions.height})`);

    // Get all videos (hooks, bodies, ctas)
    const hooks = await getVideosByJob(jobId, 'hook');
    const bodies = await getVideosByJob(jobId, 'body');
    const ctas = await getVideosByJob(jobId, 'cta');

    // Combine all videos into one array for lookup
    const allVideos = [...hooks, ...bodies, ...ctas];

    console.log(`Found videos for job: ${hooks.length} hooks, ${bodies.length} bodies, ${ctas.length} CTAs`);
    console.log('All video IDs:', allVideos.map(v => ({ id: v.id, type: v.type, filename: v.filename })));

    if (allVideos.length === 0) {
      throw new Error('No videos found for this job');
    }

    // Get all pending combinations
    const combinations = await getPendingCombinations(jobId);
    const total = combinations.length;

    console.log(`Processing ${total} combinations in batches of ${BATCH_SIZE}`);

    // Process in batches
    for (let i = 0; i < combinations.length; i += BATCH_SIZE) {
      const batch = combinations.slice(i, i + BATCH_SIZE);
      
      // Process batch in parallel
      await Promise.all(
        batch.map(async (combination, batchIndex) => {
          const overallIndex = i + batchIndex;
          try {
            await processSingleCombination(
              combination,
              allVideos,
              callbacks,
              overallIndex + 1,
              total,
              dimensions
            );
          } catch (error) {
            console.error(`Error processing combination ${combination.id}:`, error);
            // Mark as failed but continue
            await updateCombination(
              combination.id,
              '',
              'failed',
              error instanceof Error ? error.message : 'Unknown error'
            );
            callbacks.onError(`Failed: ${combination.output_filename}`);
          }
        })
      );

      // Update job progress after each batch
      await updateJobProgress(jobId, i + batch.length);
    }

    // Mark job as completed
    await updateJobStatus(jobId, 'completed');
    console.log(`Job ${jobId} completed successfully`);

    // Generate and upload ZIP
    try {
      console.log(`Generating ZIP for job ${jobId}...`);
      const zipUrl = await generateAndUploadZip(jobId);
      await updateJobZipUrl(jobId, zipUrl);
      console.log(`ZIP generated and uploaded: ${zipUrl}`);
    } catch (error) {
      console.error(`Error generating ZIP for job ${jobId}:`, error);
      // Don't fail the job if ZIP generation fails
    }
  } catch (error) {
    console.error(`Error processing job ${jobId}:`, error);
    await updateJobStatus(jobId, 'failed');
    throw error;
  }
}

async function processSingleCombination(
  combination: Combination,
  allVideos: Video[],
  callbacks: ProcessCallback,
  currentIndex: number,
  total: number,
  dimensions: { width: number; height: number }
): Promise<void> {
  // Get video IDs from video_ids field (new) or fallback to hook_id/body_id (old)
  let videoIds: string[];
  if (combination.video_ids) {
    try {
      videoIds = JSON.parse(combination.video_ids);
      console.log(`Combination ${combination.id} has ${videoIds.length} video IDs:`, videoIds);
    } catch (e) {
      console.error('Error parsing video_ids:', e);
      videoIds = [combination.hook_id, combination.body_id];
    }
  } else {
    videoIds = [combination.hook_id, combination.body_id];
  }

  // Find all videos in order
  const videos = videoIds
    .map(id => {
      const found = allVideos.find(v => v.id === id);
      if (!found) {
        console.error(`Video ${id} not found in allVideos (${allVideos.length} total)`);
      }
      return found;
    })
    .filter((v): v is Video => v !== undefined);

  console.log(`Found ${videos.length} videos out of ${videoIds.length} IDs for combination ${combination.output_filename}`);

  if (videos.length !== videoIds.length) {
    throw new Error(`Only found ${videos.length} videos out of ${videoIds.length} required`);
  }

  if (videos.length < 1) {
    throw new Error('No videos found for combination');
  }

  callbacks.onProgress(currentIndex, total, combination.output_filename);

  // Create temp directory
  const tempDir = path.join(os.tmpdir(), 'hookscale', combination.id);
  const outputPath = path.join(tempDir, combination.output_filename);
  const videoPaths: string[] = [];

  try {
    console.log(`Processing ${combination.output_filename} with ${videos.length} videos...`);
    console.log('Videos in order:', videos.map((v, i) => `#${i}: ${v.type} - ${v.filename} (${v.id})`));

    // Download all videos from blob
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      const videoPath = path.join(tempDir, `video${i}_${video.id}.mp4`);
      console.log(`  [${i+1}/${videos.length}] Downloading: ${video.filename} (${video.type})`);
      await downloadFromBlob(video.blob_url, videoPath);
      videoPaths.push(videoPath);
      console.log(`  ✓ Downloaded to: ${videoPath}`);
    }

    // Concatenate all videos using re-encoding
    console.log(`Concatenating ${videos.length} videos (${dimensions.width}x${dimensions.height})...`);
    console.log('Video paths in order:', videoPaths);
    
    await concatenateMultipleVideos(
      videoPaths,
      outputPath,
      dimensions.width,
      dimensions.height
    );
    
    console.log(`✓ Concatenation complete: ${outputPath}`);

    // Upload result to blob
    const fs = await import('fs');
    const outputBuffer = fs.readFileSync(outputPath);
    const { url } = await uploadToBlob(outputBuffer, combination.output_filename);

    // Update combination in database
    await updateCombination(combination.id, url, 'completed');

    console.log(`Completed ${combination.output_filename}`);
  } finally {
    // Cleanup temp files
    cleanupTempFiles(...videoPaths, outputPath);

    // Try to remove temp directory
    try {
      const fs = await import('fs');
      if (fs.existsSync(tempDir)) {
        fs.rmdirSync(tempDir, { recursive: true });
      }
    } catch (err) {
      console.error('Error cleaning up temp directory:', err);
    }
  }
}
