import archiver from 'archiver';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { uploadToBlob } from './blob-storage';
import { getCombinationsByJob } from './db';

export async function generateAndUploadZip(jobId: string): Promise<string> {
  const combinations = await getCombinationsByJob(jobId);
  const completedCombinations = combinations.filter(
    (c) => c.status === 'completed' && c.blob_url
  );

  if (completedCombinations.length === 0) {
    throw new Error('No completed videos to zip');
  }

  // Create temp zip file
  const tempZipPath = path.join(os.tmpdir(), `hookscale-${jobId}.zip`);
  const output = fs.createWriteStream(tempZipPath);
  const archive = archiver('zip', { zlib: { level: 0 } });

  return new Promise(async (resolve, reject) => {
    output.on('close', async () => {
      try {
        console.log(`ZIP created: ${archive.pointer()} bytes`);
        
        // Upload ZIP to blob
        const zipBuffer = fs.readFileSync(tempZipPath);
        const { url } = await uploadToBlob(zipBuffer, `job-${jobId}.zip`);
        
        // Cleanup temp file
        fs.unlinkSync(tempZipPath);
        
        resolve(url);
      } catch (error) {
        reject(error);
      }
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    // Add each video to archive
    for (const combo of completedCombinations) {
      try {
        const response = await fetch(combo.blob_url!);
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          archive.append(buffer, { name: combo.output_filename });
        }
      } catch (err) {
        console.error(`Error adding ${combo.output_filename} to ZIP:`, err);
      }
    }

    archive.finalize();
  });
}
