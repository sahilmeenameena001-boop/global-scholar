"use client";
import { ArrowDown, ArrowLeft, ArrowUp, Check, Plus, Send, Star, Trash2 } from "lucide-react";
import { useId, useState } from "react";
import { bucketCopy, MAX_COMPARE, shortlistCopy as copy } from "@/data/journey/config";
import { destinationById } from "@/data/journey/destinations";
import { homeCopy } from "@/data/journey/home";
import { livingCostEstimate } from "@/data/journey/offer";
import { money } from "@/lib/journey/offer";
import { profileMeta, track } from "@/lib/journey/analytics";
import { byBucket, type Evaluated } from "@/lib/journey/shortlist";
import { journey } from "@/lib/journey/store";
import type { Bucket, ShortlistStep, UniPriorityId, UserProfile } from "@/lib/journey/types";
import type { Preview } from "@/lib/journey/worlds";
import { Button } from "../../ui/Button";
import { DemoBadge } from "../../ui/SectionHeading";
import { UniversityPicker } from "./ShortlistQuestions";
import { BUCKET_STYLE, UniversityCard } from "./UniversityCard";

const BUCKETS: Bucket[] = ["ambitious", "target", "safe"];
const meta = (extra = {}) => ({ ...profileMeta(journey.get().profile, "shortlisting"), ...extra });

type Props = {
  step: Extract<ShortlistStep, "reveal" | "compare" | "finalise">;
  profile: UserProfile;
  list: Evaluated[];
  compareIds: string[];
  onCompareIds: (ids: string[]) => void;
  onStep: (s: ShortlistStep) => void;
  onPreview: (p: Preview | null) => void;
  onPlan: () => void;
  onCounsellor: () => void;
  focusRef: (el: HTMLHeadingElement | null) => void;
};

const heading = "text-[clamp(1.75rem,4.5vw,2.75rem)] leading-[1.05] text-ivory outline-none";
const back = "inline-flex min-h-11 items-center gap-2 pr-3 text-sm text-ivory/75 hover:text-ivory";
const iconBtn = "inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-semibold ring-1 ring-inset transition-colors disabled:opacity-35";

/**
 * The second half of shortlisting: the reveal sorted into ambitious / target /
 * safe, a side-by-side comparison of two to four, and the final ordered
 * shortlist that becomes the application plan.
 */
export function ShortlistResults({ step, profile, list, compareIds, onCompareIds, onStep, onPreview, onPlan, onCounsellor, focusRef }: Props) {
  const go = (s: ShortlistStep) => { onPreview(null); onStep(s); };

  return (
    <div>
      {step === "reveal" && <Reveal list={list} go={go} onPreview={onPreview} focusRef={focusRef} />}
      {step === "compare" && <Compare list={list} profile={profile} ids={compareIds} onIds={onCompareIds} go={go} focusRef={focusRef} />}
      {step === "finalise" && <Finalise list={list} profile={profile} go={go} onPlan={onPlan} onCounsellor={onCounsellor} focusRef={focusRef} />}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-start">
        <span className="shrink-0 self-start"><DemoBadge>Illustrative</DemoBadge></span>
        <p className="max-w-[80ch] text-xs leading-relaxed text-ivory/60">{copy.disclaimer}</p>
      </div>
    </div>
  );
}

/* ── Reveal ─────────────────────────────────────────────────────────── */

