import type { SupportTicket } from "@/types/support";
import { Bot } from "lucide-react";

type OperationsSummaryProps = {
  tickets: SupportTicket[];
};

export function OperationsSummary({ tickets }: OperationsSummaryProps) {
  const scamAlerts = tickets.filter(
    (t) => t.scamDetected || t.riskScore >= 60
  ).length;
  const escalated = tickets.filter((t) => t.status === "Escalated").length;
  const openTickets = tickets.filter((t) => t.status !== "Resolved").length;

  const summaryText =
    tickets.length === 0
      ? "No messages this week yet. Incoming customer messages will appear in the ticket queue after n8n processes them."
      : `This week: ${tickets.length} messages processed, ${scamAlerts} risk flags, ${escalated} escalations, and ${tickets.length} safe auto-replies sent.`;

  const rows = [
    { label: "Scam / high-risk", value: scamAlerts },
    { label: "Escalated", value: escalated },
    { label: "Open tickets", value: openTickets },
    { label: "Auto-replied", value: tickets.length },
  ];

  return (
    <section className="app-card p-5 sm:p-6">
      <header className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
          <Bot className="h-5 w-5" aria-hidden />
        </span>
        <h2 className="text-base font-bold text-slate-900">AI Operations Summary</h2>
      </header>
      <p className="text-sm leading-relaxed text-slate-600">{summaryText}</p>
      {tickets.length > 0 && (
        <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {rows.map((row) => (
            <li
              key={row.label}
              className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5"
            >
              <span className="block text-[10px] font-medium uppercase tracking-wide text-slate-500">
                {row.label}
              </span>
              <span className="text-xl font-bold text-slate-900">{row.value}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
