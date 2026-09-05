"use client";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { motion } from "framer-motion";
import { ArrowLeft, Check, RotateCcw } from "lucide-react";
import { useState } from "react";
import { demoMatches, quizSteps } from "@/data/quiz";
import { Button } from "../ui/Button";
import { LeadForm } from "../ui/LeadForm";
import { MatchCard, SpringCount } from "../ui/MatchCard";
import { Progress } from "../ui/Progress";
import { ChapterHead } from "../ui/Chapter";
import { DemoBadge } from "../ui/SectionHeading";

type Answers = Record<string, string[]>;

export function Quiz() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [error, setError] = useState("");
  const [dir, setDir] = useState(1);
  const finished = step === quizSteps.length;
  const q = quizSteps[Math.min(step, quizSteps.length - 1)];
  const selected = answers[q.id] ?? [];

  const choose = (opt: string) => {
    setError("");
    setAnswers((a) => {
      const cur = a[q.id] ?? [];
      if (!q.multi) return { ...a, [q.id]: [opt] };
      return { ...a, [q.id]: cur.includes(opt) ? cur.filter((o) => o !== opt) : [...cur, opt] };
    });
  };
  const next = () => {
    if (!selected.length) { setError(q.multi ? "Select at least one destination to continue." : "Please choose an option to continue."); return; }
    setDir(1); setStep(step + 1);
  };
  const back = () => { setError(""); setDir(-1); setStep(Math.max(0, step - 1)); };
  const restart = () => { setAnswers({}); setStep(0); setError(""); setDir(-1); };

  const slide = reduce ? { initial: { opacity: 0 }, animate: { opacity: 1 } } : { initial: { opacity: 0, x: dir * 40 }, animate: { opacity: 1, x: 0 } };

  return (
    <section id="quiz" data-chapter={2} className="relative scroll-mt-24 py-28 text-ivory md:py-40">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <ChapterHead index="03" eyebrow="The match" title="Five questions between you and a shortlist." lede="Answer honestly. The result is a first illustrative shortlist that a counsellor then refines with you." />

        <div className="mx-auto mt-12 max-w-3xl rounded-[2rem] bg-surface p-6 text-ink shadow-lift sm:p-10">
          {!finished ? (
            <>
              <Progress current={step} total={quizSteps.length} labels={["Study area", "Qualification", "Score", "Budget", "Destinations"]} />
              <div className="relative mt-8 overflow-hidden">
                <motion.div key={q.id} {...slide} transition={{ type: "spring", stiffness: 260, damping: 26 }}>
                    <h3 className="text-2xl text-ivory sm:text-3xl">{q.question}</h3>
                    <p className="mt-1 text-sm text-mist">{q.hint}</p>
                    <div role={q.multi ? "group" : "radiogroup"} aria-label={q.question} className="mt-6 grid gap-3 sm:grid-cols-2">
                      {q.options.map((opt) => {
                        const on = selected.includes(opt);
                        return (
                          <button key={opt} type="button" role={q.multi ? "checkbox" : "radio"} aria-checked={on} onClick={() => choose(opt)}
                            className={`flex min-h-14 items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-colors ${on ? "border-royal bg-royal/25 text-ivory" : "border-white/15 bg-surface text-ink hover:border-white/30"}`}>
                            {opt}
                            <span aria-hidden className={`grid size-5 shrink-0 place-items-center rounded-full border ${on ? "border-royal bg-royal text-white" : "border-white/20"}`}>{on && <Check className="size-3" />}</span>
                          </button>
                        );
                      })}
                    </div>
                </motion.div>
              </div>
              {error && <p role="alert" className="mt-4 text-sm font-medium text-coral">{error}</p>}
              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <Button type="button" variant="ghost" onClick={back} disabled={step === 0} className="disabled:opacity-40"><ArrowLeft aria-hidden className="size-4" /> Back</Button>
                <Button type="button" onClick={next} arrow>{step === quizSteps.length - 1 ? "See my matches" : "Continue"}</Button>
              </div>
            </>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <DemoBadge>Initial illustrative match, not an admission assessment</DemoBadge>
                  <h3 className="mt-3 text-2xl text-ivory sm:text-3xl">We found <SpringCount to={14} /> potential university matches for your profile.</h3>
                  <p className="mt-2 text-sm text-mist">Based on {answers.field?.[0]}, {answers.qualification?.[0]?.toLowerCase()}, {answers.score?.[0]} and {answers.destinations?.join(", ")}.</p>
                </div>
                <button type="button" onClick={restart} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-sm font-semibold text-ivory hover:bg-raised"><RotateCcw aria-hidden className="size-4" /> Restart quiz</button>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {demoMatches.map((m, i) => <MatchCard key={m.name} m={m} index={i} />)}
              </div>
              <div className="mt-10 rounded-3xl border border-white/10 bg-raised p-6 sm:p-8">
                <h4 className="font-serif text-2xl text-ivory">Unlock all 14 matches with a free counselling call</h4>
                <p className="mt-2 mb-6 text-sm text-mist">A counsellor will review your full profile and confirm which universities are realistic for you.</p>
                <LeadForm />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
