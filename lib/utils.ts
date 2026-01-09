import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function generateCombinationFilename(
  hookIndex: number,
  bodyIndex: number,
  totalHooks: number,
  totalBodies: number
): string {
  const hookPadding = totalHooks.toString().length;
  const bodyPadding = totalBodies.toString().length;
  
  const hookNum = (hookIndex + 1).toString().padStart(hookPadding, '0');
  const bodyNum = (bodyIndex + 1).toString().padStart(bodyPadding, '0');
  
  return `hook${hookNum}_body${bodyNum}.mp4`;
}

export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  const maxSize = parseInt(process.env.MAX_FILE_SIZE_MB || '100') * 1024 * 1024;
  
  if (file.type !== 'video/mp4') {
    return { valid: false, error: 'Apenas arquivos .mp4 são aceitos' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: `Arquivo muito grande. Máximo: ${formatBytes(maxSize)}` };
  }
  
  return { valid: true };
}
