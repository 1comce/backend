// src/utils/paths.ts
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

// Only needed for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ROOT_DIR = path.join(__dirname, "..", "..");
export const PUBLIC_DIR = path.join(ROOT_DIR, "public");
export const UPLOADS_DIR = path.join(PUBLIC_DIR, "uploads");
export const IMAGES_DIR = path.join(PUBLIC_DIR, "images");

// Ensure directories exist
export async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true }); // Will do nothing if dir exists
}

export function initDirs() {
  [PUBLIC_DIR, UPLOADS_DIR, IMAGES_DIR].forEach((dir) => {
    ensureDir(dir);
  });
}
