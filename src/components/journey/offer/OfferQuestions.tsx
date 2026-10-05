"use client";
import { ArrowLeft, Check, Plus, X } from "lucide-react";
import { useId, useState } from "react";
import { shortlistCopy } from "@/data/journey/config";
import { destinationById, destinations } from "@/data/journey/destinations";
import {
  accommodationOptions, accommodationStatuses, commonConditions, commuteOptions, livingCostEstimate, offerCopy as copy, offerSituations,
  sharingOptions, travelChecklist,
} from "@/data/journey/offer";
import { universityById } from "@/data/journey/universities";
import { profileMeta, track } from "@/lib/journey/analytics";
import { daysUntil, uniName } from "@/lib/journey/applying";
import { funding, money, newOfferId, offerCity, offerCountry, selectedOffer, visaItems, visaProgress } from "@/lib/journey/offer";
import { evaluate } from "@/lib/journey/shortlist";
import { journey } from "@/lib/journey/store";
import type { Departure, DestinationId, Offer, OfferStep, UserProfile, VisaItemStatus } from "@/lib/journey/types";
import { Button } from "../../ui/Button";
import { Choice } from "../Choice";
import { UniversitySearchAdd } from "../UniversitySearchAdd";

const ORDER: OfferStep[] = ["situation", "offers", "acceptance", "conditions", "visa", "funding", "accommodation", "travel", "move"];
const meta = (extra = {}) => ({ ...profileMeta(journey.get().profile, "offer"), ...extra });
const input = "min-h-11 w-full rounded-lg bg-void/50 px-3 text-sm text-ivory ring-1 ring-inset ring-white/20 [color-scheme:dark] placeholder:text-faint focus:ring-2 focus:ring-royal-lit";
const card = "rounded-2xl bg-void/40 p-4 ring-1 ring-white/10 backdrop-blur-sm";

function patchOffer(id: string, change: (o: Offer) => Offer) {
  journey.patch({ offers: journey.get().profile.offers.map((o) => (o.id === id ? change(o) : o)) });
}
function patchDeparture(change: (d: Departure) => Departure) {
  journey.patch({ departure: change(journey.get().profile.departure) });
}
const toNumber = (v: string) => (v.trim() === "" ? undefined : Math.max(0, Number(v.replace(/[^\d.]/g, "")) || 0));

type Props = {
  profile: UserProfile;
  step: Exclude<OfferStep, "move">;
  today: string;
  onStep: (s: OfferStep) => void;
  onCounsellor: (source: string) => void;
  focusRef: (el: HTMLHeadingElement | null) => void;
};

/**
 * Offer → departure, one step at a time: where you are with offers, the
 * offers themselves, choosing and accepting, conditions, then the move —
 * visa, money, a place to live, the trip. Saved as the student goes.
 */
