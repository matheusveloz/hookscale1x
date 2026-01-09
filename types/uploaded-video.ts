export interface UploadedVideo {
  file: File;
  type: 'hook' | 'body' | 'cta';
  blob_url?: string;
  duration?: number;
  uploading?: boolean;
  progress?: number;
  error?: string;
}

export type VideoStructure = ('hook' | 'body' | 'cta')[];
