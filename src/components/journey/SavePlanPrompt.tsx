"use client";
import { X } from "lucide-react";
import { useState } from "react";
import { leadPrompt } from "@/data/journey/home";
import { profileMeta, track } from "@/lib/journey/analytics";
import { journey, useJourney } from "@/lib/journey/store";
import { LeadForm } from "../ui/LeadForm";

/**
 * "Save your Global Scholar plan": the lead capture, offered only after the
 * student has had value (a personalised result, a first save) and never as a
 * gate. Isolated so a CRM can be wired in behind `LeadForm` later.
 */
export function SavePlanPrompt({ context, source }: { context: string; source: string }) {
  const { profile } = useJourney();
  const [dismissed, setDismissed] = useState(false);
  // stay up after saving so the form's thank-you is seen; hide on later visits
  const [justSaved, setJustSaved] = useState(false);
  if ((profile.leadCaptured && !justSaved) || dismissed) return null;

  return (
    <aside aria-labelledby="save-plan" className="relative rounded-3xl bg-surface/90 p-6 shadow-lift ring-1 ring-white/10 backdrop-blur-sm">
      <button type="button" onClick={() => setDismissed(true)} aria-label={leadPrompt.dismiss}
        className="absolute right-3 top-3 grid size-11 place-items-center rounded-full text-ivory/70 hover:bg-white/5 hover:text-ivory">
        <X aria-hidden className="size-4" />
      </button>
      <h2 id="save-plan" className="pr-10 font-serif text-2xl text-ivory">{leadPrompt.title}</h2>
      <p className="mt-1 mb-5 text-sm text-mist">{leadPrompt.text}</p>
      <LeadForm compact context={context} onSuccess={() => {
        setJustSaved(true);
        journey.patch({ leadCaptured: true });
        track("lead_created", { ...profileMeta(journey.get().profile), source });
      }} />
    </aside>
  );
}
