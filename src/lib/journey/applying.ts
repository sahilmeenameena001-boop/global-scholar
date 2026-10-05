import { applyingCopy, appStatuses, appTasks, deadlineKinds } from "@/data/journey/config";
import { universityById } from "@/data/journey/universities";
import type { Application, AppTask, DeadlineKind } from "./types";

/**
 * The application tracker: pure functions from what the student entered to a
 * consolidated status and one next best action. Nothing here is fetched from
 * a university; it only orders what the student told us.
 */

const CUSTOM = "custom:";
export const customId = (name: string) => `${CUSTOM}${name.trim()}`;

/** Full name for display: catalogue universities by id, custom ones by what was typed. */
export function uniName(id: string) {
  if (id.startsWith(CUSTOM)) return id.slice(CUSTOM.length);
  return universityById[id]?.name ?? id;
}

/** "Northbridge University" → "Northbridge" for compact labels. */
export function uniShort(id: string) {
  return uniName(id).replace(/ (University|Institute of Technology|School of Management|Technical University)$/, "").replace(/^University of /, "");
}

const DAY = 86_400_000;
/** Whole days from `today` (YYYY-MM-DD) to `date`; negative once passed. */
export function daysUntil(date: string, today: string) {
  return Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / DAY);
}

/** Today in the student's own timezone, as YYYY-MM-DD. */
export function todayISO(now = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

export type Dated = { university: string; kind: DeadlineKind; date: string; days: number };

/** Every future (or just-missed) date across applications, soonest first. */
export function allDates(apps: Application[], today: string): Dated[] {
  return apps
    .flatMap((a) => (Object.entries(a.dates) as [DeadlineKind, string][]).map(([kind, date]) => ({ university: a.university, kind, date, days: daysUntil(date, today) })))
    .filter((d) => d.days >= -7)
    .sort((x, y) => x.days - y.days);
}

const isDone = (a: Application) => appStatuses.find((s) => s.id === a.status)!.done;

/** The deadline that matters most for one application right now. */
function nearest(a: Application, today: string) {
  const relevant: DeadlineKind[] = isDone(a) ? ["interview", "deposit"] : ["application", "documents", "scholarship"];
  const days = relevant.map((k) => a.dates[k]).filter((d): d is string => !!d).map((d) => daysUntil(d, today)).filter((n) => n >= -7);
  return days.length ? Math.min(...days) : null;
}

const TASK_ORDER = appTasks.map((t) => t.id);
const firstPending = (a: Application) => [...a.pending].sort((x, y) => TASK_ORDER.indexOf(x) - TASK_ORDER.indexOf(y))[0] ?? null;
const taskLabel = (t: AppTask) => appTasks.find((x) => x.id === t)!;

/**
 * One line per application for the dashboard: "Submitted", "SOP pending",
 * "Documents complete", "Deadline in 12 days".
 */
export function headline(a: Application, today: string): { text: string; tone: "faint" | "sky" | "royal" | "coral" | "ivory"; urgent: boolean } {
  const st = appStatuses.find((s) => s.id === a.status)!;
  const d = nearest(a, today);
  const urgent = d !== null && d <= 14;
  if (st.done) return { text: st.label, tone: st.tone, urgent: a.status === "interview" && urgent };
  const task = firstPending(a);
  if (task) {
    const t = taskLabel(task);
    return { text: applyingCopy.dashboard.pending(t.short.charAt(0).toUpperCase() + t.short.slice(1)), tone: "coral", urgent };
  }
  if (d !== null && d <= 30) return { text: applyingCopy.dashboard.deadlineIn(d), tone: "coral", urgent };
  if (a.status === "inProgress") return { text: applyingCopy.dashboard.complete, tone: "sky", urgent };
  return { text: st.label, tone: st.tone, urgent };
}

export const submittedCount = (apps: Application[]) => apps.filter(isDone).length;

export type NextAction = {
  kind: "docs" | "task" | "submit" | "start" | "interview" | "wait" | "decision";
  label: string;
  university?: string;
  task?: AppTask;
  days: number | null;
  why: string;
};

/**
 * The one thing to do next. Unsubmitted applications compete on how soon
 * their deadline is; within one, the most important pending item goes first.
 * Once everything is in, the action becomes interview prep, waiting, or
 * acting on a decision.
 */
export function nextAction(apps: Application[], today: string): NextAction | null {
  if (!apps.length) return null;
  const urgency = (a: Application) => nearest(a, today) ?? 999;
  const when = (n: number | null) => (n === null || n === 999 ? "" : ` — ${applyingCopy.dashboard.deadlineIn(n).toLowerCase()}`);

  // a university asking for more documents is blocking a decision: always first
  const requested = apps.filter((a) => a.status === "docsRequested").sort((x, y) => urgency(x) - urgency(y))[0];
  if (requested) {
    const name = uniShort(requested.university);
    return { kind: "docs", university: requested.university, days: nearest(requested, today), label: `Send ${name} the documents they asked for`, why: `${name} has asked for more documents. Your application can’t move to a decision until they arrive.` };
  }

  const interviews = apps.filter((a) => a.status === "interview").sort((x, y) => urgency(x) - urgency(y));
  const open = apps.filter((a) => !isDone(a)).sort((x, y) => urgency(x) - urgency(y) || (x.status === "inProgress" ? -1 : 1));

  const firstOpen = open[0];
  const firstInterview = interviews[0];
  // an interview within a week beats paperwork elsewhere
  if (firstInterview && (!firstOpen || urgency(firstInterview) <= Math.min(7, urgency(firstOpen)))) {
    const d = nearest(firstInterview, today);
    return { kind: "interview", university: firstInterview.university, days: d, label: `Prepare for ${uniShort(firstInterview.university)} interview`, why: `Your ${uniShort(firstInterview.university)} interview is the most time-sensitive thing on your list${when(d)}.` };
  }
  if (firstOpen) {
    const d = urgency(firstOpen) === 999 ? null : urgency(firstOpen);
    const name = uniShort(firstOpen.university);
    const task = firstPending(firstOpen);
    if (task) {
      const t = taskLabel(task);
      return { kind: "task", university: firstOpen.university, task, days: d, label: `${t.verb} ${name} ${t.short}`, why: `${name} has the nearest deadline among your unfinished applications${when(d)}, and this is its most important pending item.` };
    }
    if (firstOpen.status === "inProgress") {
      return { kind: "submit", university: firstOpen.university, days: d, label: `Submit ${name} application`, why: `Everything for ${name} is marked complete${when(d)}. Submitting is the last step.` };
    }
    return { kind: "start", university: firstOpen.university, days: d, label: `Start ${name} application`, why: `${name} hasn’t been started yet${when(d)}.` };
  }
  if (apps.some((a) => a.status === "decision")) {
    return { kind: "decision", days: null, label: "Review your decision", why: "You have a decision in. Read the conditions and deadlines before you plan the move." };
  }
  return { kind: "wait", days: null, label: "Wait for decisions", why: "Every application is in. Keep an eye on email and each portal while you wait." };
}

/** What "Mark as done" changes for an action. */
export function completeAction(apps: Application[], a: NextAction): Application[] {
  return apps.map((app) => {
    if (app.university !== a.university) return app;
    switch (a.kind) {
      case "task": return { ...app, pending: app.pending.filter((t) => t !== a.task), status: app.status === "notStarted" ? "inProgress" : app.status };
      case "submit": return { ...app, status: "submitted" };
      case "start": return { ...app, status: "inProgress" };
      case "interview": return { ...app, status: "awaiting" };
      case "docs": return { ...app, status: "awaiting" };
      default: return app;
    }
  });
}

export const deadlineLabel = (k: DeadlineKind) => deadlineKinds.find((d) => d.id === k)!.short;

/** One line for the lead form's `context`. */
export function applicationsSummary(apps: Application[], today: string) {
  return `Applications: ${apps.map((a) => `${uniShort(a.university)} (${headline(a, today).text})`).join(", ") || "none yet"}`.slice(0, 200);
}
