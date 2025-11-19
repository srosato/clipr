# clipr

A TypeScript CLI tool to merge and split MP4 videos using ffmpeg.

## Features

- **Merge** - Combine multiple MP4 videos into one
  - Scans directory for MP4 videos
  - Optional date filtering (e.g., `--days 7` for last week)
  - Interactive multi-selection with checkbox interface
  - Shows file size and modification date for each video
  - Fast, lossless merging (no re-encoding)

- **Split** - Divide an MP4 video into multiple parts
  - Scans directory for MP4 videos
  - Optional date filtering
  - Interactive single video selection
  - Specify number of parts to split into
  - Optional prefix for output filenames
  - Custom base name for output files
  - Fast, lossless splitting (no re-encoding)

## Installation

```bash
pnpm install
```

## Usage

### Merge videos

Quick start (with tsx - no build needed):

```bash
pnpm start
# or
pnpm exec tsx src/index.ts merge
```

With custom options:

```bash
pnpm exec tsx src/index.ts merge --directory /path/to/videos --output my-merged-video.mp4
```

### Split videos

```bash
pnpm exec tsx src/index.ts split

# With custom options
pnpm exec tsx src/index.ts split --directory /path/to/videos --output-dir ./output
```

### Build and run compiled TypeScript:

```bash
pnpm build
node dist/index.js merge
```

### Build single-file executable:

```bash
pnpm build:bundle

# Run merge
node clipr merge

# Run split
node clipr split

# Or install globally
sudo cp clipr /usr/local/bin/
clipr merge
clipr split
```

## Commands

### `clipr merge`

Merge multiple MP4 videos into one.

**Options:**
- `-d, --directory <path>` - Directory to search for videos (default: current directory)
- `-o, --output <name>` - Output file name (skips interactive prompt)
- `--days <number>` - Only show videos from last N days (default: all videos)

**Examples:**
```bash
# Merge any videos in current directory
clipr merge

# Only show videos from last 7 days
clipr merge --days 7

# Specify output name
clipr merge --output "vacation-2024.mp4"
```

**Interactive prompts:**
1. Select videos to merge (multi-select with checkboxes)
2. Enter output filename (default: merged-output)

### `clipr split`

Split an MP4 video into multiple parts.

**Options:**
- `-d, --directory <path>` - Directory to search for videos (default: current directory)
- `-o, --output-dir <path>` - Output directory for split parts (default: out)
- `--days <number>` - Only show videos from last N days (default: all videos)

**Examples:**
```bash
# Split a video
clipr split

# Only show recent videos
clipr split --days 30

# Custom output directory
clipr split --output-dir ./my-splits
```

**Interactive prompts:**
1. Select video to split (single selection)
2. Number of parts to split into (default: 2)
3. Optional prefix for output files
4. Base name for output files

## Requirements

- Node.js (v16 or higher)
- pnpm (package manager)
- ffmpeg installed and available in PATH

## How it works

### Merge

1. Scans the specified directory for MP4 files
2. Optionally filters videos by date (if `--days` flag is used)
3. Displays an interactive checkbox list to select videos
4. Prompts for output filename (default: merged-output, .mp4 extension added automatically)
5. Uses ffmpeg concat demuxer to merge selected videos without re-encoding
6. Outputs the merged video with no quality loss

### Split

1. Scans the specified directory for MP4 files
2. Optionally filters videos by date (if `--days` flag is used)
3. Displays an interactive list to select a single video
4. Prompts for split options (number of parts, prefix, base name)
5. Uses ffprobe to determine video duration and calculates duration per part
6. Uses ffmpeg to split the video into parts without re-encoding (-c copy)
7. Outputs split parts to a subdirectory with consistent naming
