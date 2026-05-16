import type { SupportTicket } from "@/types/support";

type DepartmentBoardProps = {
  tickets: SupportTicket[];
};

function riskAccent(ticket: SupportTicket) {
  switch (ticket.riskLevel) {
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
    <section className="app-card p-5 sm:p-6">
      <header className="mb-4">
        <h2 className="text-lg font-bold text-slate-900">Department Board</h2>
        <p className="mt-1 text-sm text-slate-500">
          How tickets are routed across your teams this week
        </p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {departments.length === 0 && (
          <p className="col-span-full text-sm text-slate-500">
            No routed tickets this week.
          </p>
        )}
        {departments.map((department) => (
          <article
            key={department}
            className="rounded-xl border border-slate-200 bg-slate-50 p-3"
          >
            <h3 className="text-sm font-semibold text-slate-900">{department}</h3>
            <p className="text-xs text-slate-500">
              {byDepartment[department].length} tickets
            </p>
            <ul className="mt-2 max-h-28 space-y-1 overflow-y-auto app-scrollbar">
              {byDepartment[department].map((ticket) => (
                <li
                  key={ticket.ticketId}
                  className={`rounded border border-slate-200 border-l-2 bg-white px-2 py-1 font-mono text-[10px] text-slate-600 ${riskAccent(ticket)}`}
                >
                  {ticket.ticketId}
                  {ticket.scamDetected ? " 🚨" : ""}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
