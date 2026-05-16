"use client";

import type { SupportTicket } from "@/types/support";
import { useEffect } from "react";

type TicketDetailModalProps = {
  ticket: SupportTicket | null;
  onClose: () => void;
};

function displayField(value: string) {
  const trimmed = value?.trim();
  return trimmed || "—";
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-900">
        {displayField(value)}
      </p>
    </div>
  );
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ticket-detail-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <article className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl app-scrollbar">
        <div className="flex items-start justify-between gap-4">
          <h2
            id="ticket-detail-title"
            className="text-lg font-semibold text-slate-900"
          >
            {ticket.ticketId}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            Close
          </button>
        </div>

        <div className="mt-2">
          <Row label="Intent" value={ticket.intent} />
          <Row label="Priority" value={ticket.priority} />
          <Row label="Department" value={ticket.department} />
          <Row label="Status" value={ticket.status} />
          <Row
            label="Risk"
            value={`${ticket.riskScore} (${ticket.riskLevel})`}
          />
          <Row label="Scam" value={ticket.scamDetected ? "Yes" : "No"} />
          <Row label="Order status" value={ticket.orderStatus} />
          <Row label="Reasoning" value={ticket.reasoning} />
          <Row label="Reply" value={ticket.generatedReply} />
        </div>
      </article>
    </section>
  );
}
