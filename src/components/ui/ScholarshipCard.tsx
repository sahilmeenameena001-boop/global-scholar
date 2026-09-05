"use client";
import { motion } from "framer-motion";
import { Award, CalendarDays, MapPin } from "lucide-react";
import { useState } from "react";
import type { Scholarship } from "@/data/content";

const statusCls: Record<Scholarship["status"], string> = {
  Open: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Closing soon": "bg-amber-50 text-amber-700 border-amber-200",
  Closed: "bg-white/5 text-mist border-white/10",
};

export function ScholarshipCard({ s }: { s: Scholarship }) {
  const [open, setOpen] = useState(false);
  const id = `sch-${s.id}-details`;
  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.94, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: -8 }}
      transition={{ layout: { type: "spring", stiffness: 320, damping: 34 }, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col rounded-3xl border border-white/10 bg-surface p-6 shadow-card"
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusCls[s.status]}`}>{s.status}</span>
        <span className="text-xs font-medium text-faint">{s.level}</span>
      </div>
      <h3 className="mt-4 font-serif text-xl leading-snug text-ivory">{s.name}</h3>
      <p className="mt-1 text-sm text-mist">{s.provider}</p>
      <ul className="mt-4 space-y-1.5 text-sm text-mist">
        <li className="flex items-center gap-2"><MapPin aria-hidden className="size-4 text-royal-lit" /> {s.country} · {s.subject}</li>
        <li className="flex items-center gap-2"><Award aria-hidden className="size-4 text-royal-lit" /> {s.award}</li>
        <li className="flex items-center gap-2"><CalendarDays aria-hidden className="size-4 text-royal-lit" /> Example deadline: {s.deadline}</li>
      </ul>
      <div id={id} hidden={!open} className="mt-4 rounded-2xl bg-raised p-4 text-sm text-mist">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-faint">Eligibility summary</p>
        {s.eligibility}
      </div>
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)} className="mt-auto flex min-h-11 items-center pt-3 text-left text-sm font-semibold text-royal-lit hover:underline">
        {open ? "Hide details" : "View details"}
      </button>
    </motion.article>
  );
}
