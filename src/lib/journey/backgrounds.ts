import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Stage } from "./types";

/**
 * Stage backgrounds are plain files, so they can be swapped without touching
 * code. For each stage the page looks in `public/global-scholar/<stage>/` for:
 *
 *   background.(webp|avif|jpg|jpeg|png)          — required for a photo backdrop
 *   background-mobile.(webp|avif|jpg|jpeg|png)   — optional, used below 768px
 *
 * Missing files fall back to a drawn gradient. Server-only: it reads the disk
 * when the page is built, so a new file shows up on the next build or deploy.
 */

const EXTENSIONS = ["webp", "avif", "jpg", "jpeg", "png"];

export type StageBackground = { desktop: string; mobile: string | null };

/** Folder (relative to `public/`) that holds a stage's background. */
export const backgroundDir = (stage: Stage) => `global-scholar/${stage}`;

function find(stage: Stage, name: string) {
  for (const ext of EXTENSIONS) {
    const rel = `${backgroundDir(stage)}/${name}.${ext}`;
    if (existsSync(join(process.cwd(), "public", rel))) return `/${rel}`;
  }
  return null;
}

export function findBackground(stage: Stage): StageBackground | null {
  const desktop = find(stage, "background");
  const mobile = find(stage, "background-mobile");
  // a phone-only image still beats the drawn fallback on every screen
  if (!desktop) return mobile ? { desktop: mobile, mobile: null } : null;
  return { desktop, mobile };
}
