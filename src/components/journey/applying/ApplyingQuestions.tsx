"use client";
import { ArrowLeft, X } from "lucide-react";
import { useId, useState } from "react";
import { applyingCopy as copy, appStatuses, appTasks, deadlineKinds, helpOptions } from "@/data/journey/config";
import { profileMeta, track } from "@/lib/journey/analytics";
import { daysUntil, uniName } from "@/lib/journey/applying";
import { journey } from "@/lib/journey/store";
import type { Application, ApplyStep, AppStatus, AppTask, DeadlineKind, HelpId, UserProfile } from "@/lib/journey/types";
import type { Preview } from "@/lib/journey/worlds";
import { Button } from "../../ui/Button";
import { Choice } from "../Choice";
import { UniversitySearchAdd } from "../UniversitySearchAdd";

const ORDER: ApplyStep[] = ["universities", "status", "pending", "deadlines", "help", "dashboard"];
const meta = (extra = {}) => ({ ...profileMeta(journey.get().profile, "applying"), ...extra });

/** Update one application in the store. */
function patchApp(university: string, change: (a: Application) => Application) {
  journey.patch({ applications: journey.get().profile.applications.map((a) => (a.university === university ? change(a) : a)) });
}

type Props = {
  profile: UserProfile;
  step: Exclude<ApplyStep, "dashboard" | "next">;
  today: string;
  onStep: (s: ApplyStep) => void;
  onPreview: (p: Preview | null) => void;
  focusRef: (el: HTMLHeadingElement | null) => void;
};

/**
 * The question half of applying: where you applied, the status of each, what
 * is pending, the dates you know, and the help you want. Every answer is
 * per university and saved as you go.
 */
export function ApplyingQuestions({ profile, step, today, onStep, onPreview, focusRef }: Props) {
  const [notice, setNotice] = useState("");
  const promptId = useId();
  const apps = profile.applications;
  const go = (s: ApplyStep) => { setNotice(""); onPreview(null); onStep(s); };
  const next = () => go(ORDER[ORDER.indexOf(step) + 1]);
  const prev = ORDER[ORDER.indexOf(step) - 1];

  const prompt = (text: string, hint: string) => (
    <>
      <h2 id="journey-title" ref={focusRef} tabIndex={-1} className="text-[clamp(1.75rem,5vw,3rem)] leading-[1.05] text-ivory outline-none">
        <span id={promptId}>{text}</span>
      </h2>
      <p className="mt-1.5 font-hand text-xl leading-tight text-sky/80">{hint}</p>
    </>
  );

  return (
    <div>
      {step === "universities" && <>
        {prompt(copy.universities.prompt, copy.universities.hint)}
        <Universities profile={profile} />
      </>}

      {step === "status" && <>
        {prompt(copy.status.prompt, copy.status.hint)}
        <div className="mt-5 space-y-5">
          {apps.map((a) => (
            <PerUniversity key={a.university} university={a.university}>
              {appStatuses.map((s, i) => (
                <Choice key={s.id} label={s.label} i={i} on={a.status === s.id}
                  preview={{ kind: "appStatus", id: s.id, university: a.university }} onPreview={onPreview}
                  onPick={() => {
                    patchApp(a.university, (x) => ({ ...x, status: s.id as AppStatus }));
                    track(s.id === "submitted" ? "application_submitted" : "application_started", meta({ university: a.university, status: s.id }));
                  }} />
              ))}
            </PerUniversity>
          ))}
        </div>
      </>}

      {step === "pending" && <>
        {prompt(copy.pending.prompt, copy.pending.hint)}
        <div className="mt-5 space-y-5">
          {apps.map((a) => (
            <div key={a.university} onPointerEnter={() => onPreview({ kind: "university", id: a.university })} onPointerLeave={() => onPreview(null)}>
              <PerUniversity university={a.university} aside={a.pending.length ? undefined : copy.pending.allDone}>
                {appTasks.map((t, i) => {
                  const on = a.pending.includes(t.id);
                  return (
                    <Choice key={t.id} label={t.label} i={i} on={on} onPick={() => {
                      patchApp(a.university, (x) => ({ ...x, pending: on ? x.pending.filter((p) => p !== t.id) : [...x.pending, t.id as AppTask] }));
                      if (on) track("document_completed", meta({ university: a.university, task: t.id }));
                    }} />
                  );
                })}
              </PerUniversity>
            </div>
          ))}
        </div>
      </>}

      {step === "deadlines" && <>
        {prompt(copy.deadlines.prompt, copy.deadlines.hint)}
        <div className="mt-5 space-y-4">
          {apps.map((a) => <Deadlines key={a.university} app={a} today={today} />)}
        </div>
      </>}

      {step === "help" && <>
        {prompt(copy.help.prompt, copy.help.hint)}
        <div role="group" aria-labelledby={promptId} className="mt-4 flex flex-wrap gap-2">
          {helpOptions.map((o, i) => (
            <Choice key={o.id} label={o.label} i={i} icon={o.icon} on={profile.helpNeeded.includes(o.id)}
              preview={{ kind: "help", id: o.id }} onPreview={onPreview}
              onPick={() => {
                const cur = journey.get().profile.helpNeeded;
                const next: HelpId[] = o.id === "none"
                  ? (cur.includes("none") ? [] : ["none"])
                  : cur.includes(o.id) ? cur.filter((x) => x !== o.id) : [...cur.filter((x) => x !== "none"), o.id];
                journey.patch({ helpNeeded: next });
              }} />
          ))}
        </div>
      </>}

      <p role="status" className="mt-3 min-h-5 text-sm font-medium text-sky">{notice}</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <Button type="button" arrow onClick={() => (step === "universities" && !apps.length ? setNotice(copy.universities.needOne) : next())}>
          {step === "help" ? copy.help.toDashboard : copy.next_}
        </Button>
        {prev && (
          <button type="button" onClick={() => go(prev)} className="inline-flex min-h-11 items-center gap-2 pr-3 text-sm text-ivory/75 hover:text-ivory">
            <ArrowLeft aria-hidden className="size-4" /> {copy.back}
          </button>
        )}
      </div>
    </div>
  );
}

