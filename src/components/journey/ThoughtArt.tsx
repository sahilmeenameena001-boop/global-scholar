import {
  Award, Briefcase, Calculator, ChartLine, Check, Cog, Globe2, GraduationCap, Laptop, MapPin, Music, Palette, Plane,
  Scale, Sparkles, Star, Stethoscope, Wallet, type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { destinationById } from "@/data/journey/destinations";
import type { ArtSpec } from "@/lib/journey/types";
import { CountryArt } from "../ui/CountryArt";

/** The curated icon set collage chips and choice tags can name in data. */
export const ICONS: Record<string, LucideIcon> = {
  chart: ChartLine, laptop: Laptop, cog: Cog, scale: Scale, stethoscope: Stethoscope, palette: Palette,
  sparkles: Sparkles, plane: Plane, globe: Globe2, graduation: GraduationCap, pin: MapPin, star: Star,
  calculator: Calculator, wallet: Wallet, briefcase: Briefcase, award: Award, music: Music,
};

const paper: Record<NonNullable<ArtSpec["tone"]>, string> = {
  ivory: "bg-ivory text-ink",
  sky: "bg-sky text-ink",
  coral: "bg-coral text-void",
  royal: "bg-royal text-white",
  ink: "bg-raised text-ivory",
};
const inkTone: Record<NonNullable<ArtSpec["tone"]>, string> = {
  ivory: "text-ivory", sky: "text-sky", coral: "text-coral", royal: "text-royal-lit", ink: "text-mist",
};

function Done() {
  return (
    <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-royal-lit text-void shadow-card">
      <Check className="size-3" strokeWidth={3} />
    </span>
  );
}

/** Translucent tape holding a paper object to the page. */
const Tape = () => <span className="absolute -top-2 left-1/2 h-3.5 w-10 -translate-x-1/2 -rotate-3 bg-royal-lit/35" />;

/**
 * Draws one collage object. Purely presentational: the canvas around it is
 * aria-hidden, because everything a thought says is also said in text by the
 * prompt and the answer pins.
 */
export function ThoughtArt({ art }: { art: ArtSpec }) {
  if (art.src) {
    return (
      <span className="relative block">
        <Image src={art.src} alt={art.alt ?? ""} width={240} height={240} sizes="(min-width: 1024px) 160px, 112px" className="block h-auto w-28 drop-shadow-[0_12px_18px_rgba(0,0,0,0.5)] lg:w-40" />
        {art.done && <Done />}
      </span>
    );
  }

  const tone = art.tone ?? "ivory";

  switch (art.kind) {
    case "note":
      return (
        <span className={`relative block w-[6.4rem] rounded-[3px] px-2.5 pb-2.5 pt-3 shadow-card lg:w-[8.25rem] ${paper[tone]}`}>
          <Tape />
          <span className="block font-hand text-[1.05rem] leading-[1.02] lg:text-[1.3rem]">{art.label}</span>
          {art.sub && <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wider opacity-70">{art.sub}</span>}
          {art.done && <Done />}
        </span>
      );

    case "sticker":
      return (
        <span className={`relative block whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-bold tracking-[0.01em] shadow-card ring-[3px] ring-ivory lg:text-xs ${paper[tone]}`}>
          {art.label}
        </span>
      );

    case "chip": {
      const Icon = ICONS[art.icon ?? "sparkles"] ?? Sparkles;
      return (
        <span className="relative grid size-11 place-items-center rounded-full bg-raised/90 text-royal-lit shadow-card ring-1 ring-white/15 lg:size-12">
          <Icon className="size-5" />
          {art.done && <Done />}
        </span>
      );
    }

    case "polaroid": {
      const d = art.destination ? destinationById[art.destination] : null;
      return (
        <span className="relative block w-[4.25rem] bg-ivory p-1 pb-0 shadow-card lg:w-[5.5rem]">
          {d && <CountryArt c={d.art} active className="rounded-[2px]" />}
          <span className="block py-0.5 text-center font-hand text-sm leading-tight text-ink lg:text-base">{d?.label ?? art.label}</span>
          {art.done && <Done />}
        </span>
      );
    }

    case "passport":
      return (
        <span className="relative flex h-[4.1rem] w-12 flex-col items-center justify-center gap-1 rounded-[5px] bg-navy shadow-card ring-1 ring-royal-lit/40 lg:h-[4.8rem] lg:w-14">
          <Globe2 className="size-5 text-sky/80" />
          <span className="text-[6px] font-bold tracking-[0.2em] text-sky/80 lg:text-[7px]">PASSPORT</span>
          {art.done && <Done />}
        </span>
      );

    case "ticket":
      return (
        <span className="relative flex h-12 w-28 overflow-hidden rounded-lg bg-ivory text-ink shadow-card lg:h-14 lg:w-[8.5rem]">
          <span className="flex flex-1 flex-col justify-center gap-0.5 px-2.5">
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-royal">{art.label ?? "Boarding"}</span>
            <span className="flex items-center gap-1 font-serif text-sm font-semibold">YOU <Plane className="size-3" /> ?</span>
          </span>
          <span className="w-px border-l border-dashed border-ink/30" />
          <span className="grid w-8 place-items-center bg-royal/15"><Plane className="size-4 -rotate-45 text-royal" /></span>
        </span>
      );

    case "calendar":
      return (
        <span className="relative block w-14 overflow-hidden rounded-lg bg-ivory text-center text-ink shadow-card lg:w-16">
          <span className={`block h-3.5 ${tone === "coral" ? "bg-coral" : tone === "royal" ? "bg-royal" : "bg-royal-lit"}`} />
          <span className="block pt-1 font-serif text-xl font-semibold leading-none lg:text-2xl">{art.label}</span>
          <span className="block pb-1.5 pt-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-ink/70">{art.sub}</span>
          {art.done && <Done />}
        </span>
      );

    case "card":
      return (
        <span className="relative flex w-[6.6rem] items-center gap-2 rounded-xl bg-surface p-2 shadow-card ring-1 ring-white/12 lg:w-[8rem]">
          <span className="hidden size-7 shrink-0 place-items-center rounded-full bg-royal/25 text-royal-lit lg:grid"><GraduationCap className="size-3.5" /></span>
          <span className="min-w-0">
            <span className="block truncate text-[11px] font-semibold text-ivory">{art.label}</span>
            <span className="block truncate text-[10px] text-faint">{art.sub}</span>
          </span>
          {art.done && <Done />}
        </span>
      );

    case "doc":
      return (
        <span className="relative block h-[4.4rem] w-[3.4rem] rounded-[3px] bg-ivory p-1.5 shadow-card lg:h-[5.2rem] lg:w-16">
          <span className="block truncate text-[7px] font-bold uppercase tracking-[0.1em] text-royal lg:text-[8px]">{art.label}</span>
          <span className="mt-1 block h-[calc(100%-1rem)] bg-[repeating-linear-gradient(180deg,transparent_0_5px,rgba(21,32,51,0.16)_5px_6px)]" />
          {art.done && <Done />}
        </span>
      );

    case "letter":
      return (
        <span className="relative block w-[8.5rem] rounded-[4px] bg-ivory p-3 text-ink shadow-lift lg:w-[10.5rem]">
          <span className="flex items-center gap-1.5">
            <span className="grid size-5 place-items-center rounded-full bg-coral text-white"><GraduationCap className="size-3" /></span>
            <span className="text-[7px] font-bold uppercase tracking-[0.18em] text-ink/60">Admissions</span>
          </span>
          <span className="mt-2 block font-serif text-sm font-semibold leading-tight lg:text-base">{art.label}</span>
          <span className="mt-1 block font-hand text-sm leading-none text-royal lg:text-base">Congratulations!</span>
          <span className="mt-1.5 block h-5 bg-[repeating-linear-gradient(180deg,transparent_0_4px,rgba(21,32,51,0.16)_4px_5px)]" />
        </span>
      );

    case "tab":
      return (
        <span className="relative block w-[7.5rem] overflow-hidden rounded-lg bg-surface shadow-card ring-1 ring-white/12 lg:w-36">
          <span className="flex items-center gap-1 bg-raised px-2 py-1">
            <span className="size-1.5 rounded-full bg-coral" /><span className="size-1.5 rounded-full bg-sky/60" /><span className="size-1.5 rounded-full bg-royal-lit" />
          </span>
          <span className="block px-2 pb-2 pt-1.5">
            <span className="block truncate text-[10px] font-semibold text-ivory">{art.label}</span>
            <span className="mt-1 block h-1 w-4/5 rounded bg-white/10" /><span className="mt-1 block h-1 w-3/5 rounded bg-white/10" />
          </span>
        </span>
      );

    case "glyph":
      return <span className="block font-serif text-5xl leading-none text-coral [text-shadow:0_6px_24px_rgba(4,7,13,0.8)] lg:text-6xl">{art.label}</span>;

    case "stamp":
      return <span className={`stamp block whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-semibold lg:text-sm ${inkTone[tone]}`}>{art.label}</span>;

    case "suitcase":
      return (
        <span className="relative block h-12 w-16 pt-2 lg:h-14 lg:w-20">
          <span className="absolute left-1/2 top-0 h-3 w-6 -translate-x-1/2 rounded-t-md border-2 border-b-0 border-ivory/70" />
          <span className="relative flex h-full justify-around rounded-lg bg-coral shadow-card">
            <span className="w-1.5 bg-void/25" /><span className="w-1.5 bg-void/25" />
          </span>
          {art.done && <Done />}
        </span>
      );
  }
}
