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
  return concatenateMultipleVideos([inputPath1, inputPath2], outputPath, width, height);
}

// Helper to probe video for audio and duration
async function probeVideoInfo(inputPath: string): Promise<{hasAudio: boolean, duration: number}> {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        console.warn(`Could not probe ${inputPath}:`, err.message);
        resolve({ hasAudio: false, duration: 5 });
        return;
      }
      const hasAudio = metadata.streams?.some(s => s.codec_type === 'audio') || false;
      const duration = metadata.format?.duration || 5;
      resolve({ hasAudio, duration });
    });
  });
}

export async function concatenateMultipleVideos(
  inputPaths: string[],
  outputPath: string,
  width: number = 1920,
  height: number = 1080
): Promise<void> {
  if (inputPaths.length < 1) {
    throw new Error('At least 1 video is required');
  }

  // Probe all videos for audio presence and duration
  const videoInfo = await Promise.all(inputPaths.map(probeVideoInfo));
  const anyHasAudio = videoInfo.some(info => info.hasAudio);

  console.log(`Concatenating ${inputPaths.length} videos -> ${outputPath} (${width}x${height})`);
  console.log('Video info:', videoInfo.map((info, i) => `video${i}: ${info.hasAudio ? 'has audio' : 'no audio'}, ${info.duration.toFixed(1)}s`));

  return new Promise((resolve, reject) => {
    const command = ffmpeg();

    // Add all input files
    inputPaths.forEach(inputPath => {
      command.input(inputPath);
    });

    const filters: string[] = [];

    inputPaths.forEach((_, index) => {
      // Video filter - scale, pad, normalize
      filters.push(
        `[${index}:v]scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v${index}]`
      );

      // Audio filter - only if any video has audio
      if (anyHasAudio) {
        if (videoInfo[index].hasAudio) {
          // Use actual audio, normalized to consistent format
          filters.push(
            `[${index}:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[a${index}]`
          );
        } else {
          // Generate silence with matching duration for videos without audio
          const duration = videoInfo[index].duration;
          filters.push(
            `aevalsrc=0:channel_layout=stereo:sample_rate=44100:duration=${duration}[a${index}]`
          );
        }
      }
    });

    // Build concat filter
    if (anyHasAudio) {
      // Interleave video and audio streams for concat
      const concatInputs = inputPaths.map((_, i) => `[v${i}][a${i}]`).join('');
      filters.push(`${concatInputs}concat=n=${inputPaths.length}:v=1:a=1[outv][outa]`);
    } else {
      // Video only
      const concatInputs = inputPaths.map((_, i) => `[v${i}]`).join('');
      filters.push(`${concatInputs}concat=n=${inputPaths.length}:v=1:a=0[outv]`);
    }

    // Build output options
    const outputOptions = [
      '-map', '[outv]',
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '23',
      '-movflags', '+faststart'
    ];

    if (anyHasAudio) {
      outputOptions.push('-map', '[outa]', '-c:a', 'aac', '-b:a', '128k');
    } else {
      outputOptions.push('-an');
    }

    command
      .complexFilter(filters)
      .outputOptions(outputOptions)
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
        console.log(`✓ Video concatenated: ${outputPath}`);
        resolve();
      })
      .on('error', (err) => {
        console.error('Concatenation error:', err);
        reject(err);
      })
      .run();
  });
}
