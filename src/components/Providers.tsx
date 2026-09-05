"use client";
import { MotionConfig } from "framer-motion";
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
        <SceneCanvas />
        {children}
      </SmoothScroll>
    </MotionConfig>
  );
}
