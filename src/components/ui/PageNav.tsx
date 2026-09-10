import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { navLinks } from "@/data/nav";

const SEQUENCE = [{ href: "/", label: "Home" }, ...navLinks.map((l) => ({ href: l.href, label: l.label }))];

/**
 * End-of-page continuation. The site reads as one sequence, so every page hands
 * the reader to the next chapter rather than dead-ending on a footer.
 */
export function PageNav({ current }: { current: string }) {
  const i = SEQUENCE.findIndex((s) => s.href === current);
  const prev = i > 0 ? SEQUENCE[i - 1] : null;
  const next = i >= 0 && i < SEQUENCE.length - 1 ? SEQUENCE[i + 1] : null;

  return (
    <nav aria-label="Chapter navigation" className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
      <div className="grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-2">
        {prev ? (
          <Link href={prev.href} className="group flex min-h-16 flex-col justify-center rounded-2xl border border-white/10 bg-surface px-6 py-4 transition-colors hover:border-royal/50">
            <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-faint">
              <ArrowLeft aria-hidden className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" /> Previous
            </span>
            <span className="mt-1 font-serif text-lg text-ivory">{prev.label}</span>
          </Link>
        ) : <span aria-hidden />}
        {next && (
          <Link href={next.href} className="group flex min-h-16 flex-col justify-center rounded-2xl border border-white/10 bg-surface px-6 py-4 text-right transition-colors hover:border-royal/50 sm:col-start-2">
            <span className="flex items-center justify-end gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-faint">
              Next <ArrowRight aria-hidden className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </span>
            <span className="mt-1 font-serif text-lg text-ivory">{next.label}</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
