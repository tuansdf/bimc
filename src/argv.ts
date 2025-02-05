import path from "path";
import { parseArgs } from "util";
import {
  FileNameFormatKeys,
  SUPPORTED_IMAGE_MIME_TYPES,
  SUPPORTED_OUTPUT_FILE_TYPES,
} from "./constants.js";
import type { Args, OutputFileType } from "./types.js";

const help = `
Usage: imgcps [options]

Options:
  -i, --input <input>               Input file or directory. Support: ${SUPPORTED_IMAGE_MIME_TYPES.join(", ")} (default: current directory)
  -o, --output <output>             Output directory (default: current directory)
  -t, --type <type>                 Output file type. Values: ${SUPPORTED_OUTPUT_FILE_TYPES.join(", ")} (default: webp)
  -d, --dimension <dimension>       If width and heigth are specified, images will be croped accordingly. If either width or height is specified, the scale will be kept. Values: [width]x[height]. Example: 600x800, x800, 600x
  -q, --quality <quality>           Values: 1 - 100 (default: 70)
  --file-name <format>              Format for the output file name. Accepted keys: ${Object.values(FileNameFormatKeys).join(", ")}. Example: ${FileNameFormatKeys.TITLE}-w${FileNameFormatKeys.QUALITY}-h${FileNameFormatKeys.HEIGHT}-q${FileNameFormatKeys.QUALITY} (default: ${FileNameFormatKeys.TITLE})
  --override <override>             To override the file or not. If you do not wish to override the file, and the file names conflict, append "-optimized" to the file names (default: false)
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
    type: {
      type: "string",
      short: "f",
      multiple: false,
      default: "webp",
    },
    dimension: {
      type: "string",
      short: "d",
      multiple: true,
      default: [],
    },
    "file-name": {
      type: "string",
      multiple: false,
      default: FileNameFormatKeys.TITLE,
    },
    quality: {
      type: "string",
      short: "q",
      multiple: false,
      default: "70",
    },
    override: {
      type: "boolean",
      multiple: false,
      default: false,
    },
    help: {
      type: "boolean",
      short: "q",
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
  if (!SUPPORTED_OUTPUT_FILE_TYPES.includes(values.type as any)) {
    console.error("Invalid output file format");
    showHelp();
    process.exit(1);
  }
  if (
    !Number(values.quality) ||
    Number(values.quality) < 1 ||
    Number(values.quality) > 100
  ) {
    console.error("Invalid quality");
    showHelp();
    process.exit(1);
  }
  const dimensions = values.dimension.map((dimension) => {
    try {
      const split = dimension.split("x");
      const result = {
        width: Number(split[0].trim()),
        height: Number(split[1].trim()),
      };
      if (
        (!result.width || result.width <= 0) &&
        (!result.height || result.height <= 0)
      ) {
        throw new Error();
      }
      return result;
    } catch (e) {
      console.error("Invalid dimension");
      showHelp();
      process.exit(1);
    }
  });
  return {
    inputPaths: values.input.map((filePath) =>
      path.resolve(process.cwd(), filePath),
    ),
    outputPath: path.resolve(process.cwd(), values.output),
    fileType: values.type as OutputFileType,
    quality: Number(values.quality),
    override: values.override,
    fileNameFormat: values["file-name"],
    dimensions,
  };
};

export const args = validateArgs();
