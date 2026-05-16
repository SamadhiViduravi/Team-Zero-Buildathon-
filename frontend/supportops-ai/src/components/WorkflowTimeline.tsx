"use client";

import { Check } from "lucide-react";

const STEPS = [
  "Webhook Intake",
  "Intent Classification",
  "Order/Payment Lookup",
  "Scam Detection",
  "Priority Scoring",
  "Department Routing",
  "Escalation Check",
  "Safe Reply Generation",
];

type WorkflowTimelineProps = {
  activeStep?: number;
  actions?: string[];
};

export function WorkflowTimeline({
  activeStep = 0,
  actions = [],
}: WorkflowTimelineProps) {
  return (
    <section className="app-card p-5 sm:p-6">
      <header className="mb-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <span className="rounded-lg bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700">
            n8n
          </span>
          Workflow pipeline
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          How every customer message is processed
        </p>
      </header>

      <ol className="flex min-w-[640px] items-start overflow-x-auto pb-2 app-scrollbar lg:min-w-0">
        {STEPS.map((label, index) => {
          const stepNum = index + 1;
          const done = activeStep > stepNum;
          const active = activeStep === stepNum;
          const isLast = index === STEPS.length - 1;

          return (
            <li key={label} className="flex flex-1 items-start">
              <div className="flex w-full flex-col items-center">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all duration-200 ${
                    done
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : active
                        ? "border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-500/30"
                        : "border-slate-200 bg-white text-slate-400"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : stepNum}
                </span>
                <p
                  className={`mt-2 max-w-[72px] text-center text-[10px] leading-tight ${
                    done
                      ? "text-emerald-600"
                      : active
                        ? "font-medium text-orange-600"
                        : "text-slate-400"
                  }`}
                >
                  {label}
                </p>
              </div>
              {!isLast && (
                <span
                  className={`mt-4 h-0.5 min-w-[6px] flex-1 ${
                    done ? "bg-emerald-300" : "bg-slate-200"
                  }`}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>

      <p className="mt-5 text-center text-xs font-medium text-orange-600">
        ⚡ Every message is orchestrated by n8n before becoming a ticket
      </p>

      {actions.length > 0 && (
        <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
          {actions.map((action, i) => (
            <li
              key={`${i}-${action}`}
              className="flex items-center gap-2 text-sm text-slate-600"
            >
              <Check className="h-4 w-4 shrink-0 text-emerald-500" />
              {action}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
