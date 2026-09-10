import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { navLinks } from "@/data/nav";
import { Reveal } from "../ui/anim";
import { ChapterHead } from "../ui/Chapter";

/**
 * The home page index. One card per route, in the order the story is meant to
 * be read — so the site map and the narrative are the same list.
 */
export function Explore() {
  return (
    <section id="explore" aria-labelledby="explore-title" data-chapter={1} className="relative scroll-mt-24 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <ChapterHead
          id="explore-title"
          index="—"
          eyebrow="The route"
          title="Six chapters, in the order they matter."
          lede="Start anywhere, but this is the sequence a counsellor would walk you through."
        />
        <Reveal className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="group relative flex min-h-[13rem] flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-surface p-6 shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:border-royal/50 hover:shadow-lift"
            >
              <span aria-hidden className="pointer-events-none absolute -right-6 -top-8 font-serif text-[6rem] leading-none text-white/[0.04] transition-colors duration-500 group-hover:text-royal-lit/15">
                {l.index}
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-royal-lit">{l.eyebrow}</p>
                <h3 className="mt-3 font-serif text-2xl leading-tight text-ivory">{l.label}</h3>
                <p className="mt-2 max-w-[34ch] text-sm leading-relaxed text-mist">{l.blurb}</p>
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ivory">
                Open chapter
                <ArrowUpRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
