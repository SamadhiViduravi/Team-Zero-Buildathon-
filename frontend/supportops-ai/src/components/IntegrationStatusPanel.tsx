"use client";

import { useEffect, useState } from "react";

const LOADING_STEPS = [
  "Sending message to n8n...",
  "Classifying customer intent...",
  "Checking order/payment data...",
  "Running scam detection...",
  "Routing ticket...",
  "Generating safe reply...",
] as const;

type IntegrationStatusPanelProps = {
  loading: boolean;
  fallbackUsed: boolean;
  hasProcessed: boolean;
};

export function IntegrationStatusPanel({
  loading,
  fallbackUsed,
  hasProcessed,
}: IntegrationStatusPanelProps) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!loading) return;

    const interval = window.setInterval(() => {
      setActiveStep((current) =>
        current < LOADING_STEPS.length - 1 ? current + 1 : current
      );
    }, 500);

    return () => window.clearInterval(interval);
  }, [loading]);

  if (loading) {
    return (
      <section
        className="app-card border-orange-100 bg-orange-50/50 p-4"
        aria-live="polite"
        aria-busy="true"
      >
        <p className="text-sm font-semibold text-orange-800">
          Running n8n workflow…
        </p>
        <ol className="mt-3 space-y-2">
          {LOADING_STEPS.map((step, index) => {
            const done = index < activeStep;
            const current = index === activeStep;

            return (
              <li
                key={step}
                className={`flex items-center gap-2 text-sm ${
                  current
                    ? "font-medium text-orange-900"
                    : done
                      ? "text-emerald-700"
                      : "text-slate-500"
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                    done
                      ? "bg-emerald-500 text-white"
                      : current
                        ? "bg-orange-500 text-white"
                        : "border border-slate-200 bg-white"
                  }`}
                  aria-hidden
                >
                  {done ? "✓" : current ? "…" : index + 1}
                </span>
                {step}
              </li>
            );
          })}
        </ol>
      </section>
    );
  }

  if (!hasProcessed) return null;

  if (fallbackUsed) {
    return (
      <div
        className="app-card border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        role="status"
      >
        <strong className="font-semibold">Demo fallback mode</strong> — webhook
        not configured
      </div>
    );
  }

  return (
    <article
      className="app-card border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
      role="status"
    >
      <strong className="font-semibold">✓ Processed through n8n</strong>
    </article>
  );
}
