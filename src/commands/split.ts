import type { Command } from 'commander';
import { getRecentMp4Videos } from '../utils/files';
import { selectVideoForSplit, promptForSplitOptions } from '../utils/prompts';
import { splitVideo } from '../lib/split';
import { cleanup } from '../utils/cleanup';

interface SplitOptions {
  directory: string;
  outputDir: string;
}

export const setupSplitCommand = (program: Command): void => {
  program
    .command('split')
    .description('Select and split an MP4 video into multiple parts')
    .option('-d, --directory <path>', 'Directory to search for videos', process.cwd())
    .option('-o, --output-dir <path>', 'Output directory for split parts', 'out')
    .action(async (options: SplitOptions) => {
      try {
        console.log(`Scanning for MP4 videos in: ${options.directory}`);
        console.log('Looking for videos modified in the last 7 days...\n');

        const videos = getRecentMp4Videos(options.directory);

        if (videos.length === 0) {
          console.log('No MP4 videos found from the last week.');
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
