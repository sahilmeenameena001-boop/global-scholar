import { accommodationStatuses, currency, livingCostEstimate, offerCopy, travelChecklist, visaRequirements } from "@/data/journey/offer";
import { universityById } from "@/data/journey/universities";
import { daysUntil, uniName } from "./applying";
import type { DestinationId, Offer, OfferStep, UserProfile } from "./types";

/**
 * Offer & departure logic: pure functions from what the student entered to a
 * move summary, a funding picture and the next thing to do. Nothing here is
 * fetched or verified; it only organises the student's own answers.
 */

export const offerCountry = (o: Offer): DestinationId | null => o.country ?? universityById[o.university]?.country ?? null;
export const offerCity = (o: Offer) => universityById[o.university]?.city ?? uniName(o.university);

/** The offer the move is built around: the chosen one, or the only one. */
export function selectedOffer(p: UserProfile): Offer | null {
  return p.offers.find((o) => o.id === p.selectedOfferId) ?? (p.offers.length === 1 ? p.offers[0] : null);
}

export function visaItems(p: UserProfile) {
  const o = selectedOffer(p);
  const country = o ? offerCountry(o) : null;
  return country ? [...visaRequirements[country]].sort((a, b) => a.order - b.order) : [];
}

/** Share of required visa steps marked done, 0–100. */
export function visaProgress(p: UserProfile) {
  const items = visaItems(p).filter((i) => i.required);
  if (!items.length) return 0;
  const score = items.reduce((s, i) => s + (p.departure.visa[i.id] === "done" ? 1 : p.departure.visa[i.id] === "inProgress" ? 0.5 : 0), 0);
  return Math.round((100 * score) / items.length);
}

export const money = (n: number, country: DestinationId | null) => `${country ? currency[country] : ""}${Math.round(n).toLocaleString("en-GB")}`;

/** Tuition, scholarship, what's paid, living costs and the gap — prefilled from the offer where the student hasn't said. */
export function funding(p: UserProfile) {
  const o = selectedOffer(p);
  const country = o ? offerCountry(o) : null;
  const f = p.departure.funding;
  const tuition = f.tuition ?? o?.tuition ?? 0;
  const scholarship = f.scholarship ?? o?.scholarshipAmount ?? 0;
  const paid = f.paid ?? 0;
  const livingCost = f.livingCost ?? (country ? livingCostEstimate[country] : 0);
  const covered = (f.family ?? 0) + (f.loan ?? 0);
  const remainingTuition = Math.max(0, tuition - scholarship - paid);
  const need = remainingTuition + livingCost;
  return { country, tuition, scholarship, paid, livingCost, family: f.family ?? 0, loan: f.loan ?? 0, remainingTuition, need, gap: Math.max(0, need - covered), estimated: f.livingCost === undefined };
}

export type MoveRow = { id: string; label: string; value: string; done: boolean };

/** "Offer accepted ✓ · Deposit ✓ · Visa 60% · Accommodation pending · Flights not booked". */
export function moveSummary(p: UserProfile): MoveRow[] {
  const o = selectedOffer(p);
  const m = offerCopy.move;
  const visa = visaProgress(p);
  const acc = accommodationStatuses.find((s) => s.id === p.departure.accommodation.status);
  const flights = p.departure.travel.includes("flights");
  return [
    { id: "accepted", label: m.accepted, value: o?.accepted ? "✓" : m.pending, done: !!o?.accepted },
    { id: "deposit", label: m.deposit, value: o?.depositPaid ? "✓" : m.pending, done: !!o?.depositPaid },
    { id: "visa", label: m.visa, value: `${visa}%`, done: visa === 100 },
    { id: "accommodation", label: m.accommodation, value: acc?.id === "booked" ? m.booked : acc ? acc.label : m.pending, done: acc?.id === "booked" },
    { id: "flights", label: m.flights, value: flights ? m.booked : m.notBooked, done: flights },
  ];
}

export type MoveAction = { title: string; description: string; step: OfferStep; urgency: "low" | "medium" | "high" | "urgent"; days: number | null };

const urgencyFor = (days: number | null): MoveAction["urgency"] =>
  days === null ? "medium" : days <= 3 ? "urgent" : days <= 14 ? "high" : days <= 45 ? "medium" : "low";

/**
 * The next thing to do between offer and departure, in order: get the offer
 * in, choose, accept, meet conditions, pay the deposit, confirm the move,
 * then visa, money, a place to live, and the trip itself.
 */
export function nextMoveAction(p: UserProfile, today: string): MoveAction {
  if (!p.offers.length) return { title: "Add your offer", description: "Record the offer you’ve received so we can plan the move around it.", step: "offers", urgency: "medium", days: null };
  const o = selectedOffer(p);
  if (!o) return { title: "Choose between your offers", description: "Compare them side by side. The choice is yours; we’ll plan around it.", step: "acceptance", urgency: "high", days: null };
  const name = uniName(o.university);
  if (!o.accepted) return { title: `Accept your ${name} offer`, description: "Accept through the university’s portal, then confirm it here.", step: "acceptance", urgency: "high", days: null };
  const open = o.conditions.find((c) => !c.complete);
  if (open) return { title: `Meet your offer condition: ${open.label}`, description: "Your offer becomes firm once every condition is met.", step: "conditions", urgency: "high", days: null };
  if (!o.depositPaid && (o.depositAmount || o.depositDeadline)) {
    const days = o.depositDeadline ? daysUntil(o.depositDeadline, today) : null;
    return { title: `Pay your ${name} deposit`, description: days !== null ? `The deadline is ${days <= 0 ? "today or passed" : `in ${days} days`}.` : "It secures your place.", step: "acceptance", urgency: urgencyFor(days), days };
  }
  if (!p.departureConfirmed) return { title: "Start your departure plan", description: "Switch your journey to getting ready for the move.", step: "acceptance", urgency: "medium", days: null };
  const days = p.departure.departureDate ? daysUntil(p.departure.departureDate, today) : null;
  const visa = visaItems(p).find((i) => i.required && p.departure.visa[i.id] !== "done");
  if (visa) return { title: `Complete “${visa.title}” for your visa`, description: visa.description, step: "visa", urgency: urgencyFor(days), days };
  const f = funding(p);
  if (f.gap > 0) return { title: `Close your funding gap of ${money(f.gap, f.country)}`, description: "Look at scholarships, a loan or family contribution to cover it.", step: "funding", urgency: urgencyFor(days), days };
  if (p.departure.accommodation.status !== "booked") return { title: "Book your accommodation", description: "Set your preferences and budget, then book.", step: "accommodation", urgency: urgencyFor(days), days };
  const travel = travelChecklist.find((t) => !p.departure.travel.includes(t.id));
  if (travel) return { title: `Sort your ${travel.short}`, description: "Tick it off on your travel checklist.", step: "travel", urgency: urgencyFor(days), days };
  const city = offerCity(o);
  return { title: offerCopy.move.ready(city), description: "Everything on your list is done. Safe travels.", step: "move", urgency: "low", days };
}

export const newOfferId = () => `o-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
