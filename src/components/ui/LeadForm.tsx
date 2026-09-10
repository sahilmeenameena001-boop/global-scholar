"use client";
import { useState } from "react";
import { contact } from "@/data/site";
import { COUNSELLING_TIMES, emptyLead, validateLead, type Lead, type LeadErrors } from "@/lib/validation";
import { Button } from "./Button";
import { Input, Select, SuccessState } from "./Field";

/**
 * Lead capture. Validates on the client for instant feedback, then posts to
 * `/api/lead`, which re-runs the same rules server-side and owns delivery.
 *
 * `context` names what the enquiry is about — the scholarship a student clicked,
 * say — and travels with the lead so whoever picks it up knows why they called.
 */
export function LeadForm({ compact, context }: { compact?: boolean; context?: string }) {
  const [v, setV] = useState<Lead>(() => ({ ...emptyLead, context: context ?? "" }));
  const [errors, setErrors] = useState<LeadErrors>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const set = <K extends keyof Lead>(key: K, value: Lead[K]) => {
    setV((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;

    const err = validateLead(v);
    setErrors(err);
    setFailure(null);
    if (Object.keys(err).length) return;

    setSending(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });
      const data: { ok?: boolean; errors?: LeadErrors; message?: string } = await res
        .json()
        .catch(() => ({}));

      if (res.ok && data.ok) {
        setDone(true);
      } else if (data.errors) {
        setErrors(data.errors);
      } else {
        setFailure(data.message ?? "Something went wrong. Please try again.");
      }
    } catch {
      setFailure(`We could not reach the server. Please check your connection or email us at ${contact.email}.`);
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <SuccessState
        title="Thank you, we'll be in touch"
        text={`A counsellor will contact you at ${v.time.toLowerCase()} to arrange your free session.`}
      />
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {context && (
        <p className="rounded-xl border border-royal-lit/25 bg-royal/10 px-4 py-3 text-sm text-mist">
          <span className="font-semibold text-ivory">Enquiry about:</span> {context}
        </p>
      )}
      <fieldset disabled={sending} className="space-y-4 border-0 p-0 transition-opacity duration-200 disabled:opacity-60">
        <div className={`grid gap-4 ${compact ? "" : "sm:grid-cols-2"}`}>
          <Input id="lead-name" label="Full name" autoComplete="name" value={v.name} error={errors.name} onChange={(e) => set("name", e.target.value)} />
          <Input id="lead-email" label="Email" type="email" autoComplete="email" value={v.email} error={errors.email} onChange={(e) => set("email", e.target.value)} />
          <Input id="lead-phone" label="Phone number" type="tel" autoComplete="tel" placeholder="+91 98765 43210" value={v.phone} error={errors.phone} onChange={(e) => set("phone", e.target.value)} />
          <Select id="lead-time" label="Preferred counselling time" value={v.time} error={errors.time} onChange={(e) => set("time", e.target.value)}>
            <option value="">Select a time</option>
            {COUNSELLING_TIMES.map((t) => <option key={t}>{t}</option>)}
          </Select>
        </div>
        <div>
          <label className="flex items-start gap-3 text-sm text-mist">
            <input type="checkbox" className="mt-1 size-4 accent-royal" checked={v.consent} aria-invalid={!!errors.consent} onChange={(e) => set("consent", e.target.checked)} />
            I agree to be contacted by Global Scholars about counselling. No admission, scholarship or visa outcome is guaranteed.
          </label>
          {errors.consent && <p role="alert" className="mt-1 text-xs font-medium text-coral">{errors.consent}</p>}
        </div>
      </fieldset>

      {failure && (
        <p role="alert" className="rounded-xl bg-coral/10 px-4 py-3 text-sm text-coral ring-1 ring-inset ring-coral/30">
          {failure}
        </p>
      )}

      <Button type="submit" variant="coral" arrow={!sending} disabled={sending} aria-busy={sending} className="w-full sm:w-auto">
        {sending ? "Sending…" : "Request my free counselling call"}
      </Button>
      <p aria-live="polite" className="sr-only">{sending ? "Sending your request" : ""}</p>
    </form>
  );
}
