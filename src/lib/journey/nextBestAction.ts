import { exploringCopy } from "@/data/journey/config";
import { nextAction as nextApplicationAction } from "./applying";
import { exploringDone, firstOpenStep, lifecycleOf } from "./lifecycle";
import { nextMoveAction } from "./offer";
import type { LifecycleStage, UserProfile } from "./types";

/**
 * One next best action for wherever the student is. Deterministic rules, no
 * AI: the stage decides which rule set applies, and within it the order is
 * urgent deadline → blocking task → unfinished application → scholarship
 * date → document preparation → optional polish.
 */

export type Urgency = "low" | "medium" | "high" | "urgent";
export type NextBestAction = {
  title: string;
  description: string;
  actionType: string;
  targetId?: string;
  urgency: Urgency;
  href: string;
  cta: string;
  stage: LifecycleStage;
};

const urgencyFor = (days: number | null): Urgency =>
  days === null ? "medium" : days <= 3 ? "urgent" : days <= 14 ? "high" : days <= 45 ? "medium" : "low";

export function calculateNextBestAction(p: UserProfile, today: string): NextBestAction {
  const stage = lifecycleOf(p, today);
  switch (stage) {
    case "anonymous":
      return { stage, title: "Tell us where you are", description: "Four quick choices and your plan starts to take shape.", actionType: "segment", urgency: "low", href: "/", cta: "Start" };

    case "exploring": {
      if (!exploringDone(p)) {
        return { stage, title: "Finish your starting point", description: "A couple more answers and we can match universities to you.", actionType: "explore", urgency: "medium", href: `/journey/exploring?step=${firstOpenStep("exploring", p)}`, cta: "Continue" };
      }
      if (p.savedUniversities.length >= 3) {
        return { stage, title: "Build your shortlist", description: `You’ve saved ${p.savedUniversities.length} universities. Turn them into an ambitious / target / safe list.`, actionType: "shortlist", urgency: "medium", href: "/journey/shortlisting", cta: "Build my shortlist" };
      }
      return { stage, title: exploringCopy.result.primary, description: "Universities matched to your answers. Save the ones you like.", actionType: "discover", urgency: "low", href: "/journey/exploring?step=result#saved", cta: "Show me" };
    }

    case "shortlisting": {
      if (!p.shortlist.length) {
        return { stage, title: "Build your shortlist", description: "A few quick answers and we’ll sort universities into ambitious, target and safe.", actionType: "shortlist", urgency: "medium", href: `/journey/shortlisting?step=${firstOpenStep("shortlisting", p)}`, cta: "Continue" };
      }
      return { stage, title: "Turn your shortlist into an application plan", description: `${p.shortlist.length} universities on your list. Finalise it and start tracking applications.`, actionType: "finalise", urgency: "medium", href: "/journey/shortlisting?step=finalise", cta: "Finalise my shortlist" };
    }

    case "applying":
    case "waiting": {
      const a = nextApplicationAction(p.applications, today);
      if (!a) return { stage, title: "Add your applications", description: "List where you’re applying and we’ll track what’s pending and when.", actionType: "applications", urgency: "medium", href: "/journey/applying?step=universities", cta: "Add applications" };
      if (a.kind === "decision") return { stage, title: "Record your offer", description: a.why, actionType: "offer", targetId: a.university, urgency: "high", href: "/journey/offer", cta: "Plan my next move" };
      return { stage, title: a.label, description: a.why, actionType: a.kind, targetId: a.university, urgency: a.kind === "wait" ? "low" : urgencyFor(a.days), href: "/journey/applying?step=next", cta: "Continue" };
    }

    case "offer":
    case "departure":
    case "arrival": {
      const m = nextMoveAction(p, today);
      return { stage, title: m.title, description: m.description, actionType: m.step, urgency: m.urgency, href: `/journey/offer?step=${m.step}`, cta: "Continue" };
    }
  }
}
