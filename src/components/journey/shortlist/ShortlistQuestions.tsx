"use client";
import { ArrowLeft, Check, Pencil, Plus, Search } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  disciplines, intakes, MAX_PRIORITIES, POSTGRAD_FROM, qualifications, scoreBands, shortlistCopy as copy, tests,
  uniPriorities, workExperience,
} from "@/data/journey/config";
import { coursesByDiscipline } from "@/data/journey/courses";
import { destinations } from "@/data/journey/destinations";
import { universityById } from "@/data/journey/universities";
import { profileMeta, track } from "@/lib/journey/analytics";
import { recommend, searchUniversities } from "@/lib/journey/shortlist";
import { journey } from "@/lib/journey/store";
import type { DestinationId, DisciplineId, ShortlistStep, UniPriorityId, UserProfile } from "@/lib/journey/types";
import type { Preview } from "@/lib/journey/worlds";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Button } from "../../ui/Button";
import { Choice } from "../Choice";

const ORDER: ShortlistStep[] = ["course", "countries", "intake", "fit", "priorities", "existing"];
const PREV: Partial<Record<ShortlistStep, ShortlistStep>> = { countries: "course", intake: "countries", fit: "intake", priorities: "fit", existing: "priorities" };

/** Every course we know, with its area — the search index for "search for a course". */
const ALL_COURSES = (Object.keys(coursesByDiscipline) as DisciplineId[])
  .filter((d) => d !== "undecided")
  .flatMap((d) => coursesByDiscipline[d].map((name) => ({ name, discipline: d })));

const meta = (extra = {}) => ({ ...profileMeta(journey.get().profile, "shortlisting"), ...extra });

type Props = {
  profile: UserProfile;
  step: ShortlistStep;
  onStep: (s: ShortlistStep) => void;
  onPreview: (p: Preview | null) => void;
  /** Focus the new prompt after a step change, so it is announced. */
  focusRef: (el: HTMLHeadingElement | null) => void;
};

/**
 * The question half of shortlisting: Course → Countries → Intake → Academic
 * fit → Priorities → "Universities in mind?". Answers persist in the journey
 * store and preview in the thought panel as they are hovered.
 */
