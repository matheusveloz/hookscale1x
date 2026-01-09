export interface UploadedVideo {
  file: File;
  type: 'hook' | 'body' | 'cta';
  blob_url?: string;
  duration?: number;
  uploading?: boolean;
  progress?: number;
  error?: string;
}

export interface StructureBlock {
  type: 'hook' | 'body' | 'cta';
  customName?: string;
  id: string;
}

export type VideoStructure = StructureBlock[];
