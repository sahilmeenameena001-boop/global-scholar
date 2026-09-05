"use client";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { scholarshipFilters, scholarships } from "@/data/content";
import { ScholarshipCard } from "../ui/ScholarshipCard";
import { ChapterHead } from "../ui/Chapter";
import { DemoBadge } from "../ui/SectionHeading";

type Filters = { country: string; level: string; subject: string; status: string };
const labels: Record<keyof Filters, string> = { country: "Country", level: "Study level", subject: "Subject", status: "Deadline status" };

export function Scholarships() {
  const [f, setF] = useState<Filters>({ country: "All", level: "All", subject: "All", status: "All" });
  const list = useMemo(() => scholarships.filter((s) => (f.country === "All" || s.country === f.country) && (f.level === "All" || s.level === f.level) && (f.subject === "All" || s.subject === f.subject) && (f.status === "All" || s.status === f.status)), [f]);

  return (
    <section id="scholarships" data-chapter={4} className="relative scroll-mt-24 py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <ChapterHead index="05" eyebrow="Funding" title="The money question, answered early." lede="Filter example awards by destination, level and subject. Eligibility always depends on the provider's own criteria." />
          <DemoBadge />
        </div>
        <form className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" onSubmit={(e) => e.preventDefault()}>
          {(Object.keys(labels) as (keyof Filters)[]).map((k) => (
            <div key={k}>
              <label htmlFor={`f-${k}`} className="text-xs font-semibold uppercase tracking-wider text-mist">{labels[k]}</label>
              <select id={`f-${k}`} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="mt-1 min-h-12 w-full rounded-xl border border-white/15 bg-surface px-4 text-sm text-ink focus:border-royal">
                {scholarshipFilters[k].map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </form>
        <LayoutGroup>
          <motion.p layout="position" role="status" className="mt-6 text-sm text-mist">{list.length} of {scholarships.length} example scholarships shown</motion.p>
          <motion.div layout className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {list.map((s) => <ScholarshipCard key={s.id} s={s} />)}
            </AnimatePresence>
          </motion.div>
          <AnimatePresence>
            {list.length === 0 && (
              <motion.p layout key="empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="mt-6 rounded-2xl border border-dashed border-white/20 p-8 text-center text-sm text-mist">No example scholarships match these filters. Try widening your search.</motion.p>
            )}
          </AnimatePresence>
        </LayoutGroup>
        <p className="mt-8 text-xs text-mist">Scholarship information shown here is illustrative and should be verified with the relevant university or provider.</p>
      </div>
    </section>
  );
}
