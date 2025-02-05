import type { OUTPUT_FILE_TYPES } from "./constants.js";

export type Args = Readonly<{
  inputPaths: string[];
  outputPath: string;
  fileType: OutputFileType;
  quality: number;
  override: boolean;
  fileNameFormat: string;
  dimensions: { width: number; height: number }[];
}>;

export type OutputFileType = (typeof OUTPUT_FILE_TYPES)[number];
