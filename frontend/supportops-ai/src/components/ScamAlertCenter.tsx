import type { SupportTicket } from "@/types/support";

type ScamAlertCenterProps = {
  tickets: SupportTicket[];
  onSelectTicket: (ticket: SupportTicket) => void;
};

export function ScamAlertCenter({
  tickets,
  onSelectTicket,
}: ScamAlertCenterProps) {
  return (
    <section className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-900 dark:bg-red-950/30">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-red-700 dark:text-red-300">
        Scam alert center
      </h2>
      <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto">
        {tickets.length === 0 && (
          <li className="text-sm text-red-600/80 dark:text-red-300/80">
            No active scam alerts.
          </li>
        )}
        {tickets.map((ticket) => (
          <li key={ticket.ticketId}>
            <button
              type="button"
              onClick={() => onSelectTicket(ticket)}
              className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-left text-sm dark:border-red-800 dark:bg-zinc-950"
            >
              <span className="font-medium">{ticket.ticketId}</span>
              <p className="mt-1 text-xs text-red-700 dark:text-red-300">
                Risk {ticket.riskScore} · {ticket.scamType || ticket.intent}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
