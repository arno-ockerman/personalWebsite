"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

type Topic =
  | "Afvallen"
  | "Spiermassa opbouwen"
  | "Gezonder leven"
  | "Extra inkomen / business"
  | "Anders";

type FormValues = {
  name: string;
  email: string;
  phone?: string;
  topic: Topic;
  message?: string;
  company?: string; // honeypot
};

const topics: Topic[] = [
  "Afvallen",
  "Spiermassa opbouwen",
  "Gezonder leven",
  "Extra inkomen / business",
  "Anders",
];

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      topic: "Afvallen",
    },
  });

  const disabled = useMemo(() => isSubmitting || status === "sending", [isSubmitting, status]);

  const onSubmit = handleSubmit(async (values) => {
    setStatus("sending");
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const json = (await response.json().catch(() => null)) as
        | { ok: true }
        | { ok: false; error: string }
        | null;

      if (!response.ok || !json || json.ok !== true) {
        const message = json && "error" in json ? json.error : "Er ging iets mis. Probeer het opnieuw.";
        throw new Error(message);
      }

      setStatus("success");
      reset();
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Er ging iets mis. Probeer het opnieuw.");
    }
  });

  return (
    <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-soft sm:p-8">
      {status === "success" ? (
        <div className="rounded-3xl border border-brand-accent/20 bg-brand-accent/5 p-6">
          <p className="text-sm font-semibold text-black/80">Ontvangen.</p>
          <p className="mt-2 text-sm text-black/70">
            Merci! Ik kom zo snel mogelijk bij je terug met een concreet antwoord.
          </p>
          <button
            type="button"
            className="mt-5 rounded-2xl bg-brand-primary px-5 py-3 text-sm font-semibold text-brand-bg shadow-brand transition hover:opacity-95"
            onClick={() => setStatus("idle")}
          >
            Nog iets sturen
          </button>
        </div>
      ) : null}

      {status !== "success" ? (
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-black/80">Naam</span>
              <input
                {...register("name", { required: "Vul je naam in.", minLength: { value: 2, message: "Te kort." } })}
                className="w-full rounded-2xl border border-black/10 bg-white px-3 py-2 outline-none ring-brand-primary/25 transition focus:ring-4"
                autoComplete="name"
                disabled={disabled}
              />
              {errors.name ? <p className="mt-1 text-xs text-brand-primary">{errors.name.message}</p> : null}
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-black/80">Email</span>
              <input
                type="email"
                {...register("email", { required: "Vul je email in." })}
                className="w-full rounded-2xl border border-black/10 bg-white px-3 py-2 outline-none ring-brand-primary/25 transition focus:ring-4"
                autoComplete="email"
                disabled={disabled}
              />
              {errors.email ? <p className="mt-1 text-xs text-brand-primary">{errors.email.message}</p> : null}
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-black/80">Telefoon (optioneel)</span>
              <input
                {...register("phone")}
                className="w-full rounded-2xl border border-black/10 bg-white px-3 py-2 outline-none ring-brand-primary/25 transition focus:ring-4"
                autoComplete="tel"
                disabled={disabled}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-black/80">Waar kan ik je mee helpen?</span>
              <select
                {...register("topic", { required: true })}
                className="w-full rounded-2xl border border-black/10 bg-white px-3 py-2"
                disabled={disabled}
              >
                {topics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-black/80">Bericht (optioneel)</span>
            <textarea
              {...register("message", { maxLength: { value: 1500, message: "Max 1500 tekens." } })}
              rows={6}
              className="w-full resize-none rounded-2xl border border-black/10 bg-white px-3 py-2 outline-none ring-brand-primary/25 transition focus:ring-4"
              placeholder="Waar sta je nu? Wat is je doel? Wat lukt er vandaag niet?"
              disabled={disabled}
            />
            {errors.message ? <p className="mt-1 text-xs text-brand-primary">{errors.message.message}</p> : null}
          </label>

          {/* Honeypot: should stay empty */}
          <input
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
            {...register("company")}
          />

          {status === "error" && error ? (
            <div className="rounded-2xl border border-brand-primary/15 bg-brand-primary/5 p-4">
              <p className="text-sm font-semibold text-brand-primary">Niet verzonden</p>
              <p className="mt-1 text-sm text-black/70">{error}</p>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={disabled}
            className="w-full rounded-2xl bg-brand-primary px-5 py-3 text-sm font-semibold text-brand-bg shadow-brand transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "sending" ? "Versturen..." : "Verstuur"}
          </button>

          <p className="text-xs text-black/50">
            Door te versturen ga je akkoord dat ik je contacteer over je aanvraag.
          </p>
        </form>
      ) : null}
    </section>
  );
}

