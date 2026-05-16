"use client";

import type { RiskLevel, SupportTicket, TicketStatus } from "@/types/support";
import { CalendarDays, Inbox } from "lucide-react";

type TicketQueueProps = {
  tickets: SupportTicket[];
  onSelectTicket: (ticket: SupportTicket) => void;
  weekLabel?: string;
};

function getRiskBorderClass(riskLevel: RiskLevel) {
  switch (riskLevel) {
    case "Critical":
      return "border-l-red-500";
    case "High":
      return "border-l-orange-500";
    case "Medium":
      return "border-l-amber-400";
    default:
      return "border-l-emerald-500";
  }
}

function getRiskRingClass(score: number) {
  if (score >= 80) return "border-red-200 bg-red-50 text-red-600";
  if (score >= 60) return "border-orange-200 bg-orange-50 text-orange-600";
  if (score >= 31) return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-600";
}

function getPriorityBadgeClass(priority: SupportTicket["priority"]) {
  switch (priority) {
    case "Critical":
      return "bg-red-600 text-white";
    case "High":
      return "bg-orange-500 text-white";
    case "Medium":
      return "bg-amber-400 text-amber-950";
    default:
      return "bg-emerald-500 text-white";
  }
}

function getRiskLevelBadgeClass(level: RiskLevel) {
  switch (level) {
    case "Critical":
      return "bg-red-50 text-red-700 ring-1 ring-red-200";
    case "High":
      return "bg-orange-50 text-orange-700 ring-1 ring-orange-200";
    case "Medium":
      return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
    default:
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  }
}

function getStatusBadgeClass(status: TicketStatus) {
  switch (status) {
    case "Escalated":
      return "bg-red-50 text-red-700";
    case "Assigned":
      return "bg-blue-50 text-blue-700";
    case "Resolved":
      return "bg-emerald-50 text-emerald-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function formatReceived(iso?: string) {
  if (!iso) return null;
  return new Intl.DateTimeFormat("en-LK", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function TicketQueue({
  tickets,
  onSelectTicket,
  weekLabel,
}: TicketQueueProps) {
  const sortedTickets = [...tickets].reverse();

  return (
    <section className="app-card p-5 sm:p-6">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Ticket Queue</h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <CalendarDays className="h-4 w-4 shrink-0" />
            All messages received this week
            {weekLabel ? ` · ${weekLabel}` : ""}
          </p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 ring-1 ring-blue-100">
          {sortedTickets.length} ticket{sortedTickets.length !== 1 ? "s" : ""}
        </span>
      </header>

      {sortedTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
          <Inbox className="mb-3 h-12 w-12 text-slate-300" strokeWidth={1.25} />
          <p className="font-medium text-slate-700">No messages this week yet</p>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            New customer messages from Web, WhatsApp, Email, or Facebook will
            appear here automatically after n8n processes them.
          </p>
        </div>
      ) : (
        <ul className="space-y-3 app-scrollbar max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
          {sortedTickets.map((ticket, index) => (
            <li
              key={ticket.ticketId}
              style={{ animationDelay: `${index * 30}ms` }}
              className={`animate-app-slide-in rounded-xl border border-slate-200 border-l-4 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md ${getRiskBorderClass(ticket.riskLevel)} ${
                ticket.riskLevel === "Critical"
                  ? "ring-1 ring-red-100"
                  : ""
              }`}
            >
              <article className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mono text-sm font-bold text-slate-900">
                      {ticket.ticketId}
                    </p>
                    {ticket.scamDetected && (
                      <span className="animate-app-pulse-soft rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-bold uppercase text-white">
                        Scam
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-800">
                    {ticket.customerName ?? "Unknown customer"}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    {ticket.channel && (
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                        {ticket.channel}
                      </span>
                    )}
                    <span>{ticket.intent}</span>
                    {formatReceived(ticket.createdAt) && (
                      <span>· {formatReceived(ticket.createdAt)}</span>
                    )}
                  </div>
                </div>

                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 text-base font-bold ${getRiskRingClass(ticket.riskScore)}`}
                >
                  {ticket.riskScore}
                </span>
              </article>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${getPriorityBadgeClass(ticket.priority)}`}
                >
                  {ticket.priority}
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${getRiskLevelBadgeClass(ticket.riskLevel)}`}
                >
                  {ticket.riskLevel}
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${getStatusBadgeClass(ticket.status)}`}
                >
                  {ticket.status}
                </span>
                <span className="text-xs text-slate-500">{ticket.department}</span>
              </div>

              <button
                type="button"
                onClick={() => onSelectTicket(ticket)}
                className="mt-4 rounded-lg border border-blue-200 bg-white px-4 py-2 text-xs font-semibold text-blue-700 transition-all duration-200 hover:bg-blue-600 hover:text-white"
              >
                View details
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
