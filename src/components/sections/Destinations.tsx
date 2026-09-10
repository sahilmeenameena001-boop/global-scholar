"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Columns2, LayoutGrid, Layers, Plus, X } from "lucide-react";
import { useState } from "react";
import { countries, type Country } from "@/data/countries";
import { navByHref } from "@/data/nav";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { CountryCard } from "../ui/CountryCard";
import { CountryDeck } from "../ui/CountryDeck";
import { ChapterHead } from "../ui/Chapter";
import { DemoBadge } from "../ui/SectionHeading";

const EASE = [0.22, 1, 0.36, 1] as const;
const meta = navByHref["/countries"];
const SPEC: { label: string; get: (c: Country) => string }[] = [
  { label: "Typical duration", get: (c) => c.duration },
  { label: "Popular intake", get: (c) => c.intake },
  { label: "Approx. tuition / yr", get: (c) => c.tuition },
  { label: "Popular subjects", get: (c) => c.subjects.join(", ") },
  { label: "Scholarships", get: (c) => c.scholarships },
];

/** The country code chip that flies from its card into the compare tray via a shared layoutId. */
function CodeChip({ c, className = "" }: { c: Country; className?: string }) {
  return (
    <motion.span
      layoutId={`compare-chip-${c.id}`}
      transition={{ type: "spring", stiffness: 340, damping: 32 }}
      className={`grid place-items-center rounded-lg font-serif text-xs font-bold uppercase tracking-widest text-white ${className}`}
      style={{ backgroundColor: c.accent }}
    >
      {c.code}
    </motion.span>
  );
}

function Slot({ c, onRemove }: { c?: Country; onRemove: (id: string) => void }) {
  if (!c) {
    return (
      <motion.div layout className="flex min-h-[13rem] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 p-6 text-center">
        <Plus aria-hidden className="size-5 text-ivory/35" />
        <p className="text-sm text-mist">Choose a destination below to fill this slot.</p>
      </motion.div>
    );
  }
  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: EASE }} className="flex min-h-[13rem] flex-col rounded-2xl border border-white/10 bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <CodeChip c={c} className="size-9" />
          <h4 className="font-serif text-lg leading-tight text-ivory">{c.name}</h4>
        </div>
        <button type="button" onClick={() => onRemove(c.id)} aria-label={`Remove ${c.name} from the comparison`} className="grid size-9 shrink-0 place-items-center rounded-full text-ivory/60 hover:bg-white/5 hover:text-ivory">
          <X aria-hidden className="size-4" />
        </button>
      </div>
      <dl className="mt-4 space-y-2.5 text-sm">
        {SPEC.map((row) => (
          <div key={row.label}>
            <dt className="text-xs font-semibold uppercase tracking-wider text-faint">{row.label}</dt>
            <dd className="mt-0.5 text-mist">{row.get(c)}</dd>
          </div>
        ))}
      </dl>
    </motion.div>
  );
}

type View = "deck" | "grid";

export function Destinations() {
  const [compare, setCompare] = useState(false);
  const [pinned, setPinned] = useState<string[]>([]);
  // the deck is the default where a grid of five would be unreadable; wide screens
  // get the grid, and either can be overridden from the toggle
  const wide = useMediaQuery("(min-width: 1024px)");
  const [chosen, setChosen] = useState<View | null>(null);
  const view: View = chosen ?? (wide ? "grid" : "deck");

  // Two slots. A third pick pushes the oldest out, so the control never dead-ends.
  const toggle = (id: string) =>
    setPinned((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id].slice(-2)));

  const openCompare = () => {
    setCompare((on) => {
      if (on) setPinned([]);
      return !on;
    });
  };

  const slots = [0, 1].map((i) => countries.find((c) => c.id === pinned[i]));

  const compareFor = (c: Country) =>
    compare ? { pinned: pinned.includes(c.id), toggle: () => toggle(c.id), chip: <CodeChip c={c} className="size-7" /> } : undefined;

  return (
    <section id="countries" aria-labelledby="countries-title" data-chapter={1} className="relative scroll-mt-24 py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <ChapterHead id="countries-title" index={meta.index} eyebrow={meta.eyebrow} title="Five countries. One of them fits you best." lede="Compare typical durations, intakes and costs across the destinations our counsellors know best." />
          <div className="flex flex-wrap items-center gap-3">
            <div role="group" aria-label="Card layout" className="inline-flex rounded-full border border-white/15 p-1">
              {([["deck", "Deck", Layers], ["grid", "Grid", LayoutGrid]] as const).map(([v, label, Icon]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setChosen(v)}
                  aria-pressed={view === v}
                  className={`inline-flex min-h-9 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${view === v ? "bg-royal text-white" : "text-ivory hover:text-royal-lit"}`}
                >
                  <Icon aria-hidden className="size-4" />
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={openCompare}
              aria-pressed={compare}
              aria-controls="compare-tray"
              className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-5 text-sm font-semibold transition-colors ${compare ? "border-royal bg-royal text-white" : "border-white/15 text-ivory hover:border-white/30"}`}
            >
              <Columns2 aria-hidden className="size-4" />
              {compare ? "Exit compare" : "Compare countries"}
            </button>
            <DemoBadge>Illustrative demo data, not live figures</DemoBadge>
          </div>
        </div>

        <div id="compare-tray" aria-live="polite">
          <AnimatePresence initial={false}>
            {compare && (
              <motion.div
                layout
                key="tray"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="mt-10 rounded-3xl border border-white/10 bg-royal/10 p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-serif text-xl text-ivory">Side-by-side comparison</h3>
                  <p className="text-sm text-mist">{pinned.length === 0 ? "Pin up to two countries from the cards below." : `${pinned.length} of 2 pinned`}</p>
                </div>
                <motion.div layout className="mt-5 grid gap-4 sm:grid-cols-2">
                  {slots.map((c, i) => <Slot key={c?.id ?? `empty-${i}`} c={c} onRemove={toggle} />)}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {view === "deck" ? (
          <CountryDeck items={countries} compareFor={compareFor} compareOpen={compare} />
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {countries.map((c, i) => (
              <CountryCard key={c.id} c={c} index={i} compare={compareFor(c)} />
            ))}
          </div>
        )}
        <p className="mt-6 text-xs text-faint">Tuition, intake and duration figures are approximate examples for orientation only and vary by university and programme.</p>
      </div>
    </section>
  );
}
