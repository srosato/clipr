import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import type { VideoFile } from '../types';

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const getRecentMp4Videos = (directory: string): VideoFile[] => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const files = readdirSync(directory);
  const videoFiles: VideoFile[] = [];

  for (const file of files) {
    if (!file.toLowerCase().endsWith('.mp4')) continue;

    const filePath = join(directory, file);
    const stats = statSync(filePath);

    if (stats.mtime >= oneWeekAgo) {
      videoFiles.push({
        name: file,
        path: filePath,
        size: formatBytes(stats.size),
        modified: stats.mtime
      });
    }
  }

  // Sort oldest first so merged videos play in chronological order
  return videoFiles.sort((a, b) => a.modified.getTime() - b.modified.getTime());
};
