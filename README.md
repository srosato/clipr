# clipr

A TypeScript CLI tool to merge and split MP4 videos using ffmpeg.

## Features

- Automatically finds MP4 videos modified in the last 7 days
- Interactive selection with checkbox interface
- Shows file size and modification date for each video
- Uses ffmpeg for fast, lossless merging (no re-encoding)

## Installation

```bash
pnpm install
```

## Usage

### Quick start (with tsx - no build needed):

```bash
pnpm start
```

### Or run directly:

```bash
pnpm exec tsx src/index.ts merge
```

### With custom options:

```bash
pnpm exec tsx src/index.ts merge --directory /path/to/videos --output my-merged-video.mp4
```

### Build and run compiled TypeScript:

```bash
pnpm build
node dist/index.js merge
```

### Build single-file executable:

```bash
pnpm build:bundle
node clipr merge

# Or install globally
sudo cp clipr /usr/local/bin/
clipr merge
```

## Options

- `-d, --directory <path>` - Directory to search for videos (default: current directory)
- `-o, --output <name>` - Output file name (skips interactive prompt)

## Requirements

- Node.js (v16 or higher)
- pnpm (package manager)
- ffmpeg installed and available in PATH

## How it works

1. Scans the specified directory for MP4 files
2. Filters videos to only those modified in the last 7 days
3. Displays an interactive checkbox list to select videos
4. Prompts for output filename (default: merged-output, .mp4 extension added automatically if not included)
5. Creates a file list and uses ffmpeg concat demuxer to merge selected videos
6. Outputs the merged video with no quality loss