export function ShortlistQuestions({ profile, step, onStep, onPreview, focusRef }: Props) {
  const reduce = useReducedMotion();
  const promptId = useId();
  const searchId = useId();
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [uniQuery, setUniQuery] = useState("");
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const go = useCallback((s: ShortlistStep) => {
    window.clearTimeout(timer.current);
    setNotice("");
    onPreview(null);
    onStep(s);
  }, [onPreview, onStep]);
  const next = () => go(ORDER[ORDER.indexOf(step) + 1]);
  /** Single answers move on after a beat, so the thought panel visibly settles. */
  const advance = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(next, reduce ? 300 : 800);
  };

  /* ── answers ── */
  const pickDiscipline = (id: DisciplineId) => {
    journey.patch({ discipline: id, course: null });
    track("discipline_selected", meta({ discipline: id }));
  };
  const pickCourse = (name: string | null, discipline: DisciplineId) => {
    journey.patch({ discipline, course: name });
    track("discipline_selected", meta({ discipline, course: name }));
    advance();
  };
  const toggleCountry = (id: DestinationId) => {
    const cur = journey.get().profile.destinations;
    const on = cur.includes(id);
    journey.patch({ destinations: on ? cur.filter((x) => x !== id) : [...cur, id], openDestination: false });
    track("destination_selected", meta({ destination: id, action: on ? "removed" : "added" }));
  };
  const toggleOpen = () => {
    const open = !journey.get().profile.openDestination;
    journey.patch({ openDestination: open, destinations: open ? [] : journey.get().profile.destinations });
    if (open) track("destination_selected", meta({ destination: "open" }));
  };
  const pickIntake = (id: string) => {
    journey.patch({ intake: id });
    track("intake_selected", meta({ intake: id }));
    advance();
  };
  const toggleTest = (id: string) => {
    const cur = journey.get().profile.tests;
    if (id === "none") { journey.patch({ tests: cur.includes("none") ? [] : ["none"] }); return; }
    const base = cur.filter((t) => t !== "none");
    journey.patch({ tests: base.includes(id) ? base.filter((t) => t !== id) : [...base, id] });
  };
  const togglePriority = (id: UniPriorityId) => {
    const cur = journey.get().profile.uniPriorities;
    if (cur.includes(id)) { journey.patch({ uniPriorities: cur.filter((x) => x !== id) }); setNotice(""); }
    else if (cur.length >= MAX_PRIORITIES) setNotice(copy.maxed);
    else { journey.patch({ uniPriorities: [...cur, id] }); setNotice(""); track("priority_selected", meta({ priority: id })); }
  };
  const toggleOwn = (id: string) => {
    const cur = journey.get().profile.ownUniversities;
    journey.patch({ ownUniversities: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] });
  };

  /** Build the shortlist and move to the reveal. */
  const generate = (mode: "own" | "recommend") => {
    const p = journey.get().profile;
    if (mode === "own" && !p.ownUniversities.length) { setNotice(copy.existing.needOne); return; }
    const ids = mode === "own" ? p.ownUniversities : recommend(p);
    journey.patch({ shortlistMode: mode, shortlist: ids, savedUniversities: p.savedUniversities.filter((id) => ids.includes(id)) });
    track("shortlist_generated", meta({ mode, count: ids.length }));
    go("reveal");
  };

  /* ── guards for the multi-answer steps ── */
  const continueIf = (ok: boolean, message: string) => () => (ok ? next() : setNotice(message));

  const prompt = (text: string, hint?: string) => (
    <>
      <h2 id="journey-title" ref={focusRef} tabIndex={-1} className="text-[clamp(1.75rem,5vw,3rem)] leading-[1.05] text-ivory outline-none">
        <span id={promptId}>{text}</span>
      </h2>
      {hint && <p className="mt-1.5 font-hand text-xl leading-tight text-sky/80">{hint}</p>}
    </>
  );

  const group = (children: React.ReactNode, labelledBy = promptId) => (
    <div role="group" aria-labelledby={labelledBy} className="mt-4 flex flex-wrap gap-2">{children}</div>
  );

  const discipline = profile.discipline && profile.discipline !== "undecided" ? profile.discipline : null;
  const matches = query.trim() ? ALL_COURSES.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8) : [];
  const postgrad = !!profile.qualification && POSTGRAD_FROM.includes(profile.qualification);

  const pins: { step: ShortlistStep; text: string }[] = [
    ...(profile.discipline ? [{ step: "course" as const, text: profile.course ?? disciplines.find((d) => d.id === profile.discipline)!.short }] : []),
    ...(profile.destinations.length || profile.openDestination ? [{
      step: "countries" as const,
      text: profile.openDestination ? copy.countries.open : profile.destinations.map((d) => destinations.find((x) => x.id === d)!.label).join(", "),
    }] : []),
    ...(profile.intake ? [{ step: "intake" as const, text: intakes.find((o) => o.id === profile.intake)!.short }] : []),
    ...(profile.academicScore ? [{ step: "fit" as const, text: scoreBands.find((o) => o.id === profile.academicScore)!.short }] : []),
    ...(profile.uniPriorities.length ? [{ step: "priorities" as const, text: profile.uniPriorities.map((id) => uniPriorities.find((o) => o.id === id)!.short).join(", ") }] : []),
  ].filter((p) => ORDER.indexOf(p.step) < ORDER.indexOf(step));

  return (
    <div>
      {pins.length > 0 && (
        <ul aria-label={copy.pins} className="mb-5 flex flex-wrap gap-2">
          {pins.map((p) => (
            <li key={p.step}>
              <button type="button" onClick={() => go(p.step)} aria-label={`${copy.edit}: ${p.text}`}
                className="inline-flex min-h-11 max-w-[18rem] items-center gap-2 rounded-full bg-void/45 px-3.5 text-xs font-semibold text-ivory ring-1 ring-inset ring-ivory/20 backdrop-blur-sm hover:ring-ivory/50">
                <span className="truncate">{p.text}</span> <Pencil aria-hidden className="size-3 shrink-0 opacity-60" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {step === "course" && (
        <>
          {prompt(copy.course.prompt, copy.course.hint)}
          {group(disciplines.filter((d) => d.id !== "undecided").map((d, i) => (
            <Choice key={d.id} label={d.label} i={i} icon={d.icon} on={profile.discipline === d.id}
              preview={{ kind: "discipline", id: d.id }} onPreview={onPreview} onPick={() => pickDiscipline(d.id)} />
          )))}

          {discipline && (
            <div className="mt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky/80">{disciplines.find((d) => d.id === discipline)!.short}</p>
              {group([
                ...coursesByDiscipline[discipline].map((name, i) => (
                  <Choice key={name} label={name} i={i} on={profile.course === name}
                    preview={{ kind: "course", id: name, discipline }} onPreview={onPreview} onPick={() => pickCourse(name, discipline)} />
                )),
                <Choice key="any" label={copy.course.anyCourse} i={9} icon="sparkles" on={!!profile.discipline && profile.course === null}
                  preview={{ kind: "discipline", id: discipline }} onPreview={onPreview} onPick={() => pickCourse(null, discipline)} />,
              ])}
            </div>
          )}

          <div className="mt-6">
            <label htmlFor={searchId} className="text-sm font-medium text-ivory/85">{copy.course.search}</label>
            <div className="relative mt-1.5 max-w-sm">
              <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint" />
              <input id={searchId} type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={copy.course.searchPlaceholder}
                className="min-h-12 w-full rounded-xl bg-void/50 pl-10 pr-4 text-sm text-ivory ring-1 ring-inset ring-white/20 backdrop-blur-sm placeholder:text-faint focus:ring-2 focus:ring-royal-lit" />
            </div>
            <p aria-live="polite" className="sr-only">{query.trim() ? `${matches.length} courses found` : ""}</p>
            {query.trim() && (matches.length
              ? group(matches.map((m, i) => (
                  <Choice key={m.name} label={m.name} i={i} on={profile.course === m.name}
                    preview={{ kind: "course", id: m.name, discipline: m.discipline }} onPreview={onPreview} onPick={() => pickCourse(m.name, m.discipline)} />
                )), searchId)
              : <p className="mt-3 text-sm text-ivory/70">{copy.course.noMatch}</p>)}
          </div>
        </>
      )}

      {step === "countries" && (
        <>
          {prompt(copy.countries.prompt, copy.countries.hint)}
          {group([
            ...destinations.map((d, i) => (
              <Choice key={d.id} label={d.label} i={i} icon="pin" on={profile.destinations.includes(d.id)}
                preview={{ kind: "destination", id: d.id }} onPreview={onPreview} onPick={() => toggleCountry(d.id)} />
            )),
            <Choice key="open" label={copy.countries.open} i={destinations.length} icon="sparkles" on={profile.openDestination}
              preview={{ kind: "destination", id: "decide" }} onPreview={onPreview} onPick={toggleOpen} />,
          ])}
        </>
      )}

      {step === "intake" && (
        <>
          {prompt(copy.intake.prompt, copy.intake.hint)}
          {group(intakes.map((o, i) => (
            <Choice key={o.id} label={o.label} i={i} on={profile.intake === o.id}
              preview={{ kind: "intake", id: o.id }} onPreview={onPreview} onPick={() => pickIntake(o.id)} />
          )))}
        </>
      )}

      {step === "fit" && (
        <>
          {prompt(copy.fit.prompt, copy.fit.hint)}
          <FitGroup label={copy.fit.qualification}>
            {qualifications.map((o, i) => <Choice key={o.id} label={o.label} i={i} on={profile.qualification === o.id} onPick={() => journey.patch({ qualification: o.id })} />)}
          </FitGroup>
          <FitGroup label={copy.fit.score} hint={copy.fit.scoreHint}>
            {scoreBands.map((o, i) => <Choice key={o.id} label={o.label} i={i} on={profile.academicScore === o.id} onPick={() => journey.patch({ academicScore: o.id })} />)}
          </FitGroup>
          <FitGroup label={copy.fit.tests}>
            {tests.map((o, i) => <Choice key={o.id} label={o.label} i={i} on={profile.tests.includes(o.id)} onPick={() => toggleTest(o.id)} />)}
          </FitGroup>
          {postgrad && (
            <FitGroup label={copy.fit.work}>
              {workExperience.map((o, i) => <Choice key={o.id} label={o.label} i={i} on={profile.workExperience === o.id} onPick={() => journey.patch({ workExperience: o.id })} />)}
            </FitGroup>
          )}
        </>
      )}

      {step === "priorities" && (
        <>
          {prompt(copy.priorities.prompt, copy.priorities.hint)}
          {group(uniPriorities.map((o, i) => (
            <Choice key={o.id} label={o.label} i={i} icon={o.icon} on={profile.uniPriorities.includes(o.id)}
              muted={!profile.uniPriorities.includes(o.id) && profile.uniPriorities.length >= MAX_PRIORITIES}
              preview={{ kind: "uniPriority", id: o.id }} onPreview={onPreview} onPick={() => togglePriority(o.id)} />
          )))}
        </>
      )}

      {step === "existing" && (
        <>
          {prompt(copy.existing.prompt, copy.existing.hint)}
          {group([
            <Choice key="own" label={copy.existing.yes} i={0} icon="pin" on={profile.shortlistMode === "own"}
              preview={{ kind: "mode", id: "own" }} onPreview={onPreview} onPick={() => journey.patch({ shortlistMode: "own" })} />,
            <Choice key="rec" label={copy.existing.no} i={1} icon="sparkles" on={false}
              preview={{ kind: "mode", id: "recommend" }} onPreview={onPreview} onPick={() => generate("recommend")} />,
          ])}

          {profile.shortlistMode === "own" && (
            <div className="mt-6">
              <label htmlFor={searchId} className="text-sm font-medium text-ivory/85">{copy.existing.search}</label>
              <div className="relative mt-1.5 max-w-sm">
                <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint" />
                <input id={searchId} type="search" value={uniQuery} onChange={(e) => setUniQuery(e.target.value)} placeholder={copy.existing.searchPlaceholder}
                  className="min-h-12 w-full rounded-xl bg-void/50 pl-10 pr-4 text-sm text-ivory ring-1 ring-inset ring-white/20 backdrop-blur-sm placeholder:text-faint focus:ring-2 focus:ring-royal-lit" />
              </div>
              <UniversityPicker query={uniQuery} chosen={profile.ownUniversities} onToggle={toggleOwn} emptyText={copy.existing.none} addedText={copy.existing.added} />
              <Button type="button" variant="coral" arrow className="mt-5" onClick={() => generate("own")}>{copy.existing.compare}</Button>
            </div>
          )}
        </>
      )}

      <p role="status" className="mt-3 min-h-5 text-sm font-medium text-sky">{notice}</p>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        {step === "countries" && <Button type="button" arrow onClick={continueIf(profile.destinations.length > 0 || profile.openDestination, copy.pickOne)}>{copy.next}</Button>}
        {step === "fit" && <Button type="button" arrow onClick={continueIf(!!profile.qualification && !!profile.academicScore, copy.fit.missing)}>{copy.next}</Button>}
        {step === "priorities" && <Button type="button" arrow onClick={continueIf(profile.uniPriorities.length > 0, copy.pickOne)}>{copy.next}</Button>}
        {step === "course" && profile.discipline && <Button type="button" arrow onClick={next}>{copy.next}</Button>}
        {PREV[step] && (
          <button type="button" onClick={() => go(PREV[step]!)} className="inline-flex min-h-11 items-center gap-2 pr-3 text-sm text-ivory/75 hover:text-ivory">
            <ArrowLeft aria-hidden className="size-4" /> {copy.back}
          </button>
        )}
      </div>
    </div>
  );
}

/** A labelled cluster of chips inside the academic-fit step. */
function FitGroup({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  const id = useId();
  return (
    <div className="mt-5">
      <p id={id} className="text-sm font-medium text-ivory/85">{label}</p>
      {hint && <p className="text-xs text-ivory/60">{hint}</p>}
      <div role="group" aria-labelledby={id} className="mt-2 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

/** Search results for "add my universities", each a toggle. */
export function UniversityPicker({ query, chosen, onToggle, emptyText, addedText }: {
  query: string; chosen: string[]; onToggle: (id: string) => void; emptyText: string; addedText: string;
}) {
  const results = searchUniversities(query).slice(0, 8);
  if (!results.length) return <p className="mt-3 text-sm text-ivory/70">{emptyText}</p>;
  return (
    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
      {results.map((u) => {
        const on = chosen.includes(u.id);
        return (
          <li key={u.id}>
            <button type="button" aria-pressed={on} onClick={() => onToggle(u.id)}
              className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2 text-left text-sm ring-1 ring-inset transition-colors ${on ? "bg-royal/30 text-ivory ring-royal-lit/60" : "bg-void/45 text-ivory/90 ring-white/15 hover:ring-white/35"} backdrop-blur-sm`}>
              <span className="min-w-0">
                <span className="block truncate font-semibold">{u.name}</span>
                <span className="block text-xs text-ivory/60">{u.city}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1 text-xs font-semibold">
                {on ? <><Check aria-hidden className="size-3.5" /> {addedText}</> : <Plus aria-hidden className="size-4" />}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** For other steps that need the university list by id. */
export const universityName = (id: string) => universityById[id]?.name ?? id;
