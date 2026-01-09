export type VideoType = 'hook' | 'body' | 'cta';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type CombinationStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type AspectRatio = '9:16' | '1:1' | '3:4' | '16:9';

export interface Job {
  id: string;
  name: string | null;
  status: JobStatus;
  total_combinations: number;
  processed_count: number;
  aspect_ratio: AspectRatio;
  structure: string | null; // JSON string of structure
  zip_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Video {
  id: string;
  job_id: string;
  type: VideoType;
  filename: string;
  blob_url: string;
  duration: number;
  file_size: number;
  uploaded_at: Date;
}

export interface Combination {
  id: string;
  job_id: string;
  hook_id: string;
  body_id: string;
  video_ids: string | null; // JSON array of all video IDs in order
  output_filename: string;
  blob_url: string | null;
  status: CombinationStatus;
  error: string | null;
  created_at: Date;
}

export interface ProcessProgress {
  progress: number;
  total: number;
  status: JobStatus;
  currentFile?: string;
  error?: string;
}

export interface UploadedFile {
  file: File;
  type: VideoType;
  preview?: string;
  duration?: number;
}
