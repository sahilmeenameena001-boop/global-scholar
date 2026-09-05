"use client";
import { useEffect, useState } from "react";

/** Line-splitting must wait for real font metrics, or lines break at the wrong words. */
export function useFontsReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    const done = () => alive && setReady(true);
    if (typeof document !== "undefined" && "fonts" in document) document.fonts.ready.then(done);
    else done();
    return () => { alive = false; };
  }, []);
  return ready;
}
