"use client";
import { motion } from "framer-motion";
import { Award, GraduationCap, Plane } from "lucide-react";
import { stories, type Story } from "@/data/content";
import { ChapterHead } from "../ui/Chapter";
import { DemoBadge } from "../ui/SectionHeading";

export function Avatar({ initials, colour, size = "size-14" }: { initials: string; colour: string; size?: string }) {
  return (
    <span role="img" aria-label={`Placeholder portrait ${initials}`} className={`grid ${size} shrink-0 place-items-center rounded-full font-serif text-lg font-semibold text-white`} style={{ background: `linear-gradient(135deg, ${colour}, ${colour}99)` }}>
      {initials}
    </span>
  );
}

function StoryCard({ s, i }: { s: Story; i: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 60, rotate: (i - 1) * 7, x: (i - 1) * -40 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0, x: 0 }}
      whileHover={{ y: -6, rotate: (i - 1) * 0.6 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", stiffness: 90, damping: 16, delay: i * 0.1 }}
      className="flex flex-col rounded-3xl border border-white/10 bg-surface p-6 shadow-card transition-shadow hover:shadow-lift"
    >
      <div className="flex items-center gap-4">
        <Avatar initials={s.initials} colour={s.colour} />
        <div>
          <h3 className="font-serif text-xl text-ivory">{s.name}</h3>
          <p className="text-sm text-mist">{s.city}</p>
        </div>
      </div>
      <svg aria-hidden viewBox="0 0 300 60" className="mt-5 w-full">
        <motion.path d="M20 45 C 90 -10, 210 -10, 280 45" fill="none" stroke={s.colour} strokeWidth="2" strokeDasharray="5 6" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, delay: 0.3 + i * 0.12 }} />
        <circle cx="20" cy="45" r="5" fill={s.colour} /><circle cx="280" cy="45" r="5" fill="#F06B5D" />
        <text x="20" y="58" fontSize="9" fill="#152033" opacity="0.6">{s.city.split(",")[0]}</text>
        <text x="280" y="58" fontSize="9" fill="#152033" opacity="0.6" textAnchor="end">{s.destination.split(",")[0]}</text>
        <g transform="translate(140,10)"><Plane className="size-4 text-ivory" /></g>
      </svg>
      <ul className="mt-3 space-y-1.5 text-sm text-mist">
        <li className="flex items-center gap-2"><Plane aria-hidden className="size-4 text-royal-lit" /> {s.destination}</li>
        <li className="flex items-center gap-2"><GraduationCap aria-hidden className="size-4 text-royal-lit" /> {s.course}, {s.university}</li>
        <li className="flex items-center gap-2"><Award aria-hidden className="size-4 text-coral" /> {s.scholarship}</li>
      </ul>
      <blockquote className="mt-5 border-l-2 border-coral pl-4 font-serif text-base italic leading-relaxed text-ivory">“{s.quote}”</blockquote>
    </motion.article>
  );
}

export function Stories() {
  return (
    <section id="stories" data-chapter={5} className="relative scroll-mt-24 py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <ChapterHead index="06" eyebrow="Arrivals" title="Journeys that started with one honest conversation." />
          <DemoBadge>Fictional demo stories in development</DemoBadge>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {stories.map((s, i) => <StoryCard key={s.name} s={s} i={i} />)}
        </div>
      </div>
    </section>
  );
}
