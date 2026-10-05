"use client";
import { Check, Plus, Search } from "lucide-react";
import { useId, useState } from "react";
import { customId } from "@/lib/journey/applying";
import { searchUniversities } from "@/lib/journey/shortlist";

type Copy = { label: string; placeholder: string; addCustom: (name: string) => string; added: string };

/**
 * Search the university catalogue, or add any university by name. Shared by
 * every step that asks "which universities?" (applications, offers). Catalogue
 * matches toggle; a typed name the catalogue doesn't have becomes `custom:<name>`.
 */
export function UniversitySearchAdd({ chosen, onToggle, copy }: { chosen: string[]; onToggle: (id: string) => void; copy: Copy }) {
  const [query, setQuery] = useState("");
  const id = useId();
  const q = query.trim();
  const results = q ? searchUniversities(q).slice(0, 6) : [];
  const exact = results.some((u) => u.name.toLowerCase() === q.toLowerCase());
  const addCustom = () => { onToggle(customId(q)); setQuery(""); };

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-ivory/85">{copy.label}</label>
      <div className="relative mt-1.5 max-w-sm">
        <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint" />
        <input id={id} type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={copy.placeholder}
          onKeyDown={(e) => { if (e.key === "Enter" && q && !exact && !results.length) addCustom(); }}
          className="min-h-12 w-full rounded-xl bg-void/50 pl-10 pr-4 text-sm text-ivory ring-1 ring-inset ring-white/20 backdrop-blur-sm placeholder:text-faint focus:ring-2 focus:ring-royal-lit" />
      </div>
      {q && (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {results.map((u) => {
            const on = chosen.includes(u.id);
            return (
              <li key={u.id}>
                <button type="button" aria-pressed={on} onClick={() => onToggle(u.id)}
                  className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2 text-left text-sm ring-1 ring-inset backdrop-blur-sm ${on ? "bg-royal/30 text-ivory ring-royal-lit/60" : "bg-void/45 text-ivory/90 ring-white/15 hover:ring-white/35"}`}>
                  <span className="min-w-0"><span className="block truncate font-semibold">{u.name}</span><span className="block text-xs text-ivory/60">{u.city}</span></span>
                  {on ? <span className="flex items-center gap-1 text-xs font-semibold"><Check aria-hidden className="size-3.5" /> {copy.added}</span> : <Plus aria-hidden className="size-4 shrink-0" />}
                </button>
              </li>
            );
          })}
          {!exact && (
            <li>
              <button type="button" onClick={addCustom}
                className="flex min-h-12 w-full items-center gap-2 rounded-xl border border-dashed border-white/30 bg-void/45 px-3.5 py-2 text-left text-sm font-semibold text-ivory hover:border-white/50">
                <Plus aria-hidden className="size-4 shrink-0" /> {copy.addCustom(q)}
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
