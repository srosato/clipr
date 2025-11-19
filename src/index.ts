#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import { readdirSync, statSync, writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

// Graceful shutdown handler
function cleanup() {
  const fileListPath = 'filelist.txt';
  if (existsSync(fileListPath)) {
    try {
      unlinkSync(fileListPath);
    } catch (error) {
      // Ignore errors during cleanup
    }
  }
}

function handleExit() {
  console.log('\n\nOperation cancelled. Cleaning up...');
  cleanup();
  process.exit(0);
}

// Handle Ctrl+C gracefully
process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);

interface VideoFile {
  name: string;
  path: string;
  size: string;
  modified: Date;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function getRecentMp4Videos(directory: string): VideoFile[] {
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

  // Sort by modification time (oldest first)
  return videoFiles.sort((a, b) => a.modified.getTime() - b.modified.getTime());
}

async function selectVideos(videos: VideoFile[]): Promise<VideoFile[]> {
  const choices = videos.map(video => ({
    name: `${video.name} (${video.size}) - ${video.modified.toLocaleString()}`,
    value: video
  }));

  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedVideos',
      message: 'Select videos to merge (use space to select, enter to confirm):',
      choices: choices,
      validate: (input) => {
        if (input.length < 2) {
          return 'Please select at least 2 videos to merge';
        }
        return true;
      }
    }
  ]);

  return answers.selectedVideos;
}

async function getOutputFilename(defaultName: string): Promise<string> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'outputName',
      message: 'Enter output filename:',
      default: defaultName,
      validate: (input) => {
        if (!input || input.trim() === '') {
          return 'Please enter a valid filename';
        }
        return true;
      }
    }
  ]);

  // Automatically add .mp4 extension if not present
  let outputName = answers.outputName.trim();
  if (!outputName.toLowerCase().endsWith('.mp4')) {
    outputName += '.mp4';
  }

  return outputName;
}

async function mergeVideos(videos: VideoFile[], outputName: string): Promise<void> {
  const fileListPath = 'filelist.txt';

  // Create file list for ffmpeg
  const fileListContent = videos.map(v => `file '${v.path}'`).join('\n');
  writeFileSync(fileListPath, fileListContent);

  console.log('\nMerging videos...');
  console.log('Selected videos:');
  videos.forEach((v, i) => console.log(`  ${i + 1}. ${v.name}`));
  console.log('');

  try {
    execSync(
      `ffmpeg -f concat -safe 0 -i ${fileListPath} -c copy ${outputName}`,
      { stdio: 'inherit' }
    );

    console.log(`\nSuccess! Merged video saved as: ${outputName}`);
  } catch (error) {
    console.error('\nError merging videos:', error);
    throw error;
  } finally {
    // Clean up file list
    unlinkSync(fileListPath);
  }
}

const program = new Command();

program
  .name('clipr')
  .description('CLI tool to merge and split MP4 videos')
  .version('1.0.0');

program
  .command('merge')
  .description('Select and merge MP4 videos from the last week')
  .option('-d, --directory <path>', 'Directory to search for videos', process.cwd())
  .option('-o, --output <name>', 'Output file name (skips interactive prompt)', '')
  .action(async (options) => {
    try {
      console.log(`Scanning for MP4 videos in: ${options.directory}`);
      console.log('Looking for videos modified in the last 7 days...\n');

      const videos = getRecentMp4Videos(options.directory);

      if (videos.length === 0) {
        console.log('No MP4 videos found from the last week.');
        return;
      }

      console.log(`Found ${videos.length} video(s):\n`);

      const selectedVideos = await selectVideos(videos);

      // Get output filename interactively if not provided via option
      const outputName = options.output || await getOutputFilename('merged-output');

      await mergeVideos(selectedVideos, outputName);
    } catch (error: any) {
      // Handle Ctrl+C gracefully (inquirer throws ExitPromptError)
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

program.parse();
