import { ChevronDown, Quote } from "lucide-react";
import { aboutIntro, aboutStats, faqs, principles } from "@/data/about";
import { navByHref } from "@/data/nav";
import { brand } from "@/data/site";
import { ChapterHead } from "../ui/Chapter";
import { LeadForm } from "../ui/LeadForm";
import { DemoBadge } from "../ui/SectionHeading";

const meta = navByHref["/about"];

/**
 * Who we are, how we work, and the booking panel every CTA on the site points
 * at. A server component: the only interactive part is the lead form, and the
 * FAQ uses native `<details>` so it works before hydration.
 */
export function About() {
  return (
    <section id="about" aria-labelledby="about-title" data-chapter={0} className="relative scroll-mt-24 py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <ChapterHead id="about-title" index={meta.index} eyebrow={meta.eyebrow} title="Independent counselling, and what that actually means." />
          <DemoBadge>Fictional consultancy, demo content</DemoBadge>
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="flex gap-4 font-serif text-xl leading-relaxed text-ivory sm:text-2xl">
              <Quote aria-hidden className="mt-1.5 size-6 shrink-0 text-coral" />
              {aboutIntro.lede}
            </p>
            {aboutIntro.body.map((para) => (
              <p key={para} className="mt-5 max-w-[62ch] text-base leading-relaxed text-mist">{para}</p>
            ))}
          </div>
          <dl className="grid gap-4 sm:grid-cols-2 md:col-span-5 md:content-start">
            {aboutStats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/10 bg-surface p-5 shadow-card">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block font-serif text-3xl font-semibold text-royal-lit">{s.value}</span>
                  <span className="mt-1 block text-sm leading-snug text-mist">{s.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <h3 className="mt-20 font-serif text-2xl text-ivory sm:text-3xl">How we work</h3>
        <ol className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((p, i) => (
            <li key={p.title} className="rounded-3xl border border-white/10 bg-surface p-6 shadow-card">
              <span aria-hidden className="font-serif text-sm tabular-nums text-royal-lit">{String(i + 1).padStart(2, "0")}</span>
              <h4 className="mt-2 font-serif text-lg leading-snug text-ivory">{p.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-mist">{p.text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-20 grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="font-serif text-2xl text-ivory sm:text-3xl">Common questions</h3>
            <ul className="mt-6 space-y-3">
              {faqs.map((f) => (
                <li key={f.q}>
                  <details className="group rounded-2xl border border-white/10 bg-surface px-5 open:border-royal/40">
                    <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-semibold text-ivory marker:hidden">
                      {f.q}
                      <ChevronDown aria-hidden className="size-4 shrink-0 text-royal-lit transition-transform duration-300 group-open:rotate-180" />
                    </summary>
                    <p className="pb-5 text-sm leading-relaxed text-mist">{f.a}</p>
                  </details>
                </li>
              ))}
            </ul>
          </div>

          {/* every "book counselling" CTA on the site lands here */}
          <div id="book" className="scroll-mt-28 rounded-3xl border border-white/10 bg-raised p-6 shadow-lift sm:p-8">
            <h3 className="font-serif text-2xl text-ivory sm:text-3xl">Book a free counselling call</h3>
            <p className="mt-2 mb-6 text-sm leading-relaxed text-mist">
              Tell us how to reach you and a counsellor from {brand.name} will arrange a first session. No obligation, and no admission, scholarship or visa outcome is promised.
            </p>
            <LeadForm compact context="Free counselling call" />
          </div>
        </div>
      </div>
    </section>
  );
}
