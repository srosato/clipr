import inquirer from 'inquirer';
import type { VideoFile, SplitOptions } from '../types';

export const selectVideosForMerge = async (videos: VideoFile[]): Promise<VideoFile[]> => {
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
};

export const selectVideoForSplit = async (videos: VideoFile[]): Promise<VideoFile> => {
  const choices = videos.map(video => ({
    name: `${video.name} (${video.size}) - ${video.modified.toLocaleString()}`,
    value: video
  }));

  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedVideo',
      message: 'Select video to split (select one):',
      choices: choices,
      validate: (input) => {
        if (input.length === 0) {
          return 'Please select one video';
        }
        if (input.length > 1) {
          return 'Please select only one video';
        }
        return true;
      }
    }
  ]);

  return answers.selectedVideo[0];
};

export const promptForOutputFilename = async (defaultName: string): Promise<string> => {
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

  // Auto-add extension so users don't have to type it every time
  let outputName = answers.outputName.trim();
  if (!outputName.toLowerCase().endsWith('.mp4')) {
    outputName += '.mp4';
  }

  return outputName;
};

export const promptForSplitOptions = async (defaultBaseName: string): Promise<SplitOptions> => {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'numParts',
      message: 'How many parts to split into:',
      default: '2',
      validate: (input) => {
        const num = parseInt(input);
        if (isNaN(num) || num < 2) {
          return 'Please enter a number greater than 1';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'prefix',
      message: 'Enter prefix for output files (optional, press enter to skip):',
      default: ''
    },
    {
      type: 'input',
      name: 'outputBaseName',
      message: 'Enter base name for output files:',
      default: defaultBaseName,
      validate: (input) => {
        if (!input || input.trim() === '') {
          return 'Please enter a valid base name';
        }
        return true;
      }
    }
  ]);

  return {
    numParts: parseInt(answers.numParts),
    prefix: answers.prefix.trim(),
    outputBaseName: answers.outputBaseName.trim()
  };
};
