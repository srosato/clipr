import type { Command } from 'commander';
import { getMp4Videos } from '../utils/files';
import { selectVideoForSplit, promptForSplitOptions } from '../utils/prompts';
import { splitVideo } from '../lib/split';
import { cleanup } from '../utils/cleanup';

interface SplitOptions {
  directory: string;
  outputDir: string;
  days?: string;
}

export const setupSplitCommand = (program: Command): void => {
  program
    .command('split')
    .description('Select and split an MP4 video into multiple parts')
    .option('-d, --directory <path>', 'Directory to search for videos', process.cwd())
    .option('-o, --output-dir <path>', 'Output directory for split parts', 'out')
    .option('--days <number>', 'Only show videos from last N days (default: all videos)')
    .action(async (options: SplitOptions) => {
      try {
        const daysFilter = options.days ? parseInt(options.days) : undefined;

        console.log(`Scanning for MP4 videos in: ${options.directory}`);
        if (daysFilter) {
          console.log(`Filtering videos from last ${daysFilter} day(s)...\n`);
        } else {
          console.log('Showing all MP4 videos...\n');
        }

        const videos = getMp4Videos(options.directory, daysFilter);

        if (videos.length === 0) {
          console.log('No MP4 videos found.');
          return;
        }

        console.log(`Found ${videos.length} video(s):\n`);

        const selectedVideo = await selectVideoForSplit(videos);

        const baseName = selectedVideo.name.replace(/\.[^/.]+$/, '');

        const splitOptions = await promptForSplitOptions(baseName);

        await splitVideo(selectedVideo, splitOptions, options.outputDir);
      } catch (error: any) {
        // ExitPromptError is thrown when user presses Ctrl+C in inquirer
        if (error.name === 'ExitPromptError' || error.message?.includes('User force closed the prompt')) {
          console.log('\n\nOperation cancelled by user.');
          cleanup();
          process.exit(0);
        }

        console.error('An error occurred:', error);
        cleanup();
        process.exit(1);
      }
    });
};
