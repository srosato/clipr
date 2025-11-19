import type { Command } from 'commander';
import { getMp4Videos } from '../utils/files';
import { selectVideosForMerge, promptForOutputFilename } from '../utils/prompts';
import { mergeVideos } from '../lib/merge';
import { cleanup } from '../utils/cleanup';

interface MergeOptions {
  directory: string;
  output: string;
  days?: string;
}

export const setupMergeCommand = (program: Command): void => {
  program
    .command('merge')
    .description('Select and merge MP4 videos')
    .option('-d, --directory <path>', 'Directory to search for videos', process.cwd())
    .option('-o, --output <name>', 'Output file name (skips interactive prompt)', '')
    .option('--days <number>', 'Only show videos from last N days (default: all videos)')
    .action(async (options: MergeOptions) => {
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

        const selectedVideos = await selectVideosForMerge(videos);

        const outputName = options.output || await promptForOutputFilename('merged-output');

        await mergeVideos(selectedVideos, outputName);
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
