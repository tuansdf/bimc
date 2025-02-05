import type { SUPPORTED_OUTPUT_FILE_TYPES } from "./constants.js";

export type Args = Readonly<{
  inputPaths: string[];
  outputPath: string;
  fileType: OutputFileType;
  quality: number;
  override: boolean;
  fileNameFormat: string;
  dimensions: { width: number; height: number }[];
}>;

export type OutputFileType = (typeof SUPPORTED_OUTPUT_FILE_TYPES)[number];
