export const CONTACT_SERVICES = ["consulting", "training", "development", "other"] as const;

export type ContactService = (typeof CONTACT_SERVICES)[number];

export type ContactSubmission = {
  name: string;
  email: string;
  project: string;
  service: ContactService;
  timeline: string;
  message: string;
};

export type ContactValidation =
  | { ok: true; data: ContactSubmission; spam: false }
  | { ok: true; spam: true }
  | { ok: false; errors: Record<string, string> };

const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown) {
  return typeof value === "string" ? value.replace(CONTROL_CHARACTERS, "").replace(/\r\n?/g, "\n").trim() : "";
}

export function validateContactPayload(input: unknown): ContactValidation {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, errors: { form: "The submitted data is not valid." } };
  }

  const raw = input as Record<string, unknown>;
  if (clean(raw.company)) {
    return { ok: true, spam: true };
  }

  const allowed = new Set(["name", "email", "project", "service", "timeline", "message", "company"]);
  if (Object.keys(raw).some((key) => !allowed.has(key))) {
    return { ok: false, errors: { form: "The submitted data contains unsupported fields." } };
  }

  const data = {
    name: clean(raw.name),
    email: clean(raw.email).toLowerCase(),
    project: clean(raw.project),
    service: clean(raw.service),
    timeline: clean(raw.timeline),
    message: clean(raw.message),
  };
  const errors: Record<string, string> = {};

  if (data.name.length < 2 || data.name.length > 80) errors.name = "Enter a name between 2 and 80 characters.";
  if (!EMAIL.test(data.email) || data.email.length > 254) errors.email = "Enter a valid email address.";
  if (data.project.length < 5 || data.project.length > 2_000) errors.project = "Describe the project in 5 to 2,000 characters.";
  if (!CONTACT_SERVICES.includes(data.service as ContactService)) errors.service = "Choose a type of work.";
  if (data.timeline.length < 2 || data.timeline.length > 120) errors.timeline = "Enter a timeline in 2 to 120 characters.";
  if (data.message.length < 10 || data.message.length > 4_000) errors.message = "Enter a message in 10 to 4,000 characters.";

  return Object.keys(errors).length
    ? { ok: false, errors }
    : { ok: true, data: data as ContactSubmission, spam: false };
}
