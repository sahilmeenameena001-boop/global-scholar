/** Target point layouts the field morphs between, one per chapter. */

const TAU = Math.PI * 2;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/** Chapter 0 — the globe: evenly distributed sphere (Fibonacci). */
function sphere(n: number, r = 2.6): Float32Array {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const rad = Math.sqrt(Math.max(0, 1 - y * y));
    const th = GOLDEN * i;
    a[i * 3] = Math.cos(th) * rad * r;
    a[i * 3 + 1] = y * r;
    a[i * 3 + 2] = Math.sin(th) * rad * r;
  }
  return a;
}

/** Chapter 1 — destinations: a wide scattered grid plane, like pins on a map. */
function grid(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  const cols = Math.ceil(Math.sqrt(n * 1.8));
  for (let i = 0; i < n; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    a[i * 3] = (c / cols - 0.5) * 9;
    a[i * 3 + 1] = (r / (n / cols) - 0.5) * 5;
    a[i * 3 + 2] = Math.sin(c * 0.5) * Math.cos(r * 0.5) * 0.7;
  }
  return a;
}

/** Chapter 2 — the match: a double helix, two profiles converging. */
function helix(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const strand = i % 2 === 0 ? 0 : Math.PI;
    const ang = t * TAU * 3 + strand;
    a[i * 3] = Math.cos(ang) * 1.7;
    a[i * 3 + 1] = (t - 0.5) * 7;
    a[i * 3 + 2] = Math.sin(ang) * 1.7;
  }
  return a;
}

/** Chapter 3 — the journey: a flight route arcing through space. */
function route(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const spread = (Math.random() - 0.5) * 0.5;
    a[i * 3] = (t - 0.5) * 10;
    a[i * 3 + 1] = Math.sin(t * Math.PI) * 2.6 - 1 + spread;
    a[i * 3 + 2] = Math.cos(t * Math.PI * 2) * 1.2 + spread;
  }
  return a;
}

/** Chapter 4 — funding: a ring, value orbiting a centre. */
function ring(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * TAU;
    const band = 2.4 + (i % 7) * 0.09;
    a[i * 3] = Math.cos(ang) * band;
    a[i * 3 + 1] = Math.sin(ang) * band * 0.55;
    a[i * 3 + 2] = ((i % 11) - 5) * 0.08;
  }
  return a;
}

/** Chapter 5 — arrival: a loose constellation that settles. */
function constellation(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = 2.2 + Math.random() * 2.4;
    const th = Math.random() * TAU;
    const ph = Math.acos(2 * Math.random() - 1);
    a[i * 3] = Math.sin(ph) * Math.cos(th) * r;
    a[i * 3 + 1] = Math.cos(ph) * r * 0.8;
    a[i * 3 + 2] = Math.sin(ph) * Math.sin(th) * r;
  }
  return a;
}

export function buildTargets(n: number): Float32Array[] {
  return [sphere(n), grid(n), helix(n), route(n), ring(n), constellation(n)];
}