function Reveal({ list, go, onPreview, focusRef }: { list: Evaluated[]; go: (s: ShortlistStep) => void; onPreview: (p: Preview | null) => void; focusRef: Props["focusRef"] }) {
  const groups = byBucket(list);
  return (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky/80">{copy.reveal.eyebrow}</p>
      <h2 id="journey-title" ref={focusRef} tabIndex={-1} className={`mt-2 ${heading}`}>{copy.reveal.title(list.length)}</h2>

      {list.length === 0 ? (
        <p className="mt-4 text-ivory/80">{copy.reveal.empty}</p>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {BUCKETS.map((b) => (
            <section key={b} aria-labelledby={`bucket-${b}`}>
              <h3 id={`bucket-${b}`} className="flex items-baseline gap-2">
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset ${BUCKET_STYLE[b]}`}>{bucketCopy[b].label}</span>
                <span className="text-xs text-ivory/60">{groups[b].length}</span>
              </h3>
              <p className="mt-2 text-xs text-ivory/70">{bucketCopy[b].note}</p>
              <ul className="mt-3 space-y-3">
                {groups[b].map((e) => (
                  <li key={e.uni.id} onPointerEnter={() => onPreview({ kind: "university", id: e.uni.id })} onPointerLeave={() => onPreview(null)}>
                    <UniversityCard e={e} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {list.length >= 2 && <Button type="button" arrow onClick={() => go("compare")}>{copy.reveal.compare}</Button>}
        {list.length > 0 && <Button type="button" variant="secondary" onClick={() => go("finalise")}>{copy.reveal.finalise}</Button>}
        <button type="button" onClick={() => go("existing")} className={back}><ArrowLeft aria-hidden className="size-4" /> {copy.back}</button>
      </div>
    </>
  );
}

/* ── Compare ────────────────────────────────────────────────────────── */

function Compare({ list, profile, ids, onIds, go, focusRef }: { list: Evaluated[]; profile: UserProfile; ids: string[]; onIds: (ids: string[]) => void; go: (s: ShortlistStep) => void; focusRef: Props["focusRef"] }) {
  const [notice, setNotice] = useState("");
  const groupId = useId();
  const c = copy.compare;
  const picked = ids.map((id) => list.find((e) => e.uni.id === id)).filter((e): e is Evaluated => !!e);

  const toggle = (id: string) => {
    if (ids.includes(id)) { onIds(ids.filter((x) => x !== id)); setNotice(""); return; }
    if (ids.length >= MAX_COMPARE) { setNotice(c.tooMany); return; }
    const next = [...ids, id];
    onIds(next);
    setNotice("");
    if (next.length === 2 && ids.length === 1) track("comparison_started", meta({ universities: next }));
    if (next.length >= 2) track("shortlist_compared", meta({ universities: next }));
  };

  const rating = (n: number) => c.rating[Math.max(1, Math.min(5, n)) - 1];
  const all: { label: string; key?: UniPriorityId; value: (e: Evaluated) => string }[] = [
    { label: c.dims.course, key: "courseQuality", value: (e) => e.course },
    { label: c.dims.fit, value: (e) => `${bucketCopy[e.bucket].label} · ${e.fit}%` },
    { label: c.dims.ranking, key: "reputation", value: (e) => `${e.uni.rankBand} (illustrative)` },
    { label: c.dims.employability, key: "employability", value: (e) => rating(e.uni.ratings.employability) },
    { label: c.dims.career, key: "employability", value: (e) => e.uni.careerOutcome },
    { label: c.dims.fees, key: "lowerTuition", value: (e) => e.uni.tuition },
    { label: c.dims.scholarship, key: "scholarships", value: (e) => copy.card.scholarshipLevel[e.uni.scholarship] },
    { label: c.dims.living, key: "lowerTuition", value: (e) => `~${money(livingCostEstimate[e.uni.country], e.uni.country)}/yr` },
    { label: c.dims.city, key: "location", value: (e) => `${e.uni.city}, ${destinationById[e.uni.country].label}` },
    { label: c.dims.postStudy, key: "postStudyWork", value: (e) => destinationById[e.uni.country].work },
    { label: c.dims.deadline, value: (e) => e.deadline },
    { label: c.dims.difficulty, value: (e) => c.difficulty[e.uni.selectivity - 1] },
  ];
  // what the student said matters most comes first
  const matters = (k?: UniPriorityId) => !!k && profile.uniPriorities.includes(k);
  const rows = [...all.filter((r) => matters(r.key)), ...all.filter((r) => !matters(r.key))];

  return (
    <>
      <h2 id="journey-title" ref={focusRef} tabIndex={-1} className={heading}><span id={groupId}>{c.prompt}</span></h2>
      <p className="mt-1.5 font-hand text-xl leading-tight text-sky/80">{c.hint}</p>

      <div role="group" aria-labelledby={groupId} className="mt-5 flex flex-wrap gap-2">
        {list.map((e) => {
          const on = ids.includes(e.uni.id);
          return (
            <button key={e.uni.id} type="button" aria-pressed={on} onClick={() => toggle(e.uni.id)}
              className={`${iconBtn} min-h-12 px-4 text-sm backdrop-blur-sm ${on ? "bg-royal text-white ring-royal-lit" : "bg-void/45 text-ivory ring-white/20 hover:ring-white/40"}`}>
              {on && <Check aria-hidden className="size-3.5" />} {e.uni.name}
            </button>
          );
        })}
      </div>
      <p role="status" className="mt-2 min-h-5 text-sm font-medium text-sky">{notice}</p>

      {picked.length >= 2 && (
        <div tabIndex={0} role="region" aria-label={c.region} className="mt-4 overflow-x-auto rounded-2xl ring-1 ring-white/10" data-lenis-prevent>
          <table className="w-full min-w-[40rem] border-collapse bg-surface/90 text-left text-sm backdrop-blur-sm">
            <thead>
              <tr>
                <th scope="col" className="sticky left-0 bg-surface p-3"><span className="sr-only">Dimension</span></th>
                {picked.map((e) => (
                  <th key={e.uni.id} scope="col" className="p-3 align-bottom">
                    <span className="block font-serif text-base text-ivory">{e.uni.name}</span>
                    <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${BUCKET_STYLE[e.bucket]}`}>{bucketCopy[e.bucket].label} · {e.fit}%</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-t border-white/10">
                  <th scope="row" className="sticky left-0 bg-surface p-3 text-xs font-semibold uppercase tracking-[0.12em] text-faint">
                    {r.label}
                    {matters(r.key) && <span className="mt-1 block text-[10px] normal-case tracking-normal text-coral">★ {c.matters}</span>}
                  </th>
                  {picked.map((e) => <td key={e.uni.id} className="p-3 text-ivory/90">{r.value(e)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button type="button" arrow onClick={() => go("finalise")}>{c.next}</Button>
        <button type="button" onClick={() => go("reveal")} className={back}><ArrowLeft aria-hidden className="size-4" /> {copy.back}</button>
      </div>
    </>
  );
}

/* ── Finalise ───────────────────────────────────────────────────────── */

function Finalise({ list, profile, go, onPlan, onCounsellor, focusRef }: {
  list: Evaluated[]; profile: UserProfile; go: (s: ShortlistStep) => void; onPlan: () => void; onCounsellor: () => void; focusRef: Props["focusRef"];
}) {
  const f = copy.finalise;
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");
  const searchId = useId();

  const ids = profile.shortlist;
  const move = (i: number, by: number) => {
    const next = [...ids];
    const [x] = next.splice(i, 1);
    next.splice(i + by, 0, x);
    journey.patch({ shortlist: next });
  };
  const remove = (id: string) => {
    journey.patch({ shortlist: ids.filter((x) => x !== id), savedUniversities: profile.savedUniversities.filter((x) => x !== id) });
    track("university_removed", meta({ university: id }));
  };
  const save = (id: string) => {
    const on = profile.savedUniversities.includes(id);
    journey.patch({ savedUniversities: on ? profile.savedUniversities.filter((x) => x !== id) : [...profile.savedUniversities, id] });
    if (!on) track("university_saved", meta({ university: id }));
  };
  const startApplication = (id: string) => {
    const apps = journey.get().profile.applications;
    if (apps.some((a) => a.university === id)) return;
    journey.patch({ applications: [...apps, { university: id, status: "inProgress", pending: [], dates: {} }] });
    track("application_started", meta({ university: id, source: "shortlist" }));
  };
  const toggleAdd = (id: string) => {
    if (ids.includes(id)) remove(id);
    else { journey.patch({ shortlist: [...ids, id] }); track("university_saved", meta({ university: id, source: "added" })); }
  };

  return (
    <>
      <h2 id="journey-title" ref={focusRef} tabIndex={-1} className={heading}>{f.prompt}</h2>
      <p className="mt-1.5 font-hand text-xl leading-tight text-sky/80">{f.hint}</p>
      <p aria-live="polite" className="mt-4 text-sm font-semibold text-ivory">{f.count(list.length)}</p>

      {list.length === 0 && (
        <div className="mt-4 rounded-2xl bg-void/45 p-5 ring-1 ring-white/10">
          <p className="text-ivory/85">{homeCopy.empty.shortlist.text}</p>
          <div className="mt-4"><Button href={homeCopy.empty.shortlist.href} variant="secondary" arrow>{homeCopy.empty.shortlist.cta}</Button></div>
        </div>
      )}

      <ol className="mt-4 space-y-3">
        {list.map((e, i) => {
          const saved = profile.savedUniversities.includes(e.uni.id);
          return (
            <li key={e.uni.id} className="flex flex-col gap-3 rounded-2xl bg-surface/90 p-3 ring-1 ring-white/10 backdrop-blur-sm sm:flex-row sm:items-center">
              <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-coral/20 font-serif text-lg text-coral">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-lg text-ivory">{e.uni.name}</p>
                <p className="text-xs text-ivory/65">
                  <span className={`mr-2 inline-flex rounded-full px-2 py-0.5 font-semibold ring-1 ring-inset ${BUCKET_STYLE[e.bucket]}`}>{bucketCopy[e.bucket].label}</span>
                  {e.fit}% fit · {e.uni.city} · {e.deadline}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" aria-pressed={saved} onClick={() => save(e.uni.id)}
                  className={`${iconBtn} ${saved ? "bg-coral text-void ring-coral" : "text-ivory ring-white/20 hover:ring-white/40"}`}>
                  <Star aria-hidden className={`size-3.5 ${saved ? "fill-current" : ""}`} /> {saved ? f.saved : f.save}
                </button>
                <button type="button" aria-label={`${f.up}: ${e.uni.name}`} disabled={i === 0} onClick={() => move(i, -1)} className={`${iconBtn} text-ivory ring-white/20 hover:ring-white/40`}>
                  <ArrowUp aria-hidden className="size-4" />
                </button>
                <button type="button" aria-label={`${f.down}: ${e.uni.name}`} disabled={i === list.length - 1} onClick={() => move(i, 1)} className={`${iconBtn} text-ivory ring-white/20 hover:ring-white/40`}>
                  <ArrowDown aria-hidden className="size-4" />
                </button>
                {profile.applications.some((a) => a.university === e.uni.id) ? (
                  <span className={`${iconBtn} text-sky ring-sky/30`}><Check aria-hidden className="size-3.5" /> {f.tracking}</span>
                ) : (
                  <button type="button" onClick={() => startApplication(e.uni.id)} className={`${iconBtn} text-ivory ring-white/20 hover:ring-white/40`}>
                    <Send aria-hidden className="size-3.5" /> {f.start}
                  </button>
                )}
                <button type="button" aria-label={`${f.remove}: ${e.uni.name}`} onClick={() => remove(e.uni.id)} className={`${iconBtn} text-ivory/80 ring-white/20 hover:text-coral hover:ring-coral/50`}>
                  <Trash2 aria-hidden className="size-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-4">
        <button type="button" aria-expanded={adding} onClick={() => setAdding(!adding)} className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-ivory ring-1 ring-inset ring-white/20 hover:ring-white/40">
          <Plus aria-hidden className="size-4" /> {f.add}
        </button>
        {adding && (
          <div className="mt-3 max-w-2xl">
            <label htmlFor={searchId} className="sr-only">{copy.existing.search}</label>
            <input id={searchId} type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={copy.existing.searchPlaceholder}
              className="min-h-12 w-full max-w-sm rounded-xl bg-void/50 px-4 text-sm text-ivory ring-1 ring-inset ring-white/20 backdrop-blur-sm placeholder:text-faint focus:ring-2 focus:ring-royal-lit" />
            <UniversityPicker query={query} chosen={ids} onToggle={toggleAdd} emptyText={copy.existing.none} addedText={copy.existing.added} />
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="button" variant="coral" magnetic arrow disabled={!list.length} onClick={onPlan}>{f.primary}</Button>
        <Button type="button" variant="secondary" onClick={onCounsellor}>{f.secondary}</Button>
        <button type="button" onClick={() => go("compare")} className={back}><ArrowLeft aria-hidden className="size-4" /> {copy.back}</button>
      </div>
    </>
  );
}
