"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { HeadMediaSet } from "@/lib/journey/media.server";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Plays a head clip and crossfades between clips without ever swapping the
 * `src` of a visible video. Each clip is its own layer keyed by `mediaKey`:
 * the incoming layer loads underneath at opacity 0, fades in over ~300ms once
 * it is actually playing, and the outgoing layer fades out and unmounts
 * (which stops it). At most two layers exist at once.
 *
 * Fallback chain per clip: WebM → MP4 → poster → nothing (the drawn world
 * underneath stays visible). Under reduced motion only the poster or still is
 * shown. Clips pause when off-screen or when the tab is hidden.
 */
export function CrossfadeVideo({ mediaKey, set }: { mediaKey: string; set: HeadMediaSet }) {
  const reduce = useReducedMotion();
  const mobile = useMediaQuery("(max-width: 767px)");
  const box = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState<Record<string, boolean>>({});
  const [failed, setFailed] = useState<Record<string, boolean>>({});

  // pause when the head scrolls out of view or the tab is hidden; resume when back
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let visible = true;
    const sync = () => el.querySelectorAll("video").forEach((v) => {
      if (visible && !document.hidden) void v.play().catch(() => {});
      else v.pause();
    });
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, []);

  const still = set.poster ?? set.image;
  const sources = [
    ...(mobile ? [set.mobileWebm && { src: set.mobileWebm, type: "video/webm" }, set.mobileMp4 && { src: set.mobileMp4, type: "video/mp4" }] : []),
    set.webm && { src: set.webm, type: "video/webm" },
    set.mp4 && { src: set.mp4, type: "video/mp4" },
  ].filter(Boolean) as { src: string; type: string }[];
  const playable = sources.length > 0 && !reduce && !failed[mediaKey];

  return (
    <div ref={box} className="absolute inset-0">
      <AnimatePresence initial={false}>
        {playable ? (
          <motion.video
            key={mediaKey}
            className="absolute inset-0 size-full object-cover"
            autoPlay muted playsInline loop preload="auto"
            poster={set.poster}
            initial={{ opacity: 0 }}
            animate={{ opacity: ready[mediaKey] ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onPlaying={() => setReady((r) => ({ ...r, [mediaKey]: true }))}
          >
            {sources.map((s, i) => (
              <source key={s.src} src={s.src} type={s.type}
                // the last source failing means every format failed: fall back to the still
                onError={i === sources.length - 1 ? () => setFailed((f) => ({ ...f, [mediaKey]: true })) : undefined} />
            ))}
          </motion.video>
        ) : still ? (
          <motion.img key={`${mediaKey}-still`} src={still} alt="" className="absolute inset-0 size-full object-cover"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
