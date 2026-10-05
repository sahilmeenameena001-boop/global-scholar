import type { DestinationId } from "@/lib/journey/types";

/**
 * Checklists for the applying and offer stages. The shells already draw from
 * these; the full flows (next milestone) will track a status per item.
 *
 * General guidance only — visa and enrolment requirements are set by each
 * government and university and change. Link to the official source in the
 * full flow rather than restating rules here.
 */

export const documentStatuses = ["complete", "in progress", "missing", "not required"] as const;
export type DocumentStatus = (typeof documentStatuses)[number];

export const applicationStatuses = ["Not started", "In progress", "Submitted"] as const;

export const applicationDocuments = [
  { id: "passport", label: "Passport" },
  { id: "transcript", label: "Transcript" },
  { id: "cv", label: "CV" },
  { id: "sop", label: "SOP" },
  { id: "lor", label: "LOR" },
  { id: "english", label: "English test" },
  { id: "portfolio", label: "Portfolio" },
  { id: "finance", label: "Financial documents" },
];

/** The pre-departure road every offer follows. */
export const departureRoad = ["Offer", "Deposit", "Visa", "Accommodation", "Flight", "Arrival"];

/** Destination-specific steps between accepting an offer and applying for a visa. */
export const offerSteps: Record<DestinationId, string[]> = {
  uk: ["Accept offer", "Pay deposit", "Receive CAS", "Prepare visa documents", "Apply for visa"],
  usa: ["Accept offer", "Receive I-20", "Pay SEVIS fee", "Visa application", "Visa interview"],
  canada: ["Accept offer", "Pay deposit", "Get letter of acceptance", "Gather proof of funds", "Apply for study permit"],
  australia: ["Accept offer", "Pay deposit", "Receive CoE", "Arrange health cover", "Apply for student visa"],
  europe: ["Accept offer", "Confirm enrolment", "Proof of funds", "Book visa appointment", "Apply for national visa"],
};
