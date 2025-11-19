export interface VideoFile {
  name: string;
  path: string;
  size: string;
  modified: Date;
}

export interface SplitOptions {
  numParts: number;
  prefix: string;
  outputBaseName: string;
}
