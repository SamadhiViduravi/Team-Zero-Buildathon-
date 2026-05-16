"use client";

import type { SupportTicket } from "@/types/support";
import { ShieldAlert } from "lucide-react";

type ScamAlertCenterProps = {
  tickets: SupportTicket[];
  onSelectTicket: (ticket: SupportTicket) => void;
};

export function ScamAlertCenter({
  tickets,
  onSelectTicket,
}: ScamAlertCenterProps) {
  return (
    <section className="app-card border-red-100 bg-gradient-to-br from-red-50/80 to-white p-5 sm:p-6">
      <header className="mb-5 flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
          <ShieldAlert className="h-5 w-5" />
        </span>
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-app-pulse-soft" />
            Scam Alert Center
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Suspicious or high-risk messages flagged by n8n
          </p>
        </div>
      </header>

      {tickets.length === 0 ? (
        <p className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50 px-4 py-8 text-center text-sm text-emerald-800">
          No scam alerts this week. Your queue looks clear.
        </p>
      ) : (
        <ul className="space-y-3 app-scrollbar max-h-[calc(100vh-14rem)] overflow-y-auto">
          {tickets.map((ticket) => (
            <li
              key={ticket.ticketId}
              className="overflow-hidden rounded-xl border border-red-100 bg-white shadow-sm"
            >
              <div className="border-l-4 border-l-red-500 bg-red-50 px-4 py-2">
                <p className="text-xs font-semibold text-red-800">
                  {ticket.scamDetected ? "Scam detected" : "High risk"}
                </p>
              </div>
              <article className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-slate-500">
                      {ticket.ticketId}
                    </p>
                    <p className="font-medium text-slate-900">
                      {ticket.customerName ?? "Unknown"}
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-red-600">
                    {ticket.riskScore}
                  </p>
                </div>

                {ticket.scamFlags.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {ticket.scamFlags.map((flag) => (
                      <li
                        key={flag}
                        className="rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] text-red-700 ring-1 ring-red-100"
                      >
                        ⚠️ {flag}
                      </li>
                    ))}
                  </ul>
                )}

                <button
                  type="button"
                  onClick={() => onSelectTicket(ticket)}
                  className="mt-4 w-full rounded-lg border border-red-200 bg-white py-2 text-xs font-semibold text-red-700 transition-all duration-200 hover:bg-red-600 hover:text-white"
                >
                  View details
                </button>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
