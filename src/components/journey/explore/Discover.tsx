"use client";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { discoverCopy as copy } from "@/data/journey/home";
import { profileMeta, track } from "@/lib/journey/analytics";
import { discover, type DiscoverGroup } from "@/lib/journey/shortlist";
import { journey } from "@/lib/journey/store";
import type { UserProfile } from "@/lib/journey/types";
import { Button } from "../../ui/Button";
import { UniversityCard } from "../shortlist/UniversityCard";

const TAG: Record<DiscoverGroup, string> = {
  strong: "bg-royal/30 text-royal-lit ring-royal-lit/40",
  worth: "bg-sky/15 text-sky ring-sky/30",
  value: "bg-coral/20 text-coral ring-coral/40",
};
const SHORTLIST_AFTER = 3;
const meta = (extra = {}) => ({ ...profileMeta(journey.get().profile, "exploring"), ...extra });

/**
 * Universities worth exploring, from the exploring answers alone. Every save
 * is kept; after a few, the student is invited (never pushed) to turn them
 * into a shortlist.
 */
export function Discover({ profile }: { profile: UserProfile }) {
  const router = useRouter();
  const list = discover(profile);
  const saved = profile.savedUniversities;

  const toggle = (id: string) => {
    const on = saved.includes(id);
    journey.patch({ savedUniversities: on ? saved.filter((x) => x !== id) : [...saved, id] });
    if (!on) track("university_saved", meta({ university: id, sourcePage: "exploring-result" }));
  };

  const buildShortlist = () => {
    const ids = journey.get().profile.savedUniversities;
    journey.patch({ shortlist: ids, ownUniversities: ids, shortlistMode: "own" });
    journey.setStage("shortlisting");
    track("journey_selected", meta({ journeyStage: "shortlisting", source: "saved-prompt" }));
    // ambitious / target / safe needs an academic profile; ask for it first if it's missing
    const p = journey.get().profile;
    router.push(`/journey/shortlisting?step=${p.qualification && p.academicScore ? "reveal" : "fit"}`);
  };

  if (!list.length) return null;

  return (
    <section id="saved" aria-labelledby="discover-title" className="scroll-mt-28">
      <h2 id="discover-title" className="font-serif text-[clamp(1.5rem,3.5vw,2.25rem)] text-ivory">{copy.title}</h2>
      <p className="mt-1 text-sm text-ivory/75">{copy.hint}</p>

      {saved.length >= SHORTLIST_AFTER && (
        <div role="status" className="mt-5 flex flex-col gap-3 rounded-2xl bg-ivory p-5 text-ink shadow-lift sm:flex-row sm:items-center sm:justify-between">
          <p className="font-serif text-lg leading-snug">{copy.prompt}</p>
          <Button type="button" variant="coral" arrow onClick={buildShortlist} className="shrink-0">{copy.promptCta}</Button>
        </div>
      )}

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map(({ group, e }) => {
          const on = saved.includes(e.uni.id);
          return (
            <li key={e.uni.id} className="flex">
              <UniversityCard e={e} className="w-full" tag={{ label: copy.groups[group], className: TAG[group] }} actions={
                <button type="button" aria-pressed={on} onClick={() => toggle(e.uni.id)}
                  className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold ring-1 ring-inset ${on ? "bg-coral text-void ring-coral" : "text-ivory ring-white/25 hover:ring-white/50"}`}>
                  <Star aria-hidden className={`size-3.5 ${on ? "fill-current" : ""}`} /> {on ? copy.saved : copy.save}
                </button>
              } />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
