# NixOS Installation

This guide shows how to install clipr on NixOS using a custom package definition.

## Installation

### Option 1: Home Manager (Recommended)

Add clipr to your Home Manager configuration:

**1. Create the package definition**

Create `packages/clipr.nix` in your NixOS configuration directory:

```nix
{ lib, stdenv, fetchurl, makeWrapper, nodejs, ffmpeg }:

stdenv.mkDerivation rec {
  pname = "clipr";
  version = "1.0.0";

  # Fetch the pre-built release asset
  src = fetchurl {
    url = "https://github.com/srosato/clipr/releases/download/v${version}/clipr";
    hash = "sha256-ZuSTnYOLkqjZ73ScBo74wYCCIl73oq4sBKWhq+u+x5k=";
  };

  dontUnpack = true;

  nativeBuildInputs = [ makeWrapper ];

  installPhase = ''
    mkdir -p $out/bin
    cp $src $out/bin/clipr
    chmod +x $out/bin/clipr

    # Wrap to ensure node and ffmpeg are in PATH
    wrapProgram $out/bin/clipr \
      --prefix PATH : ${lib.makeBinPath [ nodejs ffmpeg ]}
  '';

  meta = with lib; {
    description = "Interactive CLI tool to merge and split MP4 videos using ffmpeg";
    homepage = "https://github.com/srosato/clipr";
    license = licenses.isc;
    maintainers = [ ];
    platforms = platforms.unix;
  };
}
```

**2. Add to your Home Manager configuration**

In your `home.nix` or equivalent:

```nix
{ config, pkgs, ... }:
{
  home.packages = with pkgs; [
    # ... other packages
    (pkgs.callPackage ./packages/clipr.nix {})
  ];
}
```

**3. Rebuild**

```bash
home-manager switch --flake .
```

### Option 2: NixOS System Packages

Add to `configuration.nix` or a system module:

```nix
{ config, pkgs, ... }:
{
  environment.systemPackages = with pkgs; [
    # ... other packages
    (pkgs.callPackage ./packages/clipr.nix {})
  ];
}
```

Then rebuild:

```bash
sudo nixos-rebuild switch
```

## Updating

When a new version is released:

1. Update the `version` in `packages/clipr.nix`
2. Get the new hash:
   ```bash
   nix hash file /path/to/new/clipr
   ```
3. Update the `hash` in the package definition
4. Rebuild your configuration

## Verifying Installation

After rebuilding, verify clipr is available:

```bash
clipr --help
```

The package automatically includes:
- ✅ Node.js runtime
- ✅ ffmpeg for video processing
- ✅ Proper PATH wrapping

## Troubleshooting

### "clipr: command not found"

Make sure you've rebuilt your configuration after adding the package.

### Version mismatch errors

The hash changes with each release. Always update both the `version` and `hash` fields when upgrading.

### Missing dependencies

The package should automatically include all required dependencies. If you encounter issues, ensure `nodejs` and `ffmpeg` are available in your system.
