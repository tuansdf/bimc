import path from "path";
import { parseArgs } from "util";
import { VALID_IMAGE_MIME_TYPES, VALID_OUTPUT_FORMATS } from "./constants.js";
import type { Args, ValidOutputFormat } from "./types.js";

const help = `
Usage: imgcps [options]

Options:
  -i, --input <input>       Input file or directory. Support: ${VALID_IMAGE_MIME_TYPES.join(", ")} (default: current directory)
  -o, --output <output>     Output directory (default: current directory)
  -f, --format <format>     Output format. Values: ${VALID_OUTPUT_FORMATS.join(", ")} (default: webp)
  -q, --quality <quality>   Values: 0 - 100 (default: 80)
  --override <override>     To override the file or not. If you do not wish to override the file, and the file names conflict, append a timestamp to the file names (default: false)
`;

export const showHelp = () => {
  console.info(help);
};

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    input: {
      type: "string",
      short: "i",
      multiple: true,
      default: [process.cwd()],
    },
    output: {
      type: "string",
      short: "o",
      multiple: false,
      default: process.cwd(),
    },
    format: {
      type: "string",
      short: "f",
      multiple: false,
      default: "webp",
    },
    quality: {
      type: "string",
      short: "q",
      multiple: false,
      default: "80",
    },
    override: {
      type: "boolean",
      multiple: false,
      default: false,
    },
    help: {
      type: "boolean",
      short: "h",
      multiple: false,
      default: false,
    },
  },
  strict: true,
  allowPositionals: true,
});

const validateArgs = (): Args => {
  if (values.help) {
    showHelp();
    process.exit(0);
  }
  if (!VALID_OUTPUT_FORMATS.includes(values.format as any)) {
    console.error("Invalid output format");
    showHelp();
    process.exit(1);
  }
  return {
    input: values.input.map((filePath) =>
      path.resolve(process.cwd(), filePath),
    ),
    output: path.resolve(process.cwd(), values.output),
    format: values.format as ValidOutputFormat,
    quality: Number(values.quality),
    override: values.override,
  };
};

export const args = validateArgs();
