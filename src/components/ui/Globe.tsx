"use client";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

/* Coarse continent outlines as [lat, lon] pairs. Only used to place decorative dots. */
const LAND: [number, number][][] = [
  [[72, -168], [70, -140], [72, -95], [60, -65], [47, -52], [45, -65], [30, -80], [25, -97], [18, -105], [23, -110], [33, -118], [48, -125], [60, -140], [65, -165]],
  [[83, -35], [80, -20], [70, -22], [60, -43], [66, -53], [76, -70], [82, -60]],
  [[12, -72], [8, -60], [0, -50], [-8, -35], [-23, -41], [-35, -53], [-50, -68], [-55, -70], [-42, -74], [-18, -71], [-5, -81], [8, -78]],
  [[71, 28], [60, 30], [50, 40], [45, 30], [41, 27], [37, 23], [40, 18], [38, 15], [43, 10], [43, -9], [36, -6], [43, -2], [48, -5], [49, 0], [52, 4], [55, 8], [58, 5], [63, 5], [69, 15]],
  [[58, -6], [58, -2], [51, 1], [50, -5], [54, -4]],
  [[37, -6], [37, 10], [31, 32], [11, 43], [0, 42], [-5, 39], [-25, 35], [-34, 20], [-33, 17], [-17, 12], [-5, 10], [5, -2], [5, -8], [12, -17], [20, -17], [28, -12]],
  [[75, 60], [76, 105], [70, 140], [66, 170], [60, 165], [55, 140], [45, 135], [40, 120], [38, 125], [30, 122], [22, 115], [15, 108], [8, 105], [1, 103], [6, 100], [15, 97], [22, 90], [20, 85], [8, 77], [20, 72], [25, 60], [23, 55], [13, 45], [30, 35], [36, 36], [41, 28], [45, 35], [48, 45], [52, 50], [60, 55]],
  [[45, 142], [40, 140], [34, 131], [33, 134], [36, 140], [41, 141]],
  [[-12, 131], [-12, 136], [-16, 146], [-27, 153], [-38, 147], [-38, 140], [-35, 135], [-32, 115], [-22, 114], [-15, 124]],
  [[-70, -180], [-70, 180], [-90, 180], [-90, -180]],
];

const PINS: { name: string; lat: number; lon: number }[] = [
  { name: "London", lat: 51.5, lon: -0.1 },
  { name: "Toronto", lat: 43.7, lon: -79.4 },
  { name: "New York", lat: 40.7, lon: -74 },
  { name: "Sydney", lat: -33.9, lon: 151.2 },
  { name: "Frankfurt", lat: 50.1, lon: 8.7 },
];

const inside = (lat: number, lon: number, poly: [number, number][]) => {
  let ok = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [yi, xi] = poly[i], [yj, xj] = poly[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) ok = !ok;
  }
  return ok;
};

const toVec = (lat: number, lon: number) => {
  const p = (lat * Math.PI) / 180, l = (lon * Math.PI) / 180;
  return [Math.cos(p) * Math.sin(l), Math.sin(p), Math.cos(p) * Math.cos(l)] as const;
};

let DOTS: (readonly [number, number, number])[] | null = null;
const dots = () => {
  if (DOTS) return DOTS;
  const out: (readonly [number, number, number])[] = [];
  for (let lat = -84; lat <= 84; lat += 3.2) {
    const step = 3.2 / Math.max(0.2, Math.cos((lat * Math.PI) / 180));
    for (let lon = -180; lon < 180; lon += step) if (LAND.some((p) => inside(lat, lon, p))) out.push(toVec(lat, lon));
  }
  return (DOTS = out);
};

