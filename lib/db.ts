import { supabase } from './supabase';
import type { Job, Video, Combination, VideoType, JobStatus } from '@/types';

// Jobs
export async function createJob(
  name: string | null,
  totalCombinations: number,
  aspectRatio: string = '16:9',
  structure?: any
): Promise<Job> {
  const { data, error } = await supabase
    .from('jobs')
    .insert({
      name,
      total_combinations: totalCombinations,
      aspect_ratio: aspectRatio,
      structure: structure ? JSON.stringify(structure) : null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Job;
}

export async function getJob(id: string): Promise<Job | null> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as Job;
}

export async function updateJobStatus(id: string, status: JobStatus): Promise<void> {
  const { error } = await supabase
    .from('jobs')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

export async function updateJobProgress(id: string, processedCount: number): Promise<void> {
  const { error } = await supabase
    .from('jobs')
    .update({ processed_count: processedCount, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

export async function updateJobZipUrl(id: string, zipUrl: string): Promise<void> {
  const { error } = await supabase
    .from('jobs')
    .update({ zip_url: zipUrl, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

// Videos
export async function createVideo(
  jobId: string,
  type: VideoType,
  filename: string,
  blobUrl: string,
  duration: number,
  fileSize: number
): Promise<Video> {
  const { data, error } = await supabase
    .from('videos')
    .insert({
      job_id: jobId,
      type,
      filename,
      blob_url: blobUrl,
      duration,
      file_size: fileSize,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Video;
}

export async function getVideosByJob(jobId: string, type?: VideoType): Promise<Video[]> {
  let query = supabase.from('videos').select('*').eq('job_id', jobId);

  if (type) {
    query = query.eq('type', type);
  }

  query = query.order('filename');

  const { data, error } = await query;

  if (error) throw error;
  return (data as Video[]) || [];
}

// Combinations
export async function createCombination(
  jobId: string,
  hookId: string,
  bodyId: string,
  outputFilename: string,
  videoIds?: string[] // All video IDs in order
): Promise<Combination> {
  const { data, error } = await supabase
    .from('combinations')
    .insert({
      job_id: jobId,
      hook_id: hookId,
      body_id: bodyId,
      output_filename: outputFilename,
      video_ids: videoIds ? JSON.stringify(videoIds) : null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Combination;
}

export async function updateCombination(
  id: string,
  blobUrl: string,
  status: 'completed' | 'failed',
  errorMsg?: string
): Promise<void> {
  const { error } = await supabase
    .from('combinations')
    .update({
      blob_url: blobUrl,
      status,
      error: errorMsg || null,
    })
    .eq('id', id);

  if (error) throw error;
}

export async function getCombinationsByJob(jobId: string): Promise<Combination[]> {
  const { data, error } = await supabase
    .from('combinations')
    .select('*')
    .eq('job_id', jobId)
    .order('created_at');

  if (error) throw error;
  return (data as Combination[]) || [];
}

export async function getPendingCombinations(jobId: string): Promise<Combination[]> {
  const { data, error } = await supabase
    .from('combinations')
    .select('*')
    .eq('job_id', jobId)
    .eq('status', 'pending')
    .order('created_at');

  if (error) throw error;
  return (data as Combination[]) || [];
}

export async function getCombination(id: string): Promise<Combination | null> {
  const { data, error } = await supabase
    .from('combinations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as Combination;
}

// Initialize database tables - NOT NEEDED for Supabase
// Tables should be created via Supabase Dashboard or migrations
export async function initializeDatabase(): Promise<void> {
  console.log('Supabase tables should be created via Dashboard or migrations');
  console.log('See lib/schema.sql for the SQL schema');
  // Tables are created manually in Supabase Dashboard
  // This function is kept for compatibility but doesn't do anything
}
