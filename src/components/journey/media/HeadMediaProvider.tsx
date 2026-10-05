"use client";
import { createContext, useContext } from "react";
import type { HeadMediaMap } from "@/lib/journey/media.server";

const HeadMediaContext = createContext<HeadMediaMap>({});

/**
 * Hands the client the head media that exists on disk (found at build time by
 * `scanHeadMedia`). Pages wrap their journey in it; anything below reads it
 * with `useHeadMedia`.
 */
export function HeadMediaProvider({ media, children }: { media: HeadMediaMap; children: React.ReactNode }) {
  return <HeadMediaContext.Provider value={media}>{children}</HeadMediaContext.Provider>;
}

export const useHeadMedia = () => useContext(HeadMediaContext);