export function OfferQuestions({ profile, step, today, onStep, onCounsellor, focusRef }: Props) {
  const [notice, setNotice] = useState("");
  const promptId = useId();
  const go = (s: OfferStep) => { setNotice(""); onStep(s); };
  const next = () => go(ORDER[ORDER.indexOf(step) + 1]);
  const prev = ORDER[ORDER.indexOf(step) - 1];
  const sel = selectedOffer(profile);

  const prompt = (text: string, hint?: string) => (
    <>
      <h2 id="journey-title" ref={focusRef} tabIndex={-1} className="text-[clamp(1.75rem,5vw,3rem)] leading-[1.05] text-ivory outline-none">
        <span id={promptId}>{text}</span>
      </h2>
      {hint && <p className="mt-1.5 font-hand text-xl leading-tight text-sky/80">{hint}</p>}
    </>
  );

  const toggleOfferFor = (university: string) => {
    const offers = journey.get().profile.offers;
    const existing = offers.find((o) => o.university === university);
    if (existing) {
      journey.patch({ offers: offers.filter((o) => o !== existing), selectedOfferId: journey.get().profile.selectedOfferId === existing.id ? null : journey.get().profile.selectedOfferId });
      return;
    }
    const o: Offer = {
      id: newOfferId(), university, country: universityById[university]?.country ?? null,
      type: journey.get().profile.offerSituation === "conditional" ? "conditional" : "unconditional",
      depositPaid: false, conditions: [], accepted: false,
    };
    journey.patch({ offers: [...offers, o] });
    // recording an offer is the student saying they're at this stage
    if (journey.get().profile.journeyStage !== "offer") journey.setStage("offer");
    track("offer_added", meta({ university }));
  };

  /* ── continue rules ── */
  const canContinue = (): string | null => {
    if (step === "situation" && !profile.offerSituation) return shortlistCopy.pickOne;
    if (step === "offers" && !profile.offers.length) return copy.offers.needOne;
    return null;
  };

  return (
    <div>
      {step === "situation" && <>
        {prompt(copy.situation.prompt, copy.situation.hint)}
        <div role="group" aria-labelledby={promptId} className="mt-4 flex flex-wrap gap-2">
          {offerSituations.map((o, i) => (
            <Choice key={o.id} label={o.label} i={i} icon={o.icon} on={profile.offerSituation === o.id}
              onPick={() => { journey.patch({ offerSituation: o.id }); track("journey_answer", meta({ question: "offerSituation", answer: o.id })); }} />
          ))}
        </div>
      </>}

      {step === "offers" && <>
        {prompt(copy.offers.prompt, copy.offers.hint)}
        <div className="mt-5 space-y-6">
          {profile.applications.length > 0 && (
            <div>
              <p className="text-sm font-medium text-ivory/85">{copy.offers.fromApplications}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {[...profile.applications].sort((a) => (a.status === "decision" ? -1 : 1)).map((a, i) => (
                  <Choice key={a.university} label={uniName(a.university)} i={i} icon="graduation"
                    on={profile.offers.some((o) => o.university === a.university)} onPick={() => toggleOfferFor(a.university)} />
                ))}
              </div>
            </div>
          )}
          <UniversitySearchAdd chosen={profile.offers.map((o) => o.university)} onToggle={toggleOfferFor}
            copy={{ label: copy.offers.search, placeholder: copy.offers.searchPlaceholder, addCustom: copy.offers.addCustom, added: shortlistCopy.existing.added }} />
          {profile.offers.map((o) => <OfferDetails key={o.id} offer={o} onRemove={() => toggleOfferFor(o.university)} />)}
        </div>
      </>}

      {step === "acceptance" && <Acceptance profile={profile} sel={sel} focusRef={focusRef} onConfirm={() => {
        journey.patch({ departureConfirmed: true });
        journey.setStage("offer");
        track("journey_answer", meta({ question: "departureConfirmed", answer: true }));
        go(sel?.type === "conditional" ? "conditions" : "visa");
      }} />}

      {step === "conditions" && <>
        {prompt(copy.conditions.prompt, copy.conditions.hint)}
        {sel ? <Conditions offer={sel} /> : <p className="mt-4 text-ivory/80">{copy.visa.pickOffer}</p>}
      </>}

      {step === "visa" && <>
        {prompt(copy.visa.prompt, copy.visa.hint)}
        <Visa profile={profile} />
      </>}

      {step === "funding" && <>
        {prompt(copy.funding.prompt, copy.funding.hint)}
        <Funding profile={profile} onCounsellor={onCounsellor} />
      </>}

      {step === "accommodation" && <>
        {prompt(copy.accommodation.prompt, copy.accommodation.hint)}
        <Accommodation profile={profile} />
      </>}

      {step === "travel" && <>
        {prompt(copy.travel.prompt, copy.travel.hint)}
        <Travel profile={profile} today={today} />
      </>}

      <p role="status" className="mt-3 min-h-5 text-sm font-medium text-sky">{notice}</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        {step !== "acceptance" && (
          <Button type="button" arrow onClick={() => { const err = canContinue(); if (err) setNotice(err); else next(); }}>{copy.next}</Button>
        )}
        {prev && (
          <button type="button" onClick={() => go(prev)} className="inline-flex min-h-11 items-center gap-2 pr-3 text-sm text-ivory/75 hover:text-ivory">
            <ArrowLeft aria-hidden className="size-4" /> {copy.back}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Offers ─────────────────────────────────────────────────────────── */

function OfferDetails({ offer, onRemove }: { offer: Offer; onRemove: () => void }) {
  const c = copy.offers;
  const country = offerCountry(offer);
  const field = (id: string, label: string, value: number | undefined, set: (v: number | undefined) => void) => (
    <div>
      <label htmlFor={`${offer.id}-${id}`} className="text-xs font-medium text-ivory/80">{label}{country ? ` (${destinationById[country].label})` : ""}</label>
      <input id={`${offer.id}-${id}`} inputMode="decimal" value={value ?? ""} onChange={(e) => set(toNumber(e.target.value))} className={`mt-1 ${input}`} />
    </div>
  );
  return (
    <section aria-label={uniName(offer.university)} className={card}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-lg text-ivory">{uniName(offer.university)}</h3>
        <button type="button" onClick={onRemove} aria-label={`${c.remove}: ${uniName(offer.university)}`} className="grid size-11 shrink-0 place-items-center rounded-full text-ivory/70 hover:bg-white/5 hover:text-coral">
          <X aria-hidden className="size-4" />
        </button>
      </div>
      <p className="mt-2 text-xs font-medium text-ivory/80">{c.type}</p>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {(["conditional", "unconditional"] as const).map((t, i) => (
          <Choice key={t} label={t === "conditional" ? c.conditional : c.unconditional} i={i} on={offer.type === t} onPick={() => patchOffer(offer.id, (o) => ({ ...o, type: t }))} />
        ))}
      </div>
      {!universityById[offer.university] && (
        <>
          <p className="mt-3 text-xs font-medium text-ivory/80">{c.country}</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {destinations.map((d, i) => (
              <Choice key={d.id} label={d.label} i={i} icon="pin" on={offer.country === d.id} onPick={() => patchOffer(offer.id, (o) => ({ ...o, country: d.id as DestinationId }))} />
            ))}
          </div>
        </>
      )}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {field("tuition", c.tuition, offer.tuition, (v) => patchOffer(offer.id, (o) => ({ ...o, tuition: v })))}
        {field("scholarship", c.scholarship, offer.scholarshipAmount, (v) => patchOffer(offer.id, (o) => ({ ...o, scholarshipAmount: v })))}
        {field("deposit", c.deposit, offer.depositAmount, (v) => patchOffer(offer.id, (o) => ({ ...o, depositAmount: v })))}
        <div>
          <label htmlFor={`${offer.id}-dd`} className="text-xs font-medium text-ivory/80">{c.depositDeadline}</label>
          <input id={`${offer.id}-dd`} type="date" value={offer.depositDeadline ?? ""} onChange={(e) => patchOffer(offer.id, (o) => ({ ...o, depositDeadline: e.target.value || undefined }))} className={`mt-1 ${input}`} />
        </div>
      </div>
    </section>
  );
}

/* ── Acceptance & comparison ────────────────────────────────────────── */

function Acceptance({ profile, sel, onConfirm, focusRef }: { profile: UserProfile; sel: Offer | null; onConfirm: () => void; focusRef: Props["focusRef"] }) {
  const a = copy.acceptance;
  const multiple = profile.offers.length > 1;
  const value = (o: Offer, dim: keyof typeof a.dims) => {
    const u = universityById[o.university];
    const country = offerCountry(o);
    const e = u ? evaluate(u, profile) : null;
    switch (dim) {
      case "course": return e ? `${e.fit}% indicative` : "—";
      case "reputation": return u ? `${u.rankBand} (illustrative)` : "—";
      case "career": return u?.careerOutcome ?? "—";
      case "tuition": return o.tuition !== undefined ? money(o.tuition, country) : u?.tuition ?? "—";
      case "scholarship": return o.scholarshipAmount !== undefined ? money(o.scholarshipAmount, country) : u ? shortlistCopy.card.scholarshipLevel[u.scholarship] : "—";
      case "living": return country ? `~${money(livingCostEstimate[country], country)}/yr` : "—";
      case "location": return `${offerCity(o)}${country ? `, ${destinationById[country].label}` : ""}`;
      case "postStudy": return country ? destinationById[country].work : "—";
      case "priorities": return e?.reason ?? "—";
    }
  };

  return (
    <>
      <h2 id="journey-title" ref={focusRef} tabIndex={-1} className="text-[clamp(1.75rem,5vw,3rem)] leading-[1.05] text-ivory outline-none">
        {multiple ? a.prompt : a.promptOne}
      </h2>
      {multiple && <p className="mt-1.5 font-hand text-xl leading-tight text-sky/80">{a.compareHint}</p>}

      {multiple && (
        <div tabIndex={0} role="region" aria-label={a.prompt} data-lenis-prevent className="mt-5 overflow-x-auto rounded-2xl ring-1 ring-white/10">
          <table className="w-full min-w-[36rem] border-collapse bg-surface/90 text-left text-sm backdrop-blur-sm">
            <thead>
              <tr>
                <th scope="col" className="sticky left-0 bg-surface p-3"><span className="sr-only">Dimension</span></th>
                {profile.offers.map((o) => (
                  <th key={o.id} scope="col" className="p-3 align-bottom">
                    <span className="block font-serif text-base text-ivory">{uniName(o.university)}</span>
                    <button type="button" aria-pressed={sel?.id === o.id}
                      onClick={() => { journey.patch({ selectedOfferId: o.id }); track("offer_selected", meta({ university: o.university })); }}
                      className={`mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-xs font-semibold ring-1 ring-inset ${sel?.id === o.id ? "bg-coral text-void ring-coral" : "text-ivory ring-white/25 hover:ring-white/50"}`}>
                      {sel?.id === o.id ? <><Check aria-hidden className="size-3.5" /> {a.chosen}</> : a.choose}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(Object.keys(a.dims) as (keyof typeof a.dims)[]).map((dim) => (
                <tr key={dim} className="border-t border-white/10">
                  <th scope="row" className="sticky left-0 bg-surface p-3 text-xs font-semibold uppercase tracking-[0.12em] text-faint">{a.dims[dim]}</th>
                  {profile.offers.map((o) => <td key={o.id} className="p-3 text-ivory/90">{value(o, dim)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sel && (
        <div className={`mt-5 ${card}`}>
          <h3 className="font-serif text-lg text-ivory">{uniName(sel.university)}</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <Choice label={a.accepted} i={0} on={sel.accepted} onPick={() => patchOffer(sel.id, (o) => ({ ...o, accepted: !o.accepted }))} />
            <Choice label={a.deposit} i={1} on={sel.depositPaid} onPick={() => patchOffer(sel.id, (o) => ({ ...o, depositPaid: !o.depositPaid }))} />
          </div>
          <p className="mt-4 text-xs text-ivory/65">{a.confirmHint}</p>
          <Button type="button" variant="coral" arrow className="mt-3" disabled={!sel.accepted} onClick={onConfirm}>{a.confirm}</Button>
        </div>
      )}
    </>
  );
}

/* ── Conditions ─────────────────────────────────────────────────────── */

function Conditions({ offer }: { offer: Offer }) {
  const c = copy.conditions;
  const [custom, setCustom] = useState("");
  const id = useId();
  if (offer.type === "unconditional") return <p className="mt-4 text-ivory/85">{c.none}</p>;
  const has = (cid: string) => offer.conditions.some((x) => x.id === cid);
  const toggle = (cid: string, label: string) => patchOffer(offer.id, (o) => ({
    ...o, conditions: has(cid) ? o.conditions.filter((x) => x.id !== cid) : [...o.conditions, { id: cid, label, complete: false }],
  }));
  return (
    <div className="mt-5 space-y-5">
      <div className="flex flex-wrap gap-2">
        {commonConditions.map((x, i) => <Choice key={x.id} label={x.label} i={i} icon="pin" on={has(x.id)} onPick={() => toggle(x.id, x.label)} />)}
      </div>
      {offer.conditions.length > 0 && (
        <ul className="space-y-2">
          {offer.conditions.map((x) => (
            <li key={x.id}>
              <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl bg-void/40 px-4 text-sm text-ivory ring-1 ring-white/10">
                <input type="checkbox" className="size-4 accent-royal" checked={x.complete}
                  onChange={() => patchOffer(offer.id, (o) => ({ ...o, conditions: o.conditions.map((y) => (y.id === x.id ? { ...y, complete: !y.complete } : y)) }))} />
                <span className={x.complete ? "text-ivory/60 line-through" : ""}>{x.label}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={(e) => { e.preventDefault(); const t = custom.trim(); if (t) { toggle(`c-${t.toLowerCase()}`, t); setCustom(""); } }} className="flex max-w-md gap-2">
        <label htmlFor={id} className="sr-only">{c.add}</label>
        <input id={id} value={custom} onChange={(e) => setCustom(e.target.value)} placeholder={c.placeholder} className={input} />
        <button type="submit" aria-label={c.add} className="grid size-11 shrink-0 place-items-center rounded-full ring-1 ring-inset ring-white/25 hover:ring-white/50"><Plus aria-hidden className="size-4" /></button>
      </form>
    </div>
  );
}

/* ── Visa ───────────────────────────────────────────────────────────── */

function Visa({ profile }: { profile: UserProfile }) {
  const v = copy.visa;
  const items = visaItems(profile);
  if (!items.length) return <p className="mt-4 text-ivory/80">{v.pickOffer}</p>;
  const pct = visaProgress(profile);
  const set = (id: string, s: VisaItemStatus) => {
    const before = journey.get().profile;
    if (!Object.keys(before.departure.visa).length) track("visa_started", meta());
    patchDeparture((d) => ({ ...d, visa: { ...d.visa, [id]: s } }));
    if (visaProgress(journey.get().profile) === 100) track("visa_completed", meta());
  };
  const labels: Record<VisaItemStatus, string> = { notStarted: v.notStarted, inProgress: v.inProgress, done: v.done };
  return (
    <div className="mt-5">
      <div className="flex items-center gap-3">
        <div aria-hidden className="h-2 flex-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-royal-lit to-coral" style={{ width: `${pct}%` }} /></div>
        <span className="text-sm font-semibold text-ivory">{pct}%</span>
      </div>
      <ol className="mt-4 space-y-3">
        {items.map((it) => {
          const s = profile.departure.visa[it.id] ?? "notStarted";
          return (
            <li key={it.id} className={card}>
              <p className="font-serif text-lg text-ivory">{it.title}{!it.required && <span className="ml-2 font-sans text-xs text-ivory/60">(if it applies)</span>}</p>
              <p className="mt-0.5 text-sm text-ivory/70">{it.description}</p>
              <div role="group" aria-label={it.title} className="mt-3 flex flex-wrap gap-2">
                {(["notStarted", "inProgress", "done"] as const).map((st, i) => <Choice key={st} label={labels[st]} i={i} on={s === st} onPick={() => set(it.id, st)} />)}
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-xs text-ivory/65">{v.source}</p>
    </div>
  );
}

/* ── Funding ────────────────────────────────────────────────────────── */

function Funding({ profile, onCounsellor }: { profile: UserProfile; onCounsellor: (source: string) => void }) {
  const f = copy.funding;
  const totals = funding(profile);
  const keys = Object.keys(f.fields) as (keyof typeof f.fields)[];
  const shown: Record<keyof typeof f.fields, number> = {
    tuition: totals.tuition, scholarship: totals.scholarship, paid: totals.paid, livingCost: totals.livingCost, family: totals.family, loan: totals.loan,
  };
  return (
    <div className="mt-5 space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        {keys.map((k) => (
          <div key={k}>
            <label htmlFor={`fund-${k}`} className="text-xs font-medium text-ivory/80">{f.fields[k]}</label>
            <input id={`fund-${k}`} inputMode="decimal" className={`mt-1 ${input}`}
              value={profile.departure.funding[k] ?? ""} placeholder={shown[k] ? String(shown[k]) : "0"}
              onChange={(e) => patchDeparture((d) => ({ ...d, funding: { ...d.funding, [k]: toNumber(e.target.value) } }))} />
            {k === "livingCost" && totals.estimated && <p className="mt-1 text-[11px] text-ivory/55">{f.estimate}</p>}
          </div>
        ))}
      </div>
      <dl className={`grid grid-cols-2 gap-3 ${card}`}>
        <div><dt className="text-xs text-ivory/65">{f.remaining}</dt><dd className="font-serif text-xl text-ivory">{money(totals.remainingTuition, totals.country)}</dd></div>
        <div><dt className="text-xs text-ivory/65">{f.need}</dt><dd className="font-serif text-xl text-ivory">{money(totals.need, totals.country)}</dd></div>
        <div className="col-span-2">
          <dt className="text-xs text-ivory/65">{f.gap}</dt>
          <dd className={`font-serif text-2xl ${totals.gap > 0 ? "text-coral" : "text-sky"}`}>{totals.gap > 0 ? money(totals.gap, totals.country) : f.covered}</dd>
        </div>
      </dl>
      <ul className="flex flex-wrap gap-2">
        {(Object.keys(f.ctas) as (keyof typeof f.ctas)[]).map((k) => (
          <li key={k}>
            <button type="button" onClick={() => onCounsellor(`funding-${k}`)} className="inline-flex min-h-11 items-center rounded-full px-3.5 text-sm font-semibold text-sky ring-1 ring-inset ring-sky/30 hover:text-ivory hover:ring-ivory/40">
              {f.ctas[k]}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Accommodation ─────────────────────────────────────────────────── */

function Accommodation({ profile }: { profile: UserProfile }) {
  const a = copy.accommodation;
  const acc = profile.departure.accommodation;
  const set = (patch: Partial<Departure["accommodation"]>) => patchDeparture((d) => ({ ...d, accommodation: { ...d.accommodation, ...patch } }));
  const group = (label: string, opts: { id: string; label: string; icon?: string }[], value: string | null, key: "preference" | "commute" | "sharing" | "status") => (
    <div className="mt-5">
      <p className="text-sm font-medium text-ivory/85">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {opts.map((o, i) => <Choice key={o.id} label={o.label} i={i} icon={o.icon} on={value === o.id} onPick={() => set({ [key]: o.id })} />)}
      </div>
    </div>
  );
  return (
    <div>
      {group(a.preference, accommodationOptions, acc.preference, "preference")}
      <div className="mt-5 max-w-xs">
        <label htmlFor="acc-budget" className="text-sm font-medium text-ivory/85">{a.budget}</label>
        <input id="acc-budget" inputMode="decimal" value={acc.budget ?? ""} onChange={(e) => set({ budget: toNumber(e.target.value) })} className={`mt-1.5 ${input}`} />
      </div>
      {group(a.commute, commuteOptions, acc.commute, "commute")}
      {group(a.sharing, sharingOptions, acc.sharing, "sharing")}
      {group(a.status, accommodationStatuses, acc.status, "status")}
    </div>
  );
}

/* ── Travel ─────────────────────────────────────────────────────────── */

function Travel({ profile, today }: { profile: UserProfile; today: string }) {
  const t = copy.travel;
  const date = profile.departure.departureDate;
  const days = date ? daysUntil(date, today) : null;
  const toggle = (id: string) => {
    const on = profile.departure.travel.includes(id);
    patchDeparture((d) => ({ ...d, travel: on ? d.travel.filter((x) => x !== id) : [...d.travel, id] }));
    if (!on) track("departure_task_completed", meta({ task: id }));
  };
  return (
    <div className="mt-5 space-y-5">
      <div className="max-w-xs">
        <label htmlFor="dep-date" className="text-sm font-medium text-ivory/85">{t.date}</label>
        <input id="dep-date" type="date" value={date ?? ""} onChange={(e) => patchDeparture((d) => ({ ...d, departureDate: e.target.value || null }))} className={`mt-1.5 ${input}`} />
        {days !== null && days >= 0 && <p className="mt-2 font-serif text-2xl text-coral">{t.countdown(days)}</p>}
      </div>
      <div role="group" aria-label={t.prompt} className="flex flex-wrap gap-2">
        {travelChecklist.map((x, i) => <Choice key={x.id} label={x.label} i={i} icon={x.icon} on={profile.departure.travel.includes(x.id)} onPick={() => toggle(x.id)} />)}
      </div>
    </div>
  );
}
