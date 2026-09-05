"use client";
import { useGSAP } from "@gsap/react";
import { ShieldCheck, Star, Users } from "lucide-react";
import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Headline } from "../ui/anim";
import { Button } from "../ui/Button";
import { Ticker } from "../ui/Ticker";

const CITIES = ["London", "Toronto", "Sydney", "New York", "Berlin", "Manchester", "Vancouver", "Melbourne", "Boston", "Munich", "Dublin", "Brisbane", "Chicago", "Edinburgh", "Montréal"];

const TRUST = [
  { Icon: ShieldCheck, label: "Free first consultation" },
  { Icon: Users, label: "Counsellors for 5 destinations" },
  { Icon: Star, label: "Honest, no-pressure shortlists" },
];

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  useGSAP(() => {
    if (reduce) return;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".hero-index > *", { opacity: 0, y: 14, duration: 0.7, stagger: 0.08 }, 0.1)
      .from(".hero-lede", { opacity: 0, y: 22, duration: 0.9 }, 0.95)
      .from(".hero-cta > *", { opacity: 0, y: 22, duration: 0.8, stagger: 0.09 }, 1.1)
      .from(".hero-trust li", { opacity: 0, y: 16, duration: 0.7, stagger: 0.07 }, 1.3)
      .from(".hero-foot", { opacity: 0, y: 20, duration: 0.9 }, 1.45)
      .from(".hero-cue", { opacity: 0, duration: 0.6 }, 1.7);
  }, { scope: root, dependencies: [reduce] });

  return (
    <section ref={root} id="top" data-chapter={0} className="relative flex min-h-[100svh] flex-col justify-center px-5 pb-10 pt-32 sm:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="hero-index mb-10 flex items-center gap-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-faint">
          <span className="text-royal-lit">01</span>
          <span aria-hidden className="h-px w-16 rule sm:w-28" />
          <span>Departure</span>
        </div>

        <h1 className="over-canvas max-w-[16ch] font-serif text-[clamp(2.75rem,8.6vw,7.5rem)] font-normal leading-[0.92] tracking-[-0.035em] text-ivory">
          <Headline as="div" onLoad delay={0.2}>Your ambition has</Headline>
          <span className="relative inline-block text-royal-lit">
            <Headline as="div" onLoad delay={0.42}>no borders.</Headline>
            <svg aria-hidden viewBox="0 0 300 14" preserveAspectRatio="none" className="absolute -bottom-1 left-0 h-3 w-full">
              <path d="M3 10 Q 75 3, 150 8 T 297 6" fill="none" stroke="#F06B5D" strokeWidth="3" strokeLinecap="round"
                vectorEffect="non-scaling-stroke" pathLength={1}
                style={{ strokeDasharray: 1, strokeDashoffset: reduce ? 0 : 1, animation: reduce ? undefined : "draw 1s cubic-bezier(0.22,1,0.36,1) 1.5s forwards" }} />
            </svg>
          </span>
        </h1>

        <div className="mt-10 grid gap-10 md:grid-cols-12">
          <p className="hero-lede over-canvas max-w-[52ch] text-lg leading-relaxed text-mist md:col-span-6 md:text-xl">
            Discover the right country, course and university with personalised guidance from application to arrival.
          </p>
          <div className="md:col-span-5 md:col-start-8">
            <div className="hero-cta flex flex-col gap-3 sm:flex-row md:justify-end">
              <Button href="#quiz" magnetic arrow>Find my best country</Button>
              <Button href="#counsellors" variant="secondary">Book free counselling</Button>
            </div>
            <ul className="hero-trust mt-8 space-y-2.5 text-sm text-mist md:text-right">
              {TRUST.map(({ Icon, label }) => (
                <li key={label} className="flex items-center gap-2.5 md:justify-end">
                  <Icon aria-hidden className="size-4 shrink-0 text-royal-lit" /> {label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="hero-foot mt-14 border-y border-white/10 py-4">
          <div className="flex min-w-0 items-center gap-5">
            <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.22em] text-ivory">Departures</span>
            <Ticker items={CITIES} label="Destination cities we advise on" className="min-w-0 flex-1" />
          </div>
        </div>
      </div>

      <div className="hero-cue pointer-events-none absolute inset-x-0 bottom-5 flex justify-center">
        <span aria-hidden className="flex flex-col items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-faint">
          Scroll
          <span className="relative block h-10 w-px overflow-hidden bg-white/15">
            <span className="absolute inset-x-0 top-0 h-4 animate-[cue_2.2s_cubic-bezier(0.22,1,0.36,1)_infinite] bg-royal-lit" />
          </span>
        </span>
      </div>
    </section>
  );
}
