import type { VALID_OUTPUT_FORMATS } from "./constants.js";

export type Args = Readonly<{
  input: string[];
  output: string;
  format: ValidOutputFormat;
  quality: number;
  override: boolean;
}>;

export type ValidOutputFormat = (typeof VALID_OUTPUT_FORMATS)[number];
