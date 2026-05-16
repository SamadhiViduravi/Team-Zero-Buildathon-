import type { SupportTicket } from "@/types/support";

type TicketQueueProps = {
  tickets: SupportTicket[];
  onSelectTicket: (ticket: SupportTicket) => void;
};

export function TicketQueue({ tickets, onSelectTicket }: TicketQueueProps) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
        Ticket queue
      </h2>
      <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto">
        {tickets.length === 0 && (
          <li className="text-sm text-zinc-500">No tickets yet.</li>
        )}
        {tickets.map((ticket) => (
          <li key={ticket.ticketId}>
            <button
              type="button"
              onClick={() => onSelectTicket(ticket)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{ticket.ticketId}</span>
                <span className="text-xs text-zinc-500">{ticket.status}</span>
              </div>
              <p className="mt-1 truncate text-zinc-600 dark:text-zinc-400">
                {ticket.intent} · {ticket.priority}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
