#!/usr/bin/env node

import { Command } from 'commander';
import { setupSignalHandlers } from './utils/cleanup';
import { setupMergeCommand } from './commands/merge';
import { setupSplitCommand } from './commands/split';

setupSignalHandlers();

const program = new Command();

program
  .name('clipr')
  .description('CLI tool to merge and split MP4 videos')
  .version('1.0.0');

setupMergeCommand(program);
setupSplitCommand(program);

program.parse();