/** Lightweight interactive globe drawn on a canvas. Drag or use arrow keys to rotate. */
export function Globe({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let ry = -0.6, rx = 0.35, vel = 0, size = 0, raf = 0, visible = true, dragging = false, lastX = 0, lastY = 0, idle = 0;
    const land = dots();
    const pins = PINS.map((p) => ({ ...p, v: toVec(p.lat, p.lon) }));

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      size = Math.min(r.width, r.height);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = size * dpr; canvas.height = size * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const project = (v: readonly [number, number, number]) => {
      const cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx);
      const x1 = v[0] * cy + v[2] * sy, z1 = -v[0] * sy + v[2] * cy;
      const y2 = v[1] * cx - z1 * sx, z2 = v[1] * sx + z1 * cx;
      return [x1, y2, z2] as const;
    };

    const draw = () => {
      const R = size / 2 - 4, c = size / 2;
      // Canvas can measure 0 before first layout; a negative radius throws in createRadialGradient.
      if (R <= 0) return;
      ctx.clearRect(0, 0, size, size);
      // sphere body
      const g = ctx.createRadialGradient(c - R * 0.35, c - R * 0.4, R * 0.1, c, c, R);
      g.addColorStop(0, "#ffffff"); g.addColorStop(0.5, "#ddebff"); g.addColorStop(1, "#b3cdfa");
      ctx.beginPath(); ctx.arc(c, c, R, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
      // graticule (meridians) rotating with the globe
      ctx.strokeStyle = "rgba(36,87,245,0.16)"; ctx.lineWidth = 1;
      for (let m = 0; m < 12; m++) {
        ctx.beginPath();
        let started = false;
        for (let t = -90; t <= 90; t += 4) {
          const [x, y, z] = project(toVec(t, m * 30));
          if (z < 0) { started = false; continue; }
          const px = c + x * R, py = c - y * R;
          if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let started = false;
        for (let lon = -180; lon <= 180; lon += 4) {
          const [x, y, z] = project(toVec(lat, lon));
          if (z < 0) { started = false; continue; }
          const px = c + x * R, py = c - y * R;
          if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      // land dots
      const dr = Math.max(1.1, size / 300);
      for (const v of land) {
        const [x, y, z] = project(v);
        if (z <= 0) continue;
        ctx.globalAlpha = 0.25 + z * 0.65;
        ctx.fillStyle = "#2457F5";
        ctx.beginPath(); ctx.arc(c + x * R, c - y * R, dr, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      // pins
      for (const p of pins) {
        const [x, y, z] = project(p.v);
        if (z <= 0.05) continue;
        const px = c + x * R, py = c - y * R;
        ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2); ctx.fillStyle = "rgba(240,107,93,0.25)"; ctx.fill();
        ctx.beginPath(); ctx.arc(px, py, 3.5, 0, Math.PI * 2); ctx.fillStyle = "#F06B5D"; ctx.fill();
        ctx.lineWidth = 1.5; ctx.strokeStyle = "#fff"; ctx.stroke();
      }
      // rim
      ctx.beginPath(); ctx.arc(c, c, R, 0, Math.PI * 2); ctx.strokeStyle = "rgba(11,31,58,0.15)"; ctx.lineWidth = 1; ctx.stroke();
    };

    const tick = () => {
      raf = 0;
      if (!visible) return;
      if (!dragging) {
        idle += 1;
        if (Math.abs(vel) > 0.0004) { ry += vel; vel *= 0.94; }
        else if (!reduce && idle > 90) ry += 0.0025;
        rx += (0.35 - rx) * 0.01;
      }
      draw();
      if (!reduce || Math.abs(vel) > 0.0004) raf = requestAnimationFrame(tick);
    };
    const start = () => { if (!raf && visible) raf = requestAnimationFrame(tick); };

    const down = (e: PointerEvent) => { dragging = true; idle = 0; vel = 0; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY; lastX = e.clientX; lastY = e.clientY;
      vel = dx * 0.005; ry += dx * 0.005; rx = Math.max(-0.9, Math.min(0.9, rx + dy * 0.005));
      draw(); start();
    };
    const up = () => { dragging = false; idle = 0; start(); };
    const key = (e: KeyboardEvent) => {
      const map: Record<string, () => void> = { ArrowLeft: () => (ry -= 0.12), ArrowRight: () => (ry += 0.12), ArrowUp: () => (rx = Math.min(0.9, rx + 0.12)), ArrowDown: () => (rx = Math.max(-0.9, rx - 0.12)) };
      if (map[e.key]) { e.preventDefault(); map[e.key](); idle = 0; draw(); start(); }
    };

    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) start(); });
    const ro = new ResizeObserver(resize);
    io.observe(canvas); ro.observe(canvas);
    canvas.addEventListener("pointerdown", down); canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up); canvas.addEventListener("keydown", key);
    resize(); start();
    return () => {
      io.disconnect(); ro.disconnect(); if (raf) cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", down); canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up); canvas.removeEventListener("pointercancel", up); canvas.removeEventListener("keydown", key);
    };
  }, [reduce]);

  return (
    <canvas
      ref={ref}
      tabIndex={0}
      role="img"
      aria-label="Interactive globe highlighting study destinations. Drag or use arrow keys to rotate."
      className={`block size-full cursor-grab touch-pan-y rounded-full active:cursor-grabbing ${className}`}
    />
  );
}
