"use client";
import { MotionConfig } from "framer-motion";
import { RouteScroll } from "./RouteScroll";
import { SmoothAnchors } from "./SmoothAnchors";
import { SmoothScroll } from "./SmoothScroll";
import { SceneCanvas } from "./three/SceneCanvas";
import { PageProgress } from "./ui/PageProgress";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll>
        <PageProgress />
        <SmoothAnchors />
        <RouteScroll />
        <SceneCanvas />
        {children}
      </SmoothScroll>
    </MotionConfig>
  );
}
