"use client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText };

/** The three reveal tiers from the design-intelligence motion set. */
export const TIER = {
  subtle: { y: 12, duration: 0.35, ease: "power1.out", start: "top 90%" },
  standard: { y: 24, duration: 0.5, stagger: 0.08, ease: "power2.out", start: "top 85%" },
  display: { yPercent: 110, duration: 1.1, ease: "power4.out", stagger: 0.08, start: "top 80%" },
} as const;
