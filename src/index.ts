import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { args } from "./argv.js";
import { FileNameFormatKeys } from "./constants.js";
import type { OutputFileType } from "./types.js";
import { checkIsImage } from "./utils.js";

if (!(await fs.exists(args.outputPath))) {
  await fs.mkdir(args.outputPath, { recursive: true });
}

const optimizeImage = async (
  inputPath: string,
  fileType: OutputFileType,
  quality: number,
  width?: number,
  height?: number,
) => {
  try {
    let temp = sharp(inputPath);
    if (width && height) {
      temp = temp.resize({ width, height, withoutEnlargement: true });
    }
    if (fileType === "jpeg" || fileType === "jpg") {
      temp = temp.jpeg({ quality, mozjpeg: true, force: true });
    } else if (fileType === "webp") {
      temp = temp.webp({ quality, force: true });
    } else if (fileType === "png") {
      temp = temp.png({ quality, force: true });
    } else {
      temp = temp.toFormat(fileType, { quality });
    }
    const result = await temp.toBuffer();
    console.log(`Optimized: ${inputPath}`);
    return result;
  } catch (error) {
    console.error(`Error optimizing ${inputPath}:`, error);
  }
};

const processImage = async (
  inputPath: string,
  outputDir: string,
  fileType: OutputFileType,
  quality: number,
  override: boolean,
  width?: number,
  height?: number,
) => {
  const isImage = await checkIsImage(inputPath);
  if (!isImage) {
    console.info(`Skipping non-image file: ${inputPath}`);
  }
  const originalFileName = path.parse(inputPath).name;
  const metadata = await sharp(inputPath).metadata();
  if (metadata.width && metadata.height) {
    if (!width && !height) {
      width = metadata.width;
      height = metadata.height;
    }
    if (!width || !height) {
      if (!width) {
        width = Math.floor(height! * (metadata.width / metadata.height));
      }
      if (!height) {
        height = Math.floor(width! * (metadata.height / metadata.width));
      }
    }
  }
  let outputPath = path.join(
    outputDir,
    args.fileNameFormat
      .replace(FileNameFormatKeys.TITLE, originalFileName)
      .replace(FileNameFormatKeys.QUALITY, String(quality)),
  );
  if (width) {
    outputPath = outputPath.replace(FileNameFormatKeys.WIDTH, String(width));
  }
  if (height) {
    outputPath = outputPath.replace(FileNameFormatKeys.HEIGHT, String(height));
  }
  if (!override && (await fs.exists(`${outputPath}.${fileType}`))) {
    outputPath += `-optimized.${fileType}`;
  } else {
    outputPath += `.${fileType}`;
  }
  const file = await optimizeImage(inputPath, fileType, quality, width, height);
  if (file) {
    await fs.writeFile(outputPath, file);
  }
};

const processPath = async (
  inputPath: string,
  outputDir: string,
  fileType: OutputFileType,
  quality: number,
  override: boolean,
  width?: number,
  height?: number,
) => {
  if ((await fs.lstat(inputPath)).isFile()) {
    await processImage(inputPath, outputDir, fileType, quality, override, width, height);
  } else if ((await fs.lstat(inputPath)).isDirectory()) {
    const files = await fs.readdir(inputPath);
    files.forEach((file) => {
      processImage(path.join(inputPath, file), outputDir, fileType, quality, override, width, height);
    });
  } else {
    console.error("Invalid input path");
  }
};

export const cli = () => {
  if (!args.dimensions.length) {
    args.inputPaths.forEach((path) => processPath(path, args.outputPath, args.fileType, args.quality, args.override));
  }
  args.inputPaths.forEach((path) =>
    args.dimensions.forEach((dimension) => {
      processPath(path, args.outputPath, args.fileType, args.quality, args.override, dimension.width, dimension.height);
    }),
  );
};
