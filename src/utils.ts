import { fileTypeFromBuffer } from "file-type";
import fs from "fs/promises";
import { SUPPORTED_IMAGE_MIME_TYPES } from "./constants.js";

export const checkIsImage = async (fileName: string) => {
  const fileType = await fileTypeFromBuffer(await fs.readFile(fileName));
  return SUPPORTED_IMAGE_MIME_TYPES.includes(fileType?.mime as any);
};
