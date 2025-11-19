import { execSync } from 'child_process';
import { join } from 'path';
import type { VideoFile, SplitOptions } from '../types';

export const getVideoDuration = (videoPath: string): number => {
  const result = execSync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`,
    { encoding: 'utf-8' }
  );
  return parseFloat(result.trim());
};

export const splitVideo = async (
  video: VideoFile,
  options: SplitOptions,
  outputDir: string
): Promise<void> => {
  const extension = video.name.split('.').pop();
  const duration = getVideoDuration(video.path);
  const partDuration = duration / options.numParts;

  console.log(`\nSplitting video into ${options.numParts} parts...`);
  console.log(`Video: ${video.name}`);
  console.log(`Total duration: ${Math.floor(duration)}s`);
  console.log(`Each part: ~${Math.floor(partDuration)}s\n`);

  const outputPath = join(outputDir, options.outputBaseName);
  execSync(`mkdir -p "${outputPath}"`);

  for (let i = 0; i < options.numParts; i++) {
    const startTime = i * partDuration;
    const partNumber = i + 1;

    let outputFile: string;
    if (options.prefix) {
      outputFile = join(
        outputPath,
        `${options.prefix} - Part ${partNumber} - ${options.outputBaseName}.${extension}`
      );
    } else {
      outputFile = join(
        outputPath,
        `Part ${partNumber} - ${options.outputBaseName}.${extension}`
      );
    }

    console.log(`Creating part ${partNumber}/${options.numParts}...`);

    try {
      // Use -c copy to avoid re-encoding (fast and lossless)
      execSync(
        `ffmpeg -i "${video.path}" -ss ${startTime} -t ${partDuration} -c copy "${outputFile}"`,
        { stdio: 'inherit' }
      );
    } catch (error) {
      console.error(`\nError creating part ${partNumber}:`, error);
      throw error;
    }
  }

  console.log(`\nSuccess! Video split into ${options.numParts} parts in: ${outputPath}`);
};
