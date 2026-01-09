import * as path from 'path';
import * as os from 'os';
import { downloadFromBlob, uploadToBlob, cleanupTempFiles } from './blob-storage';
import { concatenateVideos, concatenateVideosWithReencode } from './ffmpeg';
import {
  getVideosByJob,
  getPendingCombinations,
  updateCombination,
  updateJobProgress,
  updateJobStatus,
  getJob,
} from './db';
import { getAspectRatioDimensions } from './aspect-ratio-helper';
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

    // Get all hooks and bodies
    const hooks = await getVideosByJob(jobId, 'hook');
    const bodies = await getVideosByJob(jobId, 'body');

    if (hooks.length === 0 || bodies.length === 0) {
      throw new Error('No hooks or bodies found for this job');
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
              hooks,
              bodies,
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
  } catch (error) {
    console.error(`Error processing job ${jobId}:`, error);
    await updateJobStatus(jobId, 'failed');
    throw error;
  }
}

async function processSingleCombination(
  combination: Combination,
  hooks: Video[],
  bodies: Video[],
  callbacks: ProcessCallback,
  currentIndex: number,
  total: number,
  dimensions: { width: number; height: number }
): Promise<void> {
  const hook = hooks.find((h) => h.id === combination.hook_id);
  const body = bodies.find((b) => b.id === combination.body_id);

  if (!hook || !body) {
    throw new Error('Hook or body video not found');
  }

  callbacks.onProgress(currentIndex, total, combination.output_filename);

  // Create temp directory
  const tempDir = path.join(os.tmpdir(), 'hookscale', combination.id);
  const hookPath = path.join(tempDir, `hook_${hook.id}.mp4`);
  const bodyPath = path.join(tempDir, `body_${body.id}.mp4`);
  const outputPath = path.join(tempDir, combination.output_filename);

  try {
    console.log(`Processing ${combination.output_filename}...`);

    // Download videos from blob
    await downloadFromBlob(hook.blob_url, hookPath);
    await downloadFromBlob(body.blob_url, bodyPath);

    // Concatenate videos usando re-encoding (mais lento mas garante compatibilidade)
    console.log(`Concatenando vídeos com re-encoding (${dimensions.width}x${dimensions.height})...`);
    await concatenateVideosWithReencode(
      hookPath,
      bodyPath,
      outputPath,
      dimensions.width,
      dimensions.height
    );

    // Upload result to blob
    const fs = await import('fs');
    const outputBuffer = fs.readFileSync(outputPath);
    const { url } = await uploadToBlob(outputBuffer, combination.output_filename);

    // Update combination in database
    await updateCombination(combination.id, url, 'completed');

    console.log(`Completed ${combination.output_filename}`);
  } finally {
    // Cleanup temp files
    cleanupTempFiles(hookPath, bodyPath, outputPath);
    
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
