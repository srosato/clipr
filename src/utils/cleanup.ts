import { existsSync, unlinkSync } from 'fs';

export const cleanup = (): void => {
  const fileListPath = 'filelist.txt';
  if (existsSync(fileListPath)) {
    try {
      unlinkSync(fileListPath);
    } catch (error) {
      // Silently ignore - file may have already been cleaned up or never created
    }
  }
};

export const handleExit = (): void => {
  console.log('\n\nOperation cancelled. Cleaning up...');
  cleanup();
  process.exit(0);
};

export const setupSignalHandlers = (): void => {
  process.on('SIGINT', handleExit);
  process.on('SIGTERM', handleExit);
};
