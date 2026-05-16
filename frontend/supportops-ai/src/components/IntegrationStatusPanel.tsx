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
        className="rounded-xl border border-sky-200 bg-sky-50 p-4 shadow-sm dark:border-sky-900 dark:bg-sky-950/40"
        aria-live="polite"
        aria-busy="true"
      >
        <p className="text-sm font-semibold text-sky-900 dark:text-sky-100">
          Running SupportOps workflow
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
                    ? "font-medium text-sky-900 dark:text-sky-100"
                    : done
                      ? "text-sky-700 dark:text-sky-300"
                      : "text-sky-600/60 dark:text-sky-400/60"
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                    done
                      ? "bg-sky-600 text-white"
                      : current
                        ? "animate-pulse bg-sky-500 text-white"
                        : "border border-sky-300 bg-white dark:border-sky-700 dark:bg-sky-950"
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
        className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100"
        role="status"
      >
        <span className="mr-2" aria-hidden>
          ⚠
        </span>
        <strong className="font-semibold">Demo fallback mode active</strong>
      </div>
    );
  }

  return (
    <article
      className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100"
      role="status"
    >
      <span className="mr-2" aria-hidden>
        ✓
      </span>
      <strong className="font-semibold">Processed through n8n workflow</strong>
    </article>
  );
}
