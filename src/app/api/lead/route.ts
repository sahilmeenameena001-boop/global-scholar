import { coerceLead, validateLead, type Lead } from "@/lib/validation";

/** Enquiries are per-request and must never be prerendered or cached. */
export const dynamic = "force-dynamic";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

/**
 * Coarse in-memory throttle. It resets on redeploy and is per-instance, so it
 * is a speed bump against casual spam rather than real abuse protection —
 * replace it with a shared store when this endpoint goes public.
 */
function rateLimited(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 500) for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
  return recent.length > MAX_PER_WINDOW;
}

/**
 * Hand the validated enquiry to wherever it needs to go. There is no backend in
 * this build, so it is recorded in the server log — swap the body for the real
 * CRM call, transactional email or database insert and the rest of the route
 * and the form keep working unchanged.
 */
async function deliver(lead: Lead) {
  console.info("[lead] enquiry received", {
    name: lead.name.trim(),
    email: lead.email.trim(),
    phone: lead.phone.trim(),
    time: lead.time,
    receivedAt: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (rateLimited(ip)) {
    return Response.json(
      { ok: false, message: "Too many requests. Please try again in a minute." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, message: "Malformed request." }, { status: 400 });
  }

  const lead = coerceLead(body);
  const errors = validateLead(lead);
  if (Object.keys(errors).length) {
    return Response.json({ ok: false, errors }, { status: 400 });
  }

  try {
    await deliver(lead);
  } catch (cause) {
    console.error("[lead] delivery failed", cause);
    return Response.json(
      { ok: false, message: "We could not send your request. Please try again or email us." },
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
}
