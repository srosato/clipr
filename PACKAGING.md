# Packaging Options

This document explains different ways to package clipr as a single binary.

## Option 1: Single JS Bundle with ncc (Requires Node.js installed)

This bundles all dependencies into a single JavaScript file. Node.js must be installed on the target system.

### Build:
```bash
pnpm build:bundle
```

### Output:
- `clipr` - A single 591KB executable file containing everything

### Usage:
```bash
# Run directly with node
node clipr merge

# Or make it globally accessible
sudo cp clipr /usr/local/bin/clipr
clipr merge
```

### Pros:
- Fast build
- Small file size (~591KB)
- Works on any platform with Node.js

### Cons:
- Requires Node.js to be installed

---

## Option 2: True Standalone Binary (No Node.js required)

For a true standalone binary that doesn't require Node.js:

### Using pkg (deprecated but still works):
```bash
pnpm add -D pkg
```

Add to package.json scripts:
```json
"build:binary": "pkg . --targets node18-linux-x64,node18-macos-x64,node18-win-x64"
```

### Using Node.js SEA (Single Executable Applications) - Experimental:
Node.js 20+ has built-in support for creating standalone executables.

```bash
# Build the bundle first
pnpm build:bundle

# Create SEA config
cat > sea-config.json << 'EOF'
{
  "main": "bundle/index.js",
  "output": "sea-prep.blob"
}
EOF

# Generate blob
node --experimental-sea-config sea-config.json

# Copy node binary
cp $(command -v node) video-merger

# Inject the blob (Linux/macOS)
npx postject video-merger NODE_SEA_BLOB sea-prep.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 \
    --macho-segment-name NODE_SEA
```

### Using Bun:
```bash
# Install bun
curl -fsSL https://bun.sh/install | bash

# Compile to standalone binary
bun build src/index.ts --compile --outfile video-merger
```

### Using Deno:
```bash
# Convert to Deno-compatible code and compile
deno compile --allow-read --allow-write --allow-run src/index.ts
```

---

## Recommended Approach

For **development and personal use**: Use Option 1 (ncc bundle) - it's simple and fast.

For **distribution to users without Node.js**: Use Bun's compile feature or Node.js SEA.

The ncc bundle approach gives you a ~600KB single file that runs anywhere Node.js is installed, which is perfect for most use cases.
