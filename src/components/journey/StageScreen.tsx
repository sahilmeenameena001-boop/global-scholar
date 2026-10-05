import { getImageProps } from "next/image";
import { stageById } from "@/data/journey/config";
import { backgroundDir, type StageBackground } from "@/lib/journey/backgrounds";
import type { Stage } from "@/lib/journey/types";

/** The drawn backdrop each stage shows until a photo is dropped into its folder. */
const FALLBACK: Record<Stage, string> = {
  exploring: "radial-gradient(1100px 700px at 75% 35%, rgba(240,107,93,0.28), transparent 65%), var(--color-matte)",
  shortlisting: "radial-gradient(1100px 700px at 75% 35%, rgba(91,134,255,0.35), transparent 65%), var(--color-navy)",
  applying: "radial-gradient(1100px 700px at 75% 35%, rgba(240,107,93,0.30), transparent 65%), var(--color-surface)",
  offer: "radial-gradient(1100px 700px at 75% 35%, rgba(221,235,255,0.22), transparent 65%), var(--color-raised)",
};

/** A stage's photo, with an optional phone crop, served through the image optimiser. */
function Photo({ bg }: { bg: StageBackground }) {
  const common = { alt: "", fill: true, sizes: "100vw", priority: true } as const;
  const { props: { srcSet: desktop } } = getImageProps({ ...common, src: bg.desktop });
  const { props: { srcSet: mobile, ...rest } } = getImageProps({ ...common, src: bg.mobile ?? bg.desktop });
  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={desktop} />
      <source media="(max-width: 767px)" srcSet={mobile} />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- decorative backdrop; alt="" comes from `rest` */}
      <img {...rest} className="object-cover" />
    </picture>
  );
}

/**
 * One full-screen view per journey stage. The backdrop is the stage's own
 * photo (see `lib/journey/backgrounds.ts`) under a scrim that keeps text
 * legible, or a drawn gradient until a photo is added. `children` is the
 * stage's content, laid out by the stage itself.
 */
export function StageScreen({ stage, background, children }: { stage: Stage; background: StageBackground | null; children: React.ReactNode }) {
  const cfg = stageById[stage];
  return (
    <section aria-labelledby="stage-title" className="relative isolate min-h-[100svh] overflow-hidden" style={background ? undefined : { background: FALLBACK[stage] }}>
      <h1 id="stage-title" className="sr-only">{cfg.cta}</h1>

      <div aria-hidden className="absolute inset-0 -z-10">
        {background && <Photo bg={background} />}
        {/* scrim: heavier on the reading side, lighter where the picture can breathe */}
        <div className="absolute inset-0 bg-void/55 lg:bg-transparent lg:bg-gradient-to-r lg:from-void/85 lg:via-void/55 lg:to-void/15" />
        <div className="grain absolute inset-0" />
      </div>

      {!background && process.env.NODE_ENV !== "production" && (
        <p className="absolute bottom-3 right-4 z-10 rounded-md bg-void/60 px-2.5 py-1 font-mono text-[11px] text-mist">
          {cfg.arc} background slot: public/{backgroundDir(stage)}/background.webp
        </p>
      )}

      <div className="mx-auto grid min-h-[100svh] max-w-7xl content-center gap-8 px-4 pb-16 pt-24 sm:px-8 lg:grid-cols-12 lg:items-center lg:gap-12 lg:pt-28">
        {children}
      </div>
    </section>
  );
}