/** A university's name over its own row of choices. */
function PerUniversity({ university, aside, children }: { university: string; aside?: string; children: React.ReactNode }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="rounded-2xl bg-void/40 p-4 ring-1 ring-white/10 backdrop-blur-sm">
      <h3 id={id} className="flex items-baseline justify-between gap-3 font-serif text-lg text-ivory">
        {uniName(university)}
        {aside && <span className="font-sans text-xs font-semibold text-sky">✓ {aside}</span>}
      </h3>
      <div role="group" aria-labelledby={id} className="mt-3 flex flex-wrap gap-2">{children}</div>
    </section>
  );
}

/** Step 1: pick from the saved shortlist, search the catalogue, or type any name. */
function Universities({ profile }: { profile: UserProfile }) {
  const listId = useId();
  const chosen = profile.applications.map((a) => a.university);

  const toggle = (id: string) => {
    const apps = journey.get().profile.applications;
    if (apps.some((a) => a.university === id)) { journey.patch({ applications: apps.filter((a) => a.university !== id) }); return; }
    journey.patch({ applications: [...apps, { university: id, status: "notStarted", pending: [], dates: {} }] });
    // tracking an application is the student saying they're applying (never move someone back from an offer)
    const stage = journey.get().profile.journeyStage;
    if (stage !== "applying" && stage !== "offer") journey.setStage("applying");
    track("application_started", meta({ university: id }));
  };

  return (
    <div className="mt-5 space-y-6">
      {profile.shortlist.length > 0 && (
        <div>
          <p id={listId} className="text-sm font-medium text-ivory/85">{copy.universities.fromShortlist}</p>
          <div role="group" aria-labelledby={listId} className="mt-2 flex flex-wrap gap-2">
            {profile.shortlist.map((id, i) => (
              <Choice key={id} label={uniName(id)} i={i} icon="graduation" on={chosen.includes(id)} onPick={() => toggle(id)} />
            ))}
          </div>
        </div>
      )}

      <UniversitySearchAdd chosen={chosen} onToggle={toggle} copy={{
        label: copy.universities.search, placeholder: copy.universities.searchPlaceholder, addCustom: copy.universities.addCustom, added: copy.universities.added,
      }} />

      {profile.applications.length > 0 && (
        <div>
          <p className="text-sm font-medium text-ivory/85">{copy.universities.yours}</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {profile.applications.map((a) => (
              <li key={a.university} className="inline-flex min-h-11 items-center gap-1 rounded-full bg-ivory py-1 pl-4 pr-1 text-sm font-semibold text-ink">
                {uniName(a.university)}
                <button type="button" aria-label={`${copy.universities.remove}: ${uniName(a.university)}`} onClick={() => toggle(a.university)}
                  className="grid size-9 place-items-center rounded-full hover:bg-ink/10"><X aria-hidden className="size-4" /></button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Step 4: the dates one application has, with the less common ones tucked away. */
function Deadlines({ app, today }: { app: Application; today: string }) {
  const [more, setMore] = useState(Object.keys(app.dates).some((k) => k !== "application"));
  const shown = deadlineKinds.filter((d) => more || d.id === "application");
  const set = (k: DeadlineKind, v: string) => patchApp(app.university, (x) => {
    const dates = { ...x.dates };
    if (v) dates[k] = v; else delete dates[k];
    return { ...x, dates };
  });
  return (
    <section className="rounded-2xl bg-void/40 p-4 ring-1 ring-white/10 backdrop-blur-sm">
      <h3 className="font-serif text-lg text-ivory">{uniName(app.university)}</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {shown.map((d) => {
          const id = `${app.university}-${d.id}`;
          const value = app.dates[d.id] ?? "";
          return (
            <div key={d.id}>
              <label htmlFor={id} className="flex justify-between gap-2 text-xs font-medium text-ivory/80">
                {d.label}
                {value && <span className={daysUntil(value, today) <= 14 ? "text-coral" : "text-sky"}>{copy.deadlines.days(daysUntil(value, today))}</span>}
              </label>
              <input id={id} type="date" value={value} onChange={(e) => set(d.id, e.target.value)}
                className="mt-1 min-h-11 w-full rounded-lg bg-void/50 px-3 text-sm text-ivory ring-1 ring-inset ring-white/20 [color-scheme:dark] focus:ring-2 focus:ring-royal-lit" />
            </div>
          );
        })}
      </div>
      <button type="button" aria-expanded={more} onClick={() => setMore(!more)} className="mt-3 inline-flex min-h-11 items-center text-xs font-semibold text-sky hover:text-ivory">
        {more ? copy.deadlines.fewer : copy.deadlines.more}
      </button>
    </section>
  );
}
