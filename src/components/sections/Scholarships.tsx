"use client";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { Compass } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { scholarshipFilters, scholarships, type Scholarship } from "@/data/content";
import { navByHref } from "@/data/nav";
import { Button } from "../ui/Button";
import { ChapterHead } from "../ui/Chapter";
import { LeadForm } from "../ui/LeadForm";
import { Modal } from "../ui/Modal";
import { ScholarshipCard } from "../ui/ScholarshipCard";
import { DemoBadge } from "../ui/SectionHeading";

type Filters = { country: string; level: string; subject: string; status: string };
const labels: Record<keyof Filters, string> = { country: "Country", level: "Study level", subject: "Subject", status: "Deadline status" };
const empty: Filters = { country: "All", level: "All", subject: "All", status: "All" };
const meta = navByHref["/scholarships"];

export function Scholarships() {
  const [f, setF] = useState<Filters>(empty);
  const [enquiry, setEnquiry] = useState<Scholarship | null>(null);
  const list = useMemo(() => scholarships.filter((s) => (f.country === "All" || s.country === f.country) && (f.level === "All" || s.level === f.level) && (f.subject === "All" || s.subject === f.subject) && (f.status === "All" || s.status === f.status)), [f]);
  const close = useCallback(() => setEnquiry(null), []);

  return (
    <section id="scholarships" aria-labelledby="scholarships-title" data-chapter={4} className="relative scroll-mt-24 py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <ChapterHead id="scholarships-title" index={meta.index} eyebrow={meta.eyebrow} title="The money question, answered early." lede="Filter example awards by destination, level and subject. Eligibility always depends on the provider's own criteria." />
          <DemoBadge />
        </div>
        <form className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" onSubmit={(e) => e.preventDefault()}>
          {(Object.keys(labels) as (keyof Filters)[]).map((k) => (
            <div key={k}>
              <label htmlFor={`f-${k}`} className="text-xs font-semibold uppercase tracking-wider text-mist">{labels[k]}</label>
              <select id={`f-${k}`} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="mt-1 min-h-12 w-full cursor-pointer rounded-xl border border-white/15 bg-white/[0.04] px-4 text-sm text-ivory transition-colors hover:border-white/30 focus:border-royal-lit [&>option]:bg-surface [&>option]:text-ivory">
                {scholarshipFilters[k].map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </form>
        <LayoutGroup>
          <motion.p layout="position" role="status" className="mt-6 text-sm text-mist">{list.length} of {scholarships.length} example scholarships shown</motion.p>
          <motion.div layout className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {list.map((s) => <ScholarshipCard key={s.id} s={s} onEnquire={setEnquiry} />)}
            </AnimatePresence>
          </motion.div>
          <AnimatePresence>
            {list.length === 0 && (
              <motion.div layout key="empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="mt-6 rounded-2xl border border-dashed border-white/20 p-8 text-center">
                <p className="text-sm text-mist">No example scholarships match these filters.</p>
                <button type="button" onClick={() => setF(empty)} className="mt-3 inline-flex min-h-11 cursor-pointer items-center rounded-full border border-white/15 px-5 text-sm font-semibold text-ivory hover:border-royal">Clear all filters</button>
              </motion.div>
            )}
          </AnimatePresence>
        </LayoutGroup>

        {/* the list is a starting point, not an answer — close on the conversation that gives one */}
        <div className="mt-16 grid gap-6 rounded-3xl border border-white/10 bg-raised p-7 sm:p-10 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-royal-lit">
              <Compass aria-hidden className="size-4" /> Funding plan
            </p>
            <h3 className="mt-3 font-serif text-3xl leading-tight text-ivory sm:text-4xl">Not sure which of these you would actually qualify for?</h3>
            <p className="mt-3 max-w-[54ch] text-sm leading-relaxed text-mist">
              Bring your grades, your budget and your intake, and a counsellor will tell you which awards are worth an application and which are not — before you spend weeks on one. No award, amount or deadline here is a guarantee; every one has to be confirmed with the provider.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Button href="/universities" arrow className="w-full">Check my profile first</Button>
            <Button href="/about#book" variant="secondary" className="w-full">Book free counselling</Button>
          </div>
        </div>
        <p className="mt-8 text-xs text-mist">Scholarship information shown here is illustrative and should be verified with the relevant university or provider.</p>
      </div>

      <Modal open={!!enquiry} onClose={close} title={enquiry ? "Check your eligibility" : "Enquire"}>
        {enquiry && <LeadForm compact context={`${enquiry.name} — ${enquiry.provider} (${enquiry.country})`} />}
      </Modal>
    </section>
  );
}
