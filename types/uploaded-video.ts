export interface UploadedVideo {
  file: File;
  type: 'hook' | 'body';
  blob_url?: string;
  duration?: number;
  uploading?: boolean;
  progress?: number;
  error?: string;
}
