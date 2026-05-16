"use client";

import { useCallback, useMemo, useState } from "react";
import {
  LOADING_STEPS,
  submitSupportMessage,
} from "@/lib/submitSupportMessage";
import type { SupportMessagePayload, SupportTicket } from "@/types/support";

const INITIAL_FORM: SupportMessagePayload = {
  customerName: "",
  channel: "Web",
  message: "",
  orderId: "",
};

const DEMO_PRESETS: { label: string; data: SupportMessagePayload }[] = [
  {
    label: "Scam Payment Link",
    data: {
      customerName: "Nimal",
      channel: "Web",
      orderId: "ORD-5550",
      message:
        "I paid for ORD-5550 but it still says pending. I also received a link asking me to pay delivery again: http://fast-delivery-prize.com",
    },
  },
  {
    label: "OTP Scam",
    data: {
      customerName: "Kasun",
      channel: "Web",
      orderId: "",
      message:
        "Someone called me asking for my OTP to confirm my delivery. Is this from your shop?",
    },
  },
  {
    label: "Refund Abuse",
    data: {
      customerName: "Kasun Jay",
      channel: "Web",
      orderId: "ORD-3011",
      message:
        "I want a refund again for ORD-3011. The product was damaged.",
    },
  },
  {
    label: "Delivery Delay",
    data: {
      customerName: "Ayesha",
      channel: "Web",
      orderId: "ORD-2048",
      message:
        "Where is my delivery? ORD-2048 has been in transit for 3 days.",
    },
  },
  {
    label: "Damaged Product",
    data: {
      customerName: "Dinesh",
      channel: "Web",
      orderId: "ORD-4455",
      message:
        "My product arrived completely damaged. I want this resolved immediately.",
    },
  },
];

const WORKFLOW_STEPS = [
  { label: "Webhook Intake", color: "#3b82f6" },
  { label: "Intent Classification", color: "#8b5cf6" },
  { label: "Order Lookup", color: "#06b6d4" },
  { label: "Scam Detection", color: "#ef4444" },
  { label: "Department Routing", color: "#f97316" },
  { label: "Escalation Check", color: "#eab308" },
  { label: "Safe Reply Generation", color: "#22c55e" },
];

type Priority = SupportTicket["priority"];
type RiskLevel = SupportTicket["riskLevel"];
type Status = SupportTicket["status"];

function priorityClass(p: Priority): string {
  const map: Record<Priority, string> = {
    Low: "bg-zinc-600/30 text-zinc-300 border-zinc-500/40",
    Medium: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    High: "bg-orange-500/20 text-orange-300 border-orange-500/40",
    Critical: "bg-red-500/20 text-red-300 border-red-500/40",
  };
  return map[p];
}

function riskClass(r: RiskLevel): string {
  return priorityClass(r as Priority);
}

function statusClass(s: Status): string {
  const map: Record<Status, string> = {
    New: "bg-zinc-600/30 text-zinc-300 border-zinc-500/40",
    Assigned: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    Escalated: "bg-red-500/20 text-red-300 border-red-500/40",
    Resolved: "bg-green-500/20 text-green-300 border-green-500/40",
  };
  return map[s];
}

function riskScoreColor(score: number): string {
  if (score >= 80) return "text-red-400";
  if (score >= 60) return "text-orange-400";
  if (score >= 40) return "text-blue-400";
  return "text-zinc-400";
}

