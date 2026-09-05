"use client";
import { useGSAP } from "@gsap/react";
import dynamic from "next/dynamic";
import { useRef, useSyncExternalStore } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { scene as store } from "./sceneStore";

const Scene = dynamic(() => import("./Scene").then((m) => m.Scene), { ssr: false });

type Caps = { on: boolean; count: number };
let CACHED: Caps | null = null;

/** Probe once per page: WebGL support, core count and viewport decide the budget. */
const getCaps = (): Caps => {
  if (CACHED) return CACHED;
  let webgl = false;
  try {
    const c = document.createElement("canvas");
    webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch { webgl = false; }
  if (!webgl) return (CACHED = { on: false, count: 0 });
  const cores = navigator.hardwareConcurrency ?? 4;
  const narrow = window.matchMedia("(max-width: 767px)").matches;
  // a stuttering 3D field is worse than none: shed points before shedding frames
  const count = narrow ? 1600 : cores <= 4 ? 2800 : 5200;
  return (CACHED = { on: true, count });
};
const noSubscribe = () => () => {};

/**
 * One persistent WebGL field behind the whole document. Its shape is driven by
 * `data-chapter` markers, never by React state. Degrades to a pure-CSS field
 * on low-power devices, without WebGL, or under reduced motion.
 */
export function SceneCanvas() {
  const reduce = useReducedMotion();
  const caps = useSyncExternalStore(noSubscribe, getCaps, () => null);
  const root = useRef<HTMLDivElement>(null);

  // scroll + pointer feed the mutable store
  useGSAP(() => {
    const page = ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => { store.progress = self.progress; },
    });

    const chapters = Array.from(document.querySelectorAll<HTMLElement>("[data-chapter]"));
    const triggers = chapters.map((el) => {
      const n = Number(el.dataset.chapter ?? 0);
      return ScrollTrigger.create({
        trigger: el,
        start: "top center",
        end: "bottom center",
        onEnter: () => { store.target = n; },
        onEnterBack: () => { store.target = n; },
      });
    });

    const move = (e: PointerEvent) => {
      store.px = (e.clientX / window.innerWidth) * 2 - 1;
      store.py = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", move, { passive: true });

    return () => {
      page.kill();
      triggers.forEach((t) => t.kill());
      window.removeEventListener("pointermove", move);
    };
  }, { scope: root });

  return (
    <div ref={root} aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-void">
      {/* colour field sits under the particles and is the whole background when 3D is off */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 620px at 68% 18%, rgba(36,87,245,0.30), transparent 62%)," +
            "radial-gradient(760px 560px at 22% 72%, rgba(240,107,93,0.16), transparent 66%)," +
            "radial-gradient(1200px 900px at 50% 50%, rgba(13,23,40,0.85), #04070d 78%)",
        }}
      />
      {caps?.on && <Scene count={caps.count} still={reduce} />}
      <div className="grain absolute inset-0" />
      <div className="vignette absolute inset-0" />
    </div>
  );
}
