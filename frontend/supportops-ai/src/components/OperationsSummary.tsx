import type { SupportTicket } from "@/types/support";

type OperationsSummaryProps = {
  tickets: SupportTicket[];
};

export function OperationsSummary({ tickets }: OperationsSummaryProps) {
  const scamAlerts = tickets.filter(
    (t) => t.scamDetected || t.riskScore >= 60
  ).length;
  const escalated = tickets.filter((t) => t.status === "Escalated").length;
  const openTickets = tickets.filter((t) => t.status !== "Resolved").length;

  const rows = [
    { label: "Scam / high-risk alerts", value: scamAlerts },
    { label: "Escalated tickets", value: escalated },
    { label: "Auto-replied (processed)", value: tickets.length },
    { label: "Open tickets", value: openTickets },
  ];

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
        Operations summary
      </h2>
      <ul className="mt-3 space-y-2 text-sm">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-900"
          >
            <span className="text-zinc-600 dark:text-zinc-400">{row.label}</span>
            <span className="font-semibold">{row.value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
