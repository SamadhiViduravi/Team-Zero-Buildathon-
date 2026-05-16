"use client";

import type { RiskLevel, SupportTicket } from "@/types/support";
import { Check, X } from "lucide-react";
import { useEffect } from "react";

type TicketDetailModalProps = {
  ticket: SupportTicket | null;
  onClose: () => void;
};

function headerClass(riskLevel: RiskLevel) {
  switch (riskLevel) {
    case "Critical":
      return "from-red-100 to-white";
    case "High":
      return "from-orange-100 to-white";
    case "Medium":
      return "from-amber-50 to-white";
    default:
      return "from-emerald-50 to-white";
  }
}

function scoreColor(score: number) {
  if (score >= 80) return "text-red-600";
  if (score >= 60) return "text-orange-600";
  if (score >= 31) return "text-amber-600";
  return "text-emerald-600";
}

function scoreRing(score: number) {
  if (score >= 80) return "ring-red-200";
  if (score >= 60) return "ring-orange-200";
  if (score >= 31) return "ring-amber-200";
  return "ring-emerald-200";
}

export function TicketDetailModal({ ticket, onClose }: TicketDetailModalProps) {
  useEffect(() => {
    if (!ticket) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [ticket, onClose]);

  if (!ticket) return null;

  return (
    <section
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close"
        onClick={onClose}
      />
      <article className="relative my-4 w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <header
          className={`bg-gradient-to-b px-6 pb-6 pt-5 ${headerClass(ticket.riskLevel)}`}
        >
          <div className="flex items-start justify-between">
            <p className="font-mono text-sm text-slate-500">{ticket.ticketId}</p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-white hover:text-slate-900"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div
            className={`mx-auto mt-4 flex h-28 w-28 items-center justify-center rounded-full bg-white ring-4 ${scoreRing(ticket.riskScore)}`}
          >
            <span
              className={`text-5xl font-bold tabular-nums sm:text-6xl ${scoreColor(ticket.riskScore)}`}
            >
              {ticket.riskScore}
            </span>
          </div>
          <p className="mt-3 text-center text-sm text-slate-600">
            {ticket.riskLevel} risk ? {ticket.priority} priority
          </p>
        </header>

        <section className="max-h-[min(60vh,480px)] space-y-5 overflow-y-auto p-6 app-scrollbar">
          {ticket.originalMessage && (
            <section className="border-b border-slate-100 pb-5">
              <h3 className="text-xs font-semibold uppercase text-slate-500">
                Customer message
              </h3>
              <blockquote className="mt-2 rounded-lg border-l-4 border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {ticket.originalMessage}
              </blockquote>
              <p className="mt-2 text-xs text-slate-500">
                {ticket.customerName} ? {ticket.channel ?? "?"}
              </p>
            </section>
          )}

          <section className="border-b border-slate-100 pb-5">
            <h3 className="text-xs font-semibold uppercase text-slate-500">
              Classification
            </h3>
            <p className="mt-2 text-sm text-slate-700">
              {ticket.intent} ? {ticket.department} ? {ticket.status}
            </p>
            <p className="text-sm text-slate-500">Order: {ticket.orderStatus}</p>
          </section>

          {ticket.scamDetected && (
            <section className="border-b border-slate-100 pb-5">
              <p className="rounded-lg bg-red-600 px-4 py-2 text-center text-sm font-semibold text-white">
                Scam detected ? {ticket.scamType}
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {ticket.scamFlags.map((flag) => (
                  <li
                    key={flag}
                    className="rounded-full bg-red-50 px-3 py-1 text-xs text-red-700 ring-1 ring-red-100"
                  >
                    {flag}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="border-b border-slate-100 pb-5">
            <h3 className="text-xs font-semibold uppercase text-slate-500">
              AI reasoning
            </h3>
            <p className="mt-2 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
              {ticket.reasoning}
            </p>
          </section>

          <section className="border-b border-slate-100 pb-5">
            <h3 className="text-xs font-semibold text-emerald-700">
              Safe Reply ? Auto-generated by n8n + AI
            </h3>
            <p className="mt-2 border-l-4 border-emerald-500 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              {ticket.generatedReply}
            </p>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase text-slate-500">
              Workflow actions
            </h3>
            <ol className="mt-3 space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-4">
              {ticket.workflowActions.map((action, i) => (
                <li
                  key={`${i}-${action}`}
                  className="flex items-start gap-2 text-sm text-slate-700"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>
                    <span className="text-slate-400">{i + 1}.</span> {action}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </section>
      </article>
    </section>
  );
}
