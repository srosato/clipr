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

export const getMp4Videos = (directory: string, days?: number): VideoFile[] => {
  const files = readdirSync(directory);
  const videoFiles: VideoFile[] = [];

  let cutoffDate: Date | null = null;
  if (days !== undefined) {
    cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
  }

  for (const file of files) {
    if (!file.toLowerCase().endsWith('.mp4')) continue;

    const filePath = join(directory, file);
    const stats = statSync(filePath);

    // Filter by date only if days parameter is provided
    if (cutoffDate === null || stats.mtime >= cutoffDate) {
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
