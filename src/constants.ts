export const OUTPUT_FILE_TYPES = ["jpg", "jpeg", "png", "webp"] as const;

export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/heif",
  "image/tiff",
] as const;

export const FileNameFormatKeys = {
  TITLE: "[title]",
  QUALITY: "[quality]",
  WIDTH: "[width]",
  HEIGHT: "[height]",
};
