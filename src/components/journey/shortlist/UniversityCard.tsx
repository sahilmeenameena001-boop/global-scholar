import { Award, MapPin } from "lucide-react";
import { bucketCopy, shortlistCopy } from "@/data/journey/config";
import { destinationById } from "@/data/journey/destinations";
import type { Evaluated } from "@/lib/journey/shortlist";
import type { Bucket } from "@/lib/journey/types";

const c = shortlistCopy.card;

export const BUCKET_STYLE: Record<Bucket, string> = {
  ambitious: "bg-coral/20 text-coral ring-coral/40",
  target: "bg-royal/25 text-royal-lit ring-royal-lit/40",
  safe: "bg-sky/15 text-sky ring-sky/30",
};

/**
 * One university on the shortlist: where it is, how it fits and why. The
 * figures are indicative; the card says so through the shortlist disclaimer.
 * `actions` slots in the controls of whichever step is showing it.
 */
export function UniversityCard({ e, actions, tag, className = "" }: {
  e: Evaluated;
  actions?: React.ReactNode;
  /** Replaces the ambitious/target/safe pill, e.g. "Strong match" before there's an academic profile. */
  tag?: { label: string; className: string };
  className?: string;
}) {
  const u = e.uni;
  return (
    <article className={`flex flex-col rounded-2xl bg-surface/90 p-4 shadow-card ring-1 ring-white/10 backdrop-blur-sm ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-serif text-lg leading-tight text-ivory">{u.name}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-mist">
            <MapPin aria-hidden className="size-3" /> {u.city}, {destinationById[u.country].label}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <span className="block font-serif text-2xl leading-none text-ivory">{e.fit}<span className="text-sm text-mist">%</span></span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">{c.fit}</span>
        </div>
      </div>

      <span className={`mt-3 inline-flex w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${tag?.className ?? BUCKET_STYLE[e.bucket]}`}>
        {tag?.label ?? bucketCopy[e.bucket].label}
      </span>

      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <div><dt className="text-faint">{c.course}</dt><dd className="text-ivory/90">{e.course}</dd></div>
        <div><dt className="text-faint">{c.tuition}</dt><dd className="text-ivory/90">{u.tuition}</dd></div>
        <div><dt className="text-faint">{c.deadline}</dt><dd className="text-ivory/90">{e.deadline}</dd></div>
        <div>
          <dt className="text-faint">{c.scholarship}</dt>
          <dd className="flex items-center gap-1 text-ivory/90">
            <Award aria-hidden className={`size-3 ${u.scholarship === "strong" ? "text-coral" : "text-faint"}`} />
            {c.scholarshipLevel[u.scholarship]}
          </dd>
        </div>
      </dl>

      <p className="mt-3 text-xs leading-relaxed text-mist"><span className="font-semibold text-ivory/80">{c.why}: </span>{e.reason}</p>

      {actions && <div className="mt-auto flex flex-wrap gap-2 pt-4">{actions}</div>}
    </article>
  );
}