function Badge({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

export default function Home() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [fallbackMode, setFallbackMode] = useState(false);
  const [formData, setFormData] = useState<SupportMessagePayload>(INITIAL_FORM);

  const stats = useMemo(
    () => ({
      total: tickets.length,
      open: tickets.filter((t) => t.status !== "Resolved").length,
      scams: tickets.filter((t) => t.scamDetected).length,
      escalated: tickets.filter((t) => t.status === "Escalated").length,
    }),
    [tickets]
  );

  const alertTickets = useMemo(
    () =>
      tickets.filter((t) => t.scamDetected || t.riskScore >= 60),
    [tickets]
  );

  const handleSubmit = useCallback(async () => {
    if (!formData.customerName.trim() || !formData.message.trim()) return;

    setIsLoading(true);
    setFallbackMode(false);

    for (const step of LOADING_STEPS) {
      setLoadingStep(step);
      await new Promise((r) => setTimeout(r, 600));
    }

    const payload: SupportMessagePayload = {
      ...formData,
      orderId: formData.orderId?.trim() || undefined,
    };

    const { ticket, fallback } = await submitSupportMessage(payload);
    setTickets((prev) => [ticket, ...prev]);
    setFallbackMode(fallback);
    setIsLoading(false);
    setLoadingStep("");
  }, [formData]);

  return (
    <div className="min-h-screen bg-[#0f1117]">
      {/* SECTION 1 — Header */}
      <header className="border-b border-[#2a2d3a] bg-gradient-to-r from-[#0f1117] via-[#141824] to-[#0f1117]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  SupportFlow
                </h1>
                <Badge className="border-[#3b82f6]/50 bg-[#3b82f6]/15 text-[#93c5fd]">
                  Powered by n8n
                </Badge>
              </div>
              <p className="mt-2 text-sm text-zinc-400 sm:text-base">
                n8n-powered support operations &amp; scam detection
              </p>
            </div>
            <div className="hidden h-12 w-12 items-center justify-center rounded-xl border border-[#2a2d3a] bg-[#1a1d27] sm:flex">
              <svg
                className="h-6 w-6 text-[#3b82f6]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* SECTION 2 — Stats */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Messages" value={stats.total} accent="#3b82f6" />
          <StatCard label="Open Tickets" value={stats.open} accent="#8b5cf6" />
          <StatCard
            label="Scam Alerts"
            value={stats.scams}
            accent="#ef4444"
            highlight="red"
          />
          <StatCard
            label="Escalated"
            value={stats.escalated}
            accent="#f97316"
            highlight="orange"
          />
        </section>

        {/* Simulator + Timeline */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* SECTION 3 — Message Simulator */}
          <div className="rounded-xl border border-[#2a2d3a] bg-[#1a1d27] p-5 shadow-lg transition-shadow hover:shadow-[#3b82f6]/5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-white">
                Message Simulator
              </h2>
              {fallbackMode && (
                <Badge className="animate-fade-in border-[#eab308]/50 bg-[#eab308]/15 text-[#fde047]">
                  Demo Fallback Mode
                </Badge>
              )}
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {DEMO_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setFormData(preset.data)}
                  className="rounded-lg border border-[#2a2d3a] bg-[#0f1117] px-2.5 py-1 text-xs text-zinc-300 transition hover:border-[#3b82f6]/50 hover:text-white"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <Field label="Customer Name">
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, customerName: e.target.value }))
                  }
                  className={inputClass}
                  placeholder="Customer name"
                />
              </Field>
              <Field label="Channel">
                <select
                  value={formData.channel}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      channel: e.target.value as SupportMessagePayload["channel"],
                    }))
                  }
                  className={inputClass}
                >
                  <option value="Web">Web</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Email">Email</option>
                  <option value="Facebook">Facebook</option>
                </select>
              </Field>
              <Field label="Order ID">
                <input
                  type="text"
                  value={formData.orderId ?? ""}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, orderId: e.target.value }))
                  }
                  className={inputClass}
                  placeholder="e.g. ORD-5550"
                />
              </Field>
              <Field label="Message">
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, message: e.target.value }))
                  }
                  className={inputClass}
                  placeholder="Enter customer message..."
                />
              </Field>
            </div>

            <button
              type="button"
              disabled={isLoading}
              onClick={handleSubmit}
              className="mt-4 w-full rounded-lg bg-[#3b82f6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Processing..." : "Process with n8n"}
            </button>

            {isLoading && loadingStep && (
              <div className="mt-4 animate-fade-in rounded-lg border border-[#2a2d3a] bg-[#0f1117] p-3">
                <div className="flex items-center gap-2 text-sm text-[#3b82f6]">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#3b82f6]" />
                  {loadingStep}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4 — Workflow Timeline */}
          <div className="rounded-xl border border-[#2a2d3a] bg-[#1a1d27] p-5">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Workflow
            </p>
            <h2 className="mb-2 text-lg font-semibold text-white">
              n8n Workflow Timeline
            </h2>
            <p className="mb-6 text-sm text-zinc-400">
              Every message passes through this n8n workflow
            </p>
            <div className="space-y-3">
              {WORKFLOW_STEPS.map((step, i) => (
                <div key={step.label}>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold text-white"
                      style={{
                        borderColor: step.color,
                        backgroundColor: `${step.color}22`,
                      }}
                    >
                      {i + 1}
                    </div>
                    <span className="text-sm font-medium text-zinc-200">
                      {step.label}
                    </span>
                  </div>
                  {i < WORKFLOW_STEPS.length - 1 && (
                    <div className="ml-[17px] flex h-4 items-center">
                      <div className="h-full w-0.5 bg-gradient-to-b from-[#2a2d3a] to-[#3b82f6]/40" />
                      <span className="ml-2 text-[#3b82f6]">↓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5 — Ticket Queue */}
        <section className="rounded-xl border border-[#2a2d3a] bg-[#1a1d27] p-5">
          <h2 className="mb-4 text-lg font-semibold text-white">Ticket Queue</h2>
          {tickets.length === 0 ? (
            <p className="py-12 text-center text-sm text-zinc-500">
              No tickets yet. Submit a message above to get started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#2a2d3a] text-xs uppercase tracking-wider text-zinc-500">
                    <th className="pb-3 pr-4 font-medium">Ticket ID</th>
                    <th className="pb-3 pr-4 font-medium">Customer</th>
                    <th className="pb-3 pr-4 font-medium">Intent</th>
                    <th className="pb-3 pr-4 font-medium">Priority</th>
                    <th className="pb-3 pr-4 font-medium">Risk Score</th>
                    <th className="pb-3 pr-4 font-medium">Risk Level</th>
                    <th className="pb-3 pr-4 font-medium">Department</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr
                      key={ticket.ticketId}
                      className="border-b border-[#2a2d3a]/60 transition hover:bg-[#0f1117]/50"
                    >
                      <td className="py-3 pr-4 font-mono text-xs text-zinc-300">
                        {ticket.ticketId}
                      </td>
                      <td className="py-3 pr-4 text-zinc-200">
                        {ticket.customerName ?? "—"}
                      </td>
                      <td className="py-3 pr-4 text-zinc-300">{ticket.intent}</td>
                      <td className="py-3 pr-4">
                        <Badge className={priorityClass(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`font-semibold ${riskScoreColor(ticket.riskScore)}`}
                        >
                          {ticket.riskScore}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge className={riskClass(ticket.riskLevel)}>
                          {ticket.riskLevel}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-zinc-400">
                        {ticket.department}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap items-center gap-1">
                          <Badge className={statusClass(ticket.status)}>
                            {ticket.status}
                          </Badge>
                          {ticket.scamDetected && (
                            <Badge className="border-red-500/50 bg-red-500/20 text-red-300">
                              SCAM
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        <button
                          type="button"
                          onClick={() => setSelectedTicket(ticket)}
                          className="rounded-md border border-[#3b82f6]/40 bg-[#3b82f6]/10 px-3 py-1 text-xs font-medium text-[#93c5fd] transition hover:bg-[#3b82f6]/20"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* SECTION 6 — Scam Alert Center */}
        <section className="rounded-xl border border-[#2a2d3a] bg-[#1a1d27] p-5">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Scam &amp; Risk Alerts
          </h2>
          {alertTickets.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">
              No active scam alerts
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {alertTickets.map((ticket) => (
                <div
                  key={ticket.ticketId}
                  className={`animate-fade-in rounded-lg border-2 bg-[#0f1117] p-4 ${
                    ticket.scamDetected
                      ? "border-red-500/60"
                      : "border-orange-500/50"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <Badge
                      className={
                        ticket.riskLevel === "Critical"
                          ? "border-red-500/50 bg-red-500/20 text-red-300"
                          : "border-orange-500/50 bg-orange-500/20 text-orange-300"
                      }
                    >
                      {ticket.riskLevel}
                    </Badge>
                    <span className="font-mono text-xs text-zinc-500">
                      {ticket.ticketId}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white">
                    {ticket.scamType !== "None"
                      ? ticket.scamType
                      : "Elevated Risk"}
                  </p>
                  {ticket.scamFlags.length > 0 && (
                    <ul className="mt-2 space-y-1 text-xs text-red-300/90">
                      {ticket.scamFlags.slice(0, 2).map((flag) => (
                        <li key={flag}>• {flag}</li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-400">
                    <span>{ticket.department}</span>
                    <span>·</span>
                    <Badge className={statusClass(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* SECTION 7 — Ticket Detail Modal */}
      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  highlight,
}: {
  label: string;
  value: number;
  accent: string;
  highlight?: "red" | "orange";
}) {
  const border =
    highlight === "red"
      ? "border-red-500/30"
      : highlight === "orange"
        ? "border-orange-500/30"
        : "border-[#2a2d3a]";
  const valueColor =
    highlight === "red"
      ? "text-red-400"
      : highlight === "orange"
        ? "text-orange-400"
        : "text-white";

  return (
    <div
      className={`rounded-xl border bg-[#1a1d27] p-4 transition hover:shadow-lg ${border}`}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className={`mt-1 text-3xl font-bold ${valueColor}`}>{value}</p>
      <div
        className="mt-2 h-1 w-12 rounded-full"
        style={{ backgroundColor: accent }}
      />
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-zinc-400">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-[#2a2d3a] bg-[#0f1117] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-[#3b82f6]/60 focus:ring-1 focus:ring-[#3b82f6]/30";

function TicketModal({
  ticket,
  onClose,
}: {
  ticket: SupportTicket;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 transition"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div className="animate-modal-in relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[#2a2d3a] bg-[#1a1d27] p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-zinc-400 transition hover:bg-[#2a2d3a] hover:text-white"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="pr-8 text-xl font-bold text-white">{ticket.ticketId}</h3>

        <blockquote className="mt-4 rounded-lg border-l-4 border-[#3b82f6] bg-[#0f1117] px-4 py-3 text-sm italic text-zinc-300">
          &ldquo;{ticket.originalMessage}&rdquo;
        </blockquote>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="font-medium text-white">{ticket.customerName}</span>
          <Badge className="border-[#2a2d3a] bg-[#0f1117] text-zinc-300">
            {ticket.channel}
          </Badge>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <DetailItem label="Order Status" value={ticket.orderStatus} />
          <DetailItem label="Department" value={ticket.department} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge className="border-[#2a2d3a] bg-[#0f1117] text-zinc-200">
            {ticket.intent}
          </Badge>
          <Badge className={priorityClass(ticket.priority)}>
            {ticket.priority}
          </Badge>
          <Badge className={statusClass(ticket.status)}>{ticket.status}</Badge>
        </div>

        <div className="mt-6 flex items-end gap-4">
          <div>
            <p className="text-xs text-zinc-500">Risk Score</p>
            <p
              className={`text-5xl font-bold ${riskScoreColor(ticket.riskScore)}`}
            >
              {ticket.riskScore}
            </p>
          </div>
          <Badge className={`mb-2 ${riskClass(ticket.riskLevel)}`}>
            {ticket.riskLevel}
          </Badge>
        </div>

        {ticket.scamDetected && (
          <div className="mt-4">
            <p className="text-xs font-medium uppercase text-red-400">
              Scam Type
            </p>
            <p className="text-sm text-red-300">{ticket.scamType}</p>
            {ticket.scamFlags.length > 0 && (
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-red-300/90">
                {ticket.scamFlags.map((flag) => (
                  <li key={flag}>{flag}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="mt-4">
          <p className="text-xs font-medium text-zinc-500">AI Reasoning</p>
          <p className="mt-1 text-sm italic text-zinc-400">{ticket.reasoning}</p>
        </div>

        <div className="mt-4 rounded-lg border border-[#22c55e]/30 bg-[#22c55e]/10 p-4">
          <p className="text-xs font-medium text-[#22c55e]">
            Generated Safe Reply
          </p>
          <p className="mt-2 text-sm text-zinc-200">{ticket.generatedReply}</p>
        </div>

        <div className="mt-4">
          <p className="text-xs font-medium text-zinc-500">Workflow Actions</p>
          <ol className="mt-2 space-y-2">
            {ticket.workflowActions.map((action, i) => (
              <li key={action} className="flex items-start gap-2 text-sm text-zinc-300">
                <span className="text-[#22c55e]">✓</span>
                <span>
                  {i + 1}. {action}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-sm font-medium text-zinc-200">{value}</p>
    </div>
  );
}
