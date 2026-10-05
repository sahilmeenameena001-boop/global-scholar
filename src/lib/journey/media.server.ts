import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { HEAD_MEDIA_DIR } from "@/data/journey/media";

/**
 * Finds the head media that has been dropped into `public/global-scholar/head/`
 * (see `data/journey/media.ts` for the naming). Server-only: it reads the disk
 * at build time and hands the client a map of what exists, so the browser
 * never requests a clip that isn't there.
 */

export type HeadMediaSet = { webm?: string; mp4?: string; mobileWebm?: string; mobileMp4?: string; poster?: string; image?: string };
export type HeadMediaMap = Record<string, HeadMediaSet>;

const FILE = /^(.+?)(-mobile|-poster)?\.(webm|mp4|webp|jpg|jpeg|png|avif)$/i;

export function scanHeadMedia(): HeadMediaMap {
  const dir = join(process.cwd(), "public", HEAD_MEDIA_DIR);
  if (!existsSync(dir)) return {};
  const map: HeadMediaMap = {};
  for (const file of readdirSync(dir)) {
    const m = FILE.exec(file);
    if (!m) continue;
    const [, key, variant, ext] = m;
    const url = `/${HEAD_MEDIA_DIR}/${file}`;
    const set = (map[key] ??= {});
    const e = ext.toLowerCase();
    if (variant === "-poster") set.poster = url;
    else if (e === "webm") set[variant === "-mobile" ? "mobileWebm" : "webm"] = url;
    else if (e === "mp4") set[variant === "-mobile" ? "mobileMp4" : "mp4"] = url;
    else if (!variant) set.image = url;
  }
  return map;
}
