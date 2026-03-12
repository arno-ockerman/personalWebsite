"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "loading" | "success" | "error";

export function KickstartForm() {
  const [voornaam, setVoornaam] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/kickstart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voornaam, email }),
      });

      const data = (await res.json()) as { ok: boolean; error?: string };

      if (!res.ok || !data.ok) {
        setErrorMsg(data.error ?? "Er is iets misgegaan. Probeer het opnieuw.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setErrorMsg("Verbindingsfout. Controleer je internet en probeer opnieuw.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-3xl border border-brand-primary/15 bg-white p-8 shadow-soft text-center">
        <div className="mb-4 text-5xl">🎉</div>
        <h3 className="font-display text-2xl font-extrabold text-brand-primary">
          Check je inbox!
        </h3>
        <p className="mt-3 text-black/70 leading-relaxed">
          De <strong>7-Daagse Kickstart Gids</strong> is onderweg naar{" "}
          <strong className="text-brand-primary">{email}</strong>.
          <br />
          Soms belandt hij in je spam — check die ook even.
        </p>
        <p className="mt-4 text-sm text-black/50">
          Geen mail ontvangen na 5 minuten?{" "}
          <a href="/contact" className="underline text-brand-primary">
            Contacteer me
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-3xl border border-brand-primary/15 bg-white p-8 shadow-soft"
    >
      <h3 className="font-display text-xl font-extrabold text-brand-text mb-6">
        Stuur mij de gids 🚀
      </h3>

      {/* Honeypot — hidden from real users */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        autoComplete="off"
      />

      <div className="space-y-4">
        <div>
          <label
            htmlFor="ks-voornaam"
            className="mb-1.5 block text-sm font-semibold text-black/80"
          >
            Voornaam
          </label>
          <input
            id="ks-voornaam"
            type="text"
            autoComplete="given-name"
            required
            minLength={2}
            maxLength={80}
            value={voornaam}
            onChange={(e) => setVoornaam(e.target.value)}
            placeholder="Jouw voornaam"
            disabled={status === "loading"}
            className="w-full rounded-2xl border border-black/10 bg-brand-bg px-4 py-3 text-sm text-black/90 placeholder:text-black/30 focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/15 disabled:opacity-50"
          />
        </div>

        <div>
          <label
            htmlFor="ks-email"
            className="mb-1.5 block text-sm font-semibold text-black/80"
          >
            E-mailadres
          </label>
          <input
            id="ks-email"
            type="email"
            autoComplete="email"
            required
            maxLength={160}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jij@voorbeeld.be"
            disabled={status === "loading"}
            className="w-full rounded-2xl border border-black/10 bg-brand-bg px-4 py-3 text-sm text-black/90 placeholder:text-black/30 focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/15 disabled:opacity-50"
          />
        </div>

        {status === "error" && errorMsg && (
          <p
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "loading" || voornaam.trim().length < 2 || email.trim().length < 5}
          className="w-full rounded-2xl bg-brand-primary px-5 py-3.5 text-sm font-semibold text-brand-bg shadow-brand transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "loading" ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Even geduld…
            </span>
          ) : (
            "Stuur mij de gratis gids →"
          )}
        </button>

        <p className="text-center text-xs text-black/40">
          Geen spam. Altijd uitschrijven mogelijk. 🔒
        </p>
      </div>
    </form>
  );
}
