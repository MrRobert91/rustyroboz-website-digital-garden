"use client";

import { useTranslation } from "@/components/language-provider";

import { useRef, useState } from "react";
import { CONTACT_SERVICES, validateContactPayload } from "@/lib/contact";

const LABELS = {
  consulting: "Consulting",
  training: "Training",
  development: "Development",
  other: "Other",
} as const;

const fieldClass =
  "mt-2 min-h-11 w-full border border-control-border bg-background px-3 py-2 font-serif text-base text-foreground placeholder:text-muted-foreground";

export function ContactForm() {
  const { t } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const focusErrors = () => requestAnimationFrame(() => summaryRef.current?.focus());

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    const validation = validateContactPayload(payload);
    setStatus("");
    if (!validation.ok) {
      setErrors(validation.errors);
      focusErrors();
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json().catch(() => ({}))) as {
        message?: string;
        errors?: Record<string, string>;
      };
      if (!response.ok) {
        setErrors(result.errors ?? { form: result.message ?? "The message could not be sent. Please try again." });
        focusErrors();
        return;
      }
      formRef.current?.reset();
      setStatus(result.message ?? "Thanks. Your message was sent successfully.");
    } catch {
      setErrors({ form: "The network request failed. Your entries are still here; try again or use email." });
      focusErrors();
    } finally {
      setSubmitting(false);
    }
  }

  function describedBy(field: string, hint?: string) {
    return [hint, errors[field] ? `${field}-error` : null].filter(Boolean).join(" ") || undefined;
  }

  return (
    <div className="relative border border-border bg-paper-2 p-6 shadow-soft sm:p-8">
      <h2 className="font-display text-2xl font-bold text-accent-deep">{t("Quick brief")}</h2>
      <p className="mt-2 font-serif text-base text-muted-foreground">
        {t("Fields marked")} <span aria-hidden>*</span>
        <span className="sr-only">{t("with an asterisk")}</span> {t("are required.")}
      </p>

      {Object.keys(errors).length ? (
        <div className="mt-5 border-l-4 border-accent bg-background p-4" ref={summaryRef} role="alert" tabIndex={-1}>
          <p className="font-display text-base font-bold">{t("Please review the form.")}</p>
          <ul className="mt-2 list-disc pl-5 font-serif text-sm">
            {Object.entries(errors).map(([field, message]) => (
              <li key={field}>{t(message)}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <form className="mt-6 space-y-5" noValidate onSubmit={submit} ref={formRef}>
        <div>
          <label className="font-display text-sm font-semibold" htmlFor="contact-name">
            {t("Name (required)")}
          </label>
          <input
            aria-describedby={describedBy("name")}
            aria-invalid={Boolean(errors.name)}
            autoComplete="name"
            className={fieldClass}
            id="contact-name"
            maxLength={80}
            name="name"
            required
          />
          {errors.name ? (
            <p className="mt-1 font-serif text-sm text-accent-deep" id="name-error">
              {t(errors.name)}
            </p>
          ) : null}
        </div>

        <div>
          <label className="font-display text-sm font-semibold" htmlFor="contact-email">
            {t("Email (required)")}
          </label>
          <input
            aria-describedby={describedBy("email", "email-hint")}
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
            className={fieldClass}
            id="contact-email"
            inputMode="email"
            maxLength={254}
            name="email"
            required
            type="email"
          />
          <p className="mt-1 font-serif text-sm text-muted-foreground" id="email-hint">
            {t("Used only to reply to this request.")}
          </p>
          {errors.email ? (
            <p className="mt-1 font-serif text-sm text-accent-deep" id="email-error">
              {t(errors.email)}
            </p>
          ) : null}
        </div>

        <div>
          <label className="font-display text-sm font-semibold" htmlFor="contact-project">
            {t("Project or idea (required)")}
          </label>
          <textarea
            aria-describedby={describedBy("project")}
            aria-invalid={Boolean(errors.project)}
            className={`${fieldClass} min-h-28 resize-y`}
            id="contact-project"
            maxLength={2000}
            name="project"
            required
          />
          {errors.project ? (
            <p className="mt-1 font-serif text-sm text-accent-deep" id="project-error">
              {t(errors.project)}
            </p>
          ) : null}
        </div>

        <div>
          <label className="font-display text-sm font-semibold" htmlFor="contact-service">
            {t("Type of work (required)")}
          </label>
          <select
            aria-describedby={describedBy("service")}
            aria-invalid={Boolean(errors.service)}
            className={fieldClass}
            defaultValue=""
            id="contact-service"
            name="service"
            required
          >
            <option disabled value="">
              {t("Choose one")}
            </option>
            {CONTACT_SERVICES.map((service) => (
              <option key={service} value={service}>
                {t(LABELS[service])}
              </option>
            ))}
          </select>
          {errors.service ? (
            <p className="mt-1 font-serif text-sm text-accent-deep" id="service-error">
              {t(errors.service)}
            </p>
          ) : null}
        </div>

        <div>
          <label className="font-display text-sm font-semibold" htmlFor="contact-timeline">
            {t("Timeline (required)")}
          </label>
          <input
            aria-describedby={describedBy("timeline", "timeline-hint")}
            aria-invalid={Boolean(errors.timeline)}
            autoComplete="off"
            className={fieldClass}
            id="contact-timeline"
            maxLength={120}
            name="timeline"
            required
          />
          <p className="mt-1 font-serif text-sm text-muted-foreground" id="timeline-hint">
            {t("For example: next month or Q4.")}
          </p>
          {errors.timeline ? (
            <p className="mt-1 font-serif text-sm text-accent-deep" id="timeline-error">
              {t(errors.timeline)}
            </p>
          ) : null}
        </div>

        <div>
          <label className="font-display text-sm font-semibold" htmlFor="contact-message">
            {t("Message (required)")}
          </label>
          <textarea
            aria-describedby={describedBy("message")}
            aria-invalid={Boolean(errors.message)}
            className={`${fieldClass} min-h-32 resize-y`}
            id="contact-message"
            maxLength={4000}
            name="message"
            required
          />
          {errors.message ? (
            <p className="mt-1 font-serif text-sm text-accent-deep" id="message-error">
              {t(errors.message)}
            </p>
          ) : null}
        </div>

        <div aria-hidden className="absolute -left-[10000px] size-px overflow-hidden">
          <label htmlFor="contact-company">{t("Company website")}</label>
          <input autoComplete="off" id="contact-company" name="company" tabIndex={-1} />
        </div>

        <p className="font-serif text-sm text-muted-foreground">
          {t(
            "Your details are used only to answer this request and are sent to the configured delivery provider. Do not include sensitive data.",
          )}
        </p>
        <button
          className="min-h-11 bg-accent-surface px-5 py-3 font-mono text-sm font-semibold uppercase tracking-[0.12em] text-on-accent disabled:cursor-not-allowed disabled:opacity-50"
          disabled={submitting}
          type="submit"
        >
          {t(submitting ? "Sending…" : "Send message")}
        </button>
        <p aria-live="polite" className="min-h-6 font-serif text-base text-accent-deep" role="status">
          {t(status)}
        </p>
      </form>
    </div>
  );
}
