import type { SupportTicket } from "@/types/support";

type DepartmentBoardProps = {
  tickets: SupportTicket[];
};

export function DepartmentBoard({ tickets }: DepartmentBoardProps) {
  const byDepartment = tickets.reduce<Record<string, SupportTicket[]>>(
    (acc, ticket) => {
      const key = ticket.department;
      if (!acc[key]) acc[key] = [];
      acc[key].push(ticket);
      return acc;
    },
    {}
  );

  const departments = Object.keys(byDepartment).sort();

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
        Department board
      </h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {departments.length === 0 && (
          <p className="text-sm text-zinc-500">No routed tickets yet.</p>
        )}
        {departments.map((department) => (
          <article
            key={department}
            className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700"
          >
            <h3 className="text-sm font-medium">{department}</h3>
            <ul className="mt-2 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
              {byDepartment[department].map((ticket) => (
                <li key={ticket.ticketId}>
                  {ticket.ticketId} · {ticket.intent} ({ticket.status})
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
