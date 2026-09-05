"use client";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Field } from "./Field";

export function Scene({ count, still }: { count: number; still: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={still ? "demand" : "always"}
      camera={{ position: [0, 0, 7.4], fov: 55 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
    >
      <Suspense fallback={null}>
        <Field count={count} still={still} />
      </Suspense>
    </Canvas>
  );
}
