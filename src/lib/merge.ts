import { writeFileSync, unlinkSync } from 'fs';
import { execSync } from 'child_process';
import type { VideoFile } from '../types';

export const mergeVideos = async (videos: VideoFile[], outputName: string): Promise<void> => {
  const fileListPath = 'filelist.txt';

  const fileListContent = videos.map(v => `file '${v.path}'`).join('\n');
  writeFileSync(fileListPath, fileListContent);

  console.log('\nMerging videos...');
  console.log('Selected videos:');
  videos.forEach((v, i) => console.log(`  ${i + 1}. ${v.name}`));
  console.log('');

  try {
    // Use concat demuxer with -c copy for fast, lossless merge
    execSync(
      `ffmpeg -f concat -safe 0 -i ${fileListPath} -c copy ${outputName}`,
      { stdio: 'inherit' }
    );

    console.log(`\nSuccess! Merged video saved as: ${outputName}`);
  } catch (error) {
    console.error('\nError merging videos:', error);
    throw error;
  } finally {
    unlinkSync(fileListPath);
  }
};
