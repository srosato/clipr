import type { Command } from 'commander';
import { getRecentMp4Videos } from '../utils/files';
import { selectVideosForMerge, promptForOutputFilename } from '../utils/prompts';
import { mergeVideos } from '../lib/merge';
import { cleanup } from '../utils/cleanup';

interface MergeOptions {
  directory: string;
  output: string;
}

export const setupMergeCommand = (program: Command): void => {
  program
    .command('merge')
    .description('Select and merge MP4 videos from the last week')
    .option('-d, --directory <path>', 'Directory to search for videos', process.cwd())
    .option('-o, --output <name>', 'Output file name (skips interactive prompt)', '')
    .action(async (options: MergeOptions) => {
      try {
        console.log(`Scanning for MP4 videos in: ${options.directory}`);
        console.log('Looking for videos modified in the last 7 days...\n');

        const videos = getRecentMp4Videos(options.directory);

        if (videos.length === 0) {
          console.log('No MP4 videos found from the last week.');
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
