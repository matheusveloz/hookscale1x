import ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as fs from 'fs';

// Set FFmpeg path
const ffmpegPath = process.env.FFMPEG_PATH || 'C:\\ffmpeg\\bin\\ffmpeg.exe';
const ffprobePath = 'C:\\ffmpeg\\bin\\ffprobe.exe';

try {
  // Verificar se o FFmpeg existe
  if (fs.existsSync(ffmpegPath)) {
    ffmpeg.setFfmpegPath(ffmpegPath);
    console.log(`✓ FFmpeg configurado: ${ffmpegPath}`);
  } else {
    console.warn(`⚠ FFmpeg não encontrado em: ${ffmpegPath}`);
  }
  
  // Configurar ffprobe também
  if (fs.existsSync(ffprobePath)) {
    ffmpeg.setFfprobePath(ffprobePath);
    console.log(`✓ FFprobe configurado: ${ffprobePath}`);
  }
} catch (error) {
  console.error('Erro ao configurar FFmpeg:', error);
}

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  codec: string;
  bitrate: number;
}

export async function getVideoMetadata(filePath: string): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }

      const videoStream = metadata.streams.find(s => s.codec_type === 'video');
      if (!videoStream) {
        reject(new Error('No video stream found'));
        return;
      }

      resolve({
        duration: metadata.format.duration || 0,
        width: videoStream.width || 0,
        height: videoStream.height || 0,
        codec: videoStream.codec_name || 'unknown',
        bitrate: metadata.format.bit_rate || 0,
      });
    });
  });
}

export async function getVideoDuration(filePath: string): Promise<number> {
  try {
    const metadata = await getVideoMetadata(filePath);
    return metadata.duration;
  } catch (error) {
    console.error('Error getting video duration, returning 0:', error);
    // Se não conseguir obter a duração, retorna 0 em vez de falhar
    return 0;
  }
}

export async function concatenateVideos(
  inputPath1: string,
  inputPath2: string,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Create concat file list
    const listPath = path.join(path.dirname(outputPath), 'concat-list.txt');
    const listContent = `file '${inputPath1.replace(/\\/g, '/')}'\nfile '${inputPath2.replace(/\\/g, '/')}'`;
    
    fs.writeFileSync(listPath, listContent);

    ffmpeg()
      .input(listPath)
      .inputOptions(['-f', 'concat', '-safe', '0'])
      .outputOptions([
        '-c', 'copy', // Copy without re-encoding for speed
      ])
      .output(outputPath)
      .on('start', (commandLine) => {
        console.log('FFmpeg command:', commandLine);
      })
      .on('progress', (progress) => {
        if (progress.percent) {
          console.log(`Processing: ${Math.round(progress.percent)}% done`);
        }
      })
      .on('end', () => {
        // Cleanup concat list file
        try {
          fs.unlinkSync(listPath);
        } catch (err) {
          console.error('Error deleting concat list:', err);
        }
        resolve();
      })
      .on('error', (err) => {
        // Cleanup concat list file on error
        try {
          fs.unlinkSync(listPath);
        } catch (e) {
          console.error('Error deleting concat list:', e);
        }
        reject(err);
      })
      .run();
  });
}

export async function concatenateVideosWithReencode(
  inputPath1: string,
  inputPath2: string,
  outputPath: string,
  width: number = 1920,
  height: number = 1080
): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`Re-encoding: ${inputPath1} + ${inputPath2} -> ${outputPath} (${width}x${height})`);
    
    ffmpeg()
      .input(inputPath1)
      .input(inputPath2)
      .complexFilter([
        // Normalizar inputs para mesma resolução/framerate
        `[0:v]scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v0]`,
        `[1:v]scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v1]`,
        // Concatenar vídeos e áudios
        '[v0][0:a][v1][1:a]concat=n=2:v=1:a=1[outv][outa]'
      ])
      .outputOptions([
        '-map', '[outv]',
        '-map', '[outa]',
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '23',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart'
      ])
      .output(outputPath)
      .on('start', (commandLine) => {
        console.log('FFmpeg re-encode command:', commandLine);
      })
      .on('progress', (progress) => {
        if (progress.percent) {
          console.log(`Re-encoding: ${Math.round(progress.percent)}% concluído`);
        }
      })
      .on('end', () => {
        console.log(`✓ Vídeo concatenado com sucesso: ${outputPath}`);
        resolve();
      })
      .on('error', (err) => {
        console.error('Erro na concatenação:', err);
        reject(err);
      })
      .run();
  });
}
