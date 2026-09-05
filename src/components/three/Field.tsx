"use client";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { scene as store } from "./sceneStore";
import { buildTargets } from "./shapes";

/** Soft round sprite, generated at runtime so no texture file ships. */
function useDotTexture() {
  return useMemo(() => {
    const s = 64;
    const c = document.createElement("canvas");
    c.width = c.height = s;
    const g = c.getContext("2d")!;
    const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.4, "rgba(255,255,255,0.55)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, s, s);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
}

export function Field({ count, still }: { count: number; still: boolean }) {
  const points = useRef<THREE.Points>(null);
  const map = useDotTexture();
  const { size } = useThree();

  const targets = useMemo(() => buildTargets(count), [count]);

  // live positions start on the first target so the opening frame is already composed
  const positions = useMemo(() => Float32Array.from(targets[0]), [targets]);

  const colors = useMemo(() => {
    const royal = new THREE.Color("#5b86ff");
    const coral = new THREE.Color("#f06b5d");
    const sky = new THREE.Color("#ddebff");
    const a = new Float32Array(count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const r = i / count;
      c.copy(royal).lerp(sky, (Math.sin(r * 9) + 1) / 2 * 0.55);
      if (i % 17 === 0) c.copy(coral);
      a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b;
    }
    return a;
  }, [count]);

  useFrame((state, delta) => {
    const p = points.current;
    if (!p) return;
    const d = Math.min(delta, 1 / 30);

    if (!still) {
      const attr = p.geometry.attributes.position as THREE.BufferAttribute;
      const arr = attr.array as Float32Array;
      const to = targets[Math.min(store.target, targets.length - 1)];
      const k = 1 - Math.pow(0.0016, d); // frame-rate independent ease
      for (let i = 0; i < arr.length; i++) arr[i] += (to[i] - arr[i]) * k;
      attr.needsUpdate = true;

      // the opening chapter sits the globe right of the headline; later shapes recentre
      const wide = size.width >= 1024;
      const tx = store.target === 0 && wide ? 1.85 : 0;
      p.position.x = THREE.MathUtils.lerp(p.position.x, tx, k * 0.5);

      // a deck swipe adds spin that bleeds off over roughly a second
      store.spin *= Math.pow(0.02, d);
      p.rotation.y += (0.055 + store.spin) * d;
      p.rotation.x = THREE.MathUtils.lerp(p.rotation.x, store.py * 0.22, k * 0.6);
    }

    // camera drifts with the pointer and pulls back as the story advances
    const cam = state.camera;
    cam.position.x = THREE.MathUtils.lerp(cam.position.x, store.px * 0.9, 0.04);
    cam.position.y = THREE.MathUtils.lerp(cam.position.y, -store.py * 0.6, 0.04);
    cam.position.z = THREE.MathUtils.lerp(cam.position.z, 7.4 + store.progress * 2.2, 0.03);
    cam.lookAt(0, 0, 0);
  });

  const dpi = Math.min(size.width, 1600) / 1600;

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={map}
        size={0.055 + dpi * 0.02}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.92}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
