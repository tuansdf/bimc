import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { args } from "./argv.js";
import type { ValidOutputFormat } from "./types.js";
import { checkIsImage } from "./utils.js";

if (!(await fs.exists(args.output))) {
  await fs.mkdir(args.output, { recursive: true });
}

const optimizeImage = async (
  inputPath: string,
  outputPath: string,
  format: ValidOutputFormat,
  quality: number,
) => {
  try {
    await sharp(inputPath).toFormat(format, { quality }).toFile(outputPath);
    console.log(`Optimized: ${outputPath}`);
  } catch (error) {
    console.error(`Error optimizing ${inputPath}:`, error);
  }
};

const processImage = async (
  inputPath: string,
  outputDir: string,
  format: ValidOutputFormat,
  quality: number,
  override: boolean,
) => {
  const isImage = await checkIsImage(inputPath);
  if (!isImage) {
    console.info(`Skipping non-image file: ${inputPath}`);
  }
  let outputPath = path.join(
    outputDir,
    `${path.parse(inputPath).name}.${format}`,
  );
  if (!override && (await fs.exists(outputPath))) {
    outputPath = path.join(
      outputDir,
      `${path.parse(inputPath).name}-optimized.${format}`,
    );
  }
  await optimizeImage(inputPath, outputPath, format, quality);
};

const processPath = async (
  inputPath: string,
  outputDir: string,
  format: ValidOutputFormat,
  quality: number,
  override: boolean,
) => {
  if ((await fs.lstat(inputPath)).isFile()) {
    await processImage(inputPath, outputDir, format, quality, override);
  } else if ((await fs.lstat(inputPath)).isDirectory()) {
    const files = await fs.readdir(inputPath);
    files.forEach((file) => {
      processImage(
        path.join(inputPath, file),
        outputDir,
        format,
        quality,
        override,
      );
    });
  } else {
    console.error("Invalid input path");
  }
};

const main = () => {
  args.input.forEach((path) =>
    processPath(path, args.output, args.format, args.quality, args.override),
  );
};

main();
