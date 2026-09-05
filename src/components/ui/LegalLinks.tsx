"use client";
import { useState } from "react";
import { LEGAL_IS_PLACEHOLDER, legalDocs, type LegalDoc } from "@/data/legal";
import { Modal } from "./Modal";

/**
 * Footer legal links. This is a single-page site, so each document opens in the
 * shared modal rather than on its own route — that keeps the anchor-based
 * navigation and Lenis scrolling intact.
 */
export function LegalLinks() {
  const [open, setOpen] = useState<LegalDoc | null>(null);

  return (
    <>
      <ul className="flex gap-5">
        {legalDocs.map((doc) => (
          <li key={doc.id}>
            <button
              type="button"
              onClick={() => setOpen(doc)}
              className="inline-block cursor-pointer py-1.5 hover:text-royal-lit"
            >
              {doc.label}
            </button>
          </li>
        ))}
      </ul>

      <Modal open={!!open} onClose={() => setOpen(null)} title={open?.title ?? ""}>
        {open && (
          <div className="space-y-5">
            {LEGAL_IS_PLACEHOLDER && (
              <p className="rounded-xl bg-coral/10 px-4 py-3 text-xs leading-relaxed text-coral ring-1 ring-inset ring-coral/30">
                Placeholder text for the demo build. It has not been reviewed by a legal adviser
                and must be replaced before this site is used with real enquiries.
              </p>
            )}
            <p className="text-xs uppercase tracking-[0.2em] text-faint">Last updated: {open.updated}</p>
            {open.sections.map((s) => (
              <section key={s.heading}>
                <h4 className="font-serif text-lg text-ivory">{s.heading}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-mist">{s.body}</p>
              </section>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}
