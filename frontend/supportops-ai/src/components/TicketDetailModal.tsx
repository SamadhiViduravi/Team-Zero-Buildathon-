import type { SupportTicket } from "@/types/support";

type TicketDetailModalProps = {
  ticket: SupportTicket | null;
  onClose: () => void;
};

export function TicketDetailModal({ ticket, onClose }: TicketDetailModalProps) {
  if (!ticket) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-950">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold">{ticket.ticketId}</h2>
          <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            Close
          </button>
        </div>
        <dl className="mt-4 space-y-2 text-sm">
          <Row label="Intent" value={ticket.intent} />
          <Row label="Priority" value={ticket.priority} />
          <Row label="Department" value={ticket.department} />
          <Row label="Status" value={ticket.status} />
          <Row label="Risk" value={`${ticket.riskScore} (${ticket.riskLevel})`} />
          <Row label="Scam" value={ticket.scamDetected ? "Yes" : "No"} />
          <Row label="Order status" value={ticket.orderStatus} />
          <Row label="Reasoning" value={ticket.reasoning} />
          <Row label="Reply" value={ticket.generatedReply} />
        </dl>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-medium text-zinc-500">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
