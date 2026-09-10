"use client";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Briefcase, Globe2, Languages } from "lucide-react";
import { useCallback, useState } from "react";
import { counsellors, type Counsellor } from "@/data/content";
import { Button } from "../ui/Button";
import { Input, Select, SuccessState } from "../ui/Field";
import { useFinePointer } from "../ui/fx";
import { Modal } from "../ui/Modal";
import { ChapterHead } from "../ui/Chapter";
import { DemoBadge } from "../ui/SectionHeading";
import { Avatar } from "./Stories";
import { isEmail, isPhone } from "@/lib/validation";

type Booking = { name: string; email: string; phone: string; date: string; time: string; interest: string };
const empty: Booking = { name: "", email: "", phone: "", date: "", time: "", interest: "" };

function BookingForm({ counsellor }: { counsellor: string }) {
  const [v, setV] = useState<Booking>(empty);
  const [err, setErr] = useState<Partial<Booking>>({});
  const [done, setDone] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n: Partial<Booking> = {};
    if (v.name.trim().length < 2) n.name = "Please enter your name.";
    if (!isEmail(v.email)) n.email = "Enter a valid email address.";
    if (!isPhone(v.phone)) n.phone = "Enter a valid phone number.";
    if (!v.date) n.date = "Choose a preferred date.";
    else if (v.date < today) n.date = "Please pick a date from today onwards.";
    if (!v.time) n.time = "Choose a preferred time.";
    if (!v.interest) n.interest = "Tell us what you'd like to study.";
    setErr(n);
    if (!Object.keys(n).length) setDone(true);
  };

  if (done) return <SuccessState title="Session requested" text={`${counsellor} will confirm your ${v.time.toLowerCase()} session on ${v.date} by email.`} />;

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Input id="bk-name" label="Student name" autoComplete="name" value={v.name} error={err.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input id="bk-email" label="Email" type="email" autoComplete="email" value={v.email} error={err.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
        <Input id="bk-phone" label="Phone" type="tel" autoComplete="tel" value={v.phone} error={err.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} />
        <Input id="bk-date" label="Preferred date" type="date" min={today} value={v.date} error={err.date} onChange={(e) => setV({ ...v, date: e.target.value })} />
        <Select id="bk-time" label="Preferred time" value={v.time} error={err.time} onChange={(e) => setV({ ...v, time: e.target.value })}>
          <option value="">Select</option><option>Morning</option><option>Afternoon</option><option>Evening</option>
        </Select>
      </div>
      <Select id="bk-interest" label="Study interest" value={v.interest} error={err.interest} onChange={(e) => setV({ ...v, interest: e.target.value })}>
        <option value="">Select</option>
        {["Business & Management", "Engineering & Technology", "Computer Science & Data", "Health & Life Sciences", "Arts, Design & Media", "Law & Social Sciences", "Not sure yet"].map((o) => <option key={o}>{o}</option>)}
      </Select>
      <p className="text-xs text-mist">Sessions are free and carry no obligation. Outcomes depend on institutions and authorities.</p>
      <Button type="submit" arrow className="w-full">Request session</Button>
    </form>
  );
}

/** A short "how I help" line built from the counsellor's own demo profile fields. */
const helpNote = (c: Counsellor) =>
  `I help with ${c.expertise.map((e) => e.toLowerCase()).join(" and ")}, mainly for students heading to ${c.countries.join(" and ")}.`;

function CounsellorCard({ c, i, onBook }: { c: Counsellor; i: number; onBook: (c: Counsellor) => void }) {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const [near, setNear] = useState(false);
  // Never hover-only: on touch, and with reduced motion, the note is rendered inline instead.
  const overlay = fine && !reduce;
  const shown = near;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, delay: i * 0.1 }}
      onPointerEnter={(e) => { if (e.pointerType !== "touch") setNear(true); }}
      onPointerLeave={() => setNear(false)}
      onFocusCapture={() => setNear(true)}
      onBlurCapture={() => setNear(false)}
      className="flex flex-col rounded-3xl border border-white/10 bg-surface p-6 shadow-card"
    >
      <div className="flex items-center gap-4">
        <Avatar name={c.name} colour={c.colour} size="size-16" />
        <div>
          <h3 className="font-serif text-xl text-ivory">{c.name}</h3>
          <p className="text-sm text-mist">{c.years} years&rsquo; experience</p>
        </div>
      </div>
      {/* the note slides up over the details on hover/focus; on touch and with reduced motion it sits below them instead */}
      <div className="relative mt-5 min-h-[8rem] overflow-hidden rounded-2xl">
        <dl className="space-y-3 text-sm">
          <div className="flex gap-2"><Globe2 aria-hidden className="mt-0.5 size-4 shrink-0 text-royal-lit" /><dt className="sr-only">Countries advised</dt><dd className="text-mist">{c.countries.join(", ")}</dd></div>
          <div className="flex gap-2"><Briefcase aria-hidden className="mt-0.5 size-4 shrink-0 text-royal-lit" /><dt className="sr-only">Expertise</dt><dd className="text-mist">{c.expertise.join(" · ")}</dd></div>
          <div className="flex gap-2"><Languages aria-hidden className="mt-0.5 size-4 shrink-0 text-royal-lit" /><dt className="sr-only">Languages</dt><dd className="text-mist">{c.languages.join(", ")}</dd></div>
        </dl>
        {overlay && (
          <motion.div
            className="absolute inset-0 flex flex-col justify-center rounded-2xl bg-raised p-4"
            initial={false}
            animate={{ y: shown ? "0%" : "100%" }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-faint">How I help</p>
            <p className="text-sm leading-relaxed text-mist">{helpNote(c)}</p>
          </motion.div>
        )}
      </div>
      {!overlay && (
        <div className="mt-4 rounded-2xl bg-raised p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-faint">How I help</p>
          <p className="text-sm leading-relaxed text-mist">{helpNote(c)}</p>
        </div>
      )}

      <Button type="button" variant="secondary" className="mt-6 w-full" onClick={() => onBook(c)} aria-label={`Book a session with ${c.name}`}>Book a session</Button>
    </motion.article>
  );
}

export function Counsellors() {
  const [active, setActive] = useState<Counsellor | null>(null);
  const close = useCallback(() => setActive(null), []);
  return (
    <section id="counsellors" aria-labelledby="counsellors-title" data-chapter={5} className="relative scroll-mt-24 py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <ChapterHead id="counsellors-title" index="—" eyebrow="Your crew" title="The people behind every shortlist." lede="A small team that knows the destinations it advises on. Book a free session with whoever fits your plans." />
          <DemoBadge>Fictional demo profiles</DemoBadge>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {counsellors.map((c, i) => <CounsellorCard key={c.name} c={c} i={i} onBook={setActive} />)}
        </div>
      </div>
      <Modal gate open={!!active} onClose={close} title={active ? `Book a session with ${active.name}` : "Book a session"}>
        {active && <BookingForm key={active.name} counsellor={active.name} />}
      </Modal>
    </section>
  );
}
