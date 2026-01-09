import { put, del } from '@vercel/blob';
import * as fs from 'fs';
import * as path from 'path';

export async function uploadToBlob(
  file: File | Buffer,
  filename: string
): Promise<{ url: string }> {
  try {
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    return { url: blob.url };
  } catch (error) {
    console.error('Error uploading to blob:', error);
    throw new Error('Failed to upload file to storage');
  }
}

export async function downloadFromBlob(url: string, destinationPath: string, retries = 3): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      console.log(`Downloading from blob (attempt ${attempt + 1}/${retries}): ${url}`);
      
      const response = await fetch(url, {
        // Adicionar timeout
        signal: AbortSignal.timeout(30000), // 30 segundos
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Ensure directory exists
      const dir = path.dirname(destinationPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(destinationPath, buffer);
      console.log(`✓ Downloaded successfully: ${destinationPath}`);
      return; // Sucesso!
      
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt + 1} failed:`, error);
      
      if (attempt < retries - 1) {
        // Aguarda antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  console.error('All download attempts failed:', lastError);
  throw new Error(`Failed to download file from storage after ${retries} attempts: ${lastError?.message}`);
}

export async function deleteFromBlob(url: string): Promise<void> {
  try {
    await del(url);
  } catch (error) {
    console.error('Error deleting from blob:', error);
    // Don't throw - deletion failures shouldn't stop processing
  }
}

export function cleanupTempFiles(...filePaths: string[]): void {
  for (const filePath of filePaths) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Error deleting temp file ${filePath}:`, error);
    }
  }
}
