export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
export const isPhone = (v: string) => /^[+\d][\d\s()-]{6,}$/.test(v.trim());

export const COUNSELLING_TIMES = [
  "Weekday morning",
  "Weekday afternoon",
  "Weekday evening",
  "Weekend",
] as const;

export type Lead = { name: string; email: string; phone: string; time: string; consent: boolean };
export type LeadErrors = Partial<Record<keyof Lead, string>>;

export const emptyLead: Lead = { name: "", email: "", phone: "", time: "", consent: false };

/**
 * The single validation pass, run on the client for instant feedback and again
 * in the API route because client checks are advisory only. Keep both callers
 * pointed here so the rules cannot drift apart.
 */
export function validateLead(v: Lead): LeadErrors {
  const err: LeadErrors = {};
  if (v.name.trim().length < 2) err.name = "Please enter your full name.";
  else if (v.name.trim().length > 100) err.name = "Please shorten your name to 100 characters.";
  if (!isEmail(v.email)) err.email = "Enter a valid email address.";
  if (!isPhone(v.phone)) err.phone = "Enter a valid phone number with country code.";
  if (!COUNSELLING_TIMES.includes(v.time as (typeof COUNSELLING_TIMES)[number])) {
    err.time = "Choose a preferred counselling time.";
  }
  if (!v.consent) err.consent = "Please confirm you agree to be contacted.";
  return err;
}

/** Narrows an untrusted request body to a Lead without throwing on bad input. */
export function coerceLead(input: unknown): Lead {
  const o = (typeof input === "object" && input !== null ? input : {}) as Record<string, unknown>;
  const str = (k: string) => (typeof o[k] === "string" ? (o[k] as string) : "");
  return {
    name: str("name"),
    email: str("email"),
    phone: str("phone"),
    time: str("time"),
    consent: o.consent === true,
  };
}
