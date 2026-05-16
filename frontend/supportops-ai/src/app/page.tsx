"use client";

import { useMemo, useState } from "react";
import { DepartmentBoard } from "@/components/DepartmentBoard";
import { Header } from "@/components/Header";
import { IntegrationStatusPanel } from "@/components/IntegrationStatusPanel";
import { MessageSimulator } from "@/components/MessageSimulator";
import { OperationsSummary } from "@/components/OperationsSummary";
import { ScamAlertCenter } from "@/components/ScamAlertCenter";
import { StatCard } from "@/components/StatCard";
import { TicketDetailModal } from "@/components/TicketDetailModal";
import { TicketQueue } from "@/components/TicketQueue";
import { WorkflowTimeline } from "@/components/WorkflowTimeline";
import { initialTickets } from "@/lib/mockData";
import { submitSupportMessage } from "@/lib/submitSupportMessage";
import type { SupportMessagePayload, SupportTicket } from "@/types/support";

const webhookConfigured = Boolean(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL);

export default function Home() {
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    initialTickets[0] ?? null
  );
  const [loading, setLoading] = useState(false);
  const [fallbackUsed, setFallbackUsed] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const scamAlerts = useMemo(
    () =>
      tickets.filter(
        (ticket) => ticket.scamDetected || ticket.riskScore >= 60
      ),
    [tickets]
  );

  const escalated = useMemo(
    () => tickets.filter((ticket) => ticket.status === "Escalated"),
    [tickets]
  );

  const autoReplied = tickets.length;

  const openTickets = useMemo(
    () => tickets.filter((ticket) => ticket.status !== "Resolved"),
    [tickets]
  );

  async function handleProcessMessage(payload: SupportMessagePayload) {
    setLoading(true);
    try {
      const result = await submitSupportMessage(payload);
      setTickets((prev) => [result.ticket, ...prev]);
      setSelectedTicket(result.ticket);
      setFallbackUsed(result.fallback);
      setHasProcessed(true);
      setDetailOpen(true);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectTicket(ticket: SupportTicket) {
    setSelectedTicket(ticket);
    setDetailOpen(true);
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
      <Header />

      <p
        className={`mt-4 inline-flex rounded-full px-3 py-1 text-sm font-medium ${
          webhookConfigured
            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
            : "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200"
        }`}
        role="status"
      >
        {webhookConfigured
          ? "n8n webhook configured"
          : "Demo fallback mode — n8n webhook not configured"}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Open tickets"
          value={openTickets.length}
          description="Not resolved"
        />
        <StatCard
          label="Scam alerts"
          value={scamAlerts.length}
          description="Scam flagged or risk ≥ 60"
        />
        <StatCard label="Escalated" value={escalated.length} />
        <StatCard
          label="Processed"
          value={autoReplied}
          description="Total in queue"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <IntegrationStatusPanel
            key={loading ? "loading" : "idle"}
            loading={loading}
            fallbackUsed={fallbackUsed}
            hasProcessed={hasProcessed}
          />
          <MessageSimulator onSubmit={handleProcessMessage} loading={loading} />
          <OperationsSummary tickets={tickets} />
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-6 md:grid-cols-2">
            <TicketQueue tickets={tickets} onSelectTicket={handleSelectTicket} />
            <ScamAlertCenter
              tickets={scamAlerts}
              onSelectTicket={handleSelectTicket}
            />
          </div>
          <WorkflowTimeline
            actions={selectedTicket?.workflowActions}
          />
          <DepartmentBoard tickets={tickets} />
        </div>
      </div>

      <TicketDetailModal
        ticket={detailOpen ? selectedTicket : null}
        onClose={() => setDetailOpen(false)}
      />
    </main>
  );
}
