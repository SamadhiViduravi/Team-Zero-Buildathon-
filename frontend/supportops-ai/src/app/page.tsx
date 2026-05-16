"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DashboardSidebar,
  type DashboardView,
} from "@/components/DashboardSidebar";
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
import { formatWeekLabel, isWithinCurrentWeek } from "@/lib/dateUtils";
import { initialTickets } from "@/lib/mockData";
import { submitSupportMessage } from "@/lib/submitSupportMessage";
import type { SupportMessagePayload, SupportTicket } from "@/types/support";

const webhookConfigured = Boolean(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL);
const SIMULATOR_ENV = process.env.NEXT_PUBLIC_SHOW_SIMULATOR === "true";

const VIEW_TITLES: Record<DashboardView, string> = {
  overview: "Overview",
  tickets: "Ticket Queue",
  scams: "Scam Alerts",
  departments: "Departments",
  workflow: "n8n Workflow",
  "dev-tools": "Test Simulator",
};

export default function Home() {
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    initialTickets[0] ?? null
  );
  const [loading, setLoading] = useState(false);
  const [fallbackUsed, setFallbackUsed] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeView, setActiveView] = useState<DashboardView>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDevTools, setShowDevTools] = useState(SIMULATOR_ENV);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("supportops-show-simulator");
      if (stored !== null) setShowDevTools(stored === "true");
    } catch {
      /* ignore */
    }
  }, []);

  function handleToggleDevTools() {
    setShowDevTools((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("supportops-show-simulator", String(next));
      } catch {
        /* ignore */
      }
      if (!next && activeView === "dev-tools") {
        setActiveView("overview");
      }
      return next;
    });
  }

  const weeklyTickets = useMemo(
    () => tickets.filter((t) => isWithinCurrentWeek(t.createdAt)),
    [tickets]
  );

  const scamAlerts = useMemo(
    () =>
      weeklyTickets.filter(
        (ticket) => ticket.scamDetected || ticket.riskScore >= 60
      ),
    [weeklyTickets]
  );

  const escalated = useMemo(
    () => weeklyTickets.filter((ticket) => ticket.status === "Escalated"),
    [weeklyTickets]
  );

  const openTickets = useMemo(
    () => weeklyTickets.filter((ticket) => ticket.status !== "Resolved"),
    [weeklyTickets]
  );

  async function handleProcessMessage(payload: SupportMessagePayload) {
    setLoading(true);
    try {
      const result = await submitSupportMessage(payload);
      const withDate: SupportTicket = {
        ...result.ticket,
        createdAt: result.ticket.createdAt ?? new Date().toISOString(),
      };
      setTickets((prev) => [withDate, ...prev]);
      setSelectedTicket(withDate);
      setFallbackUsed(result.fallback);
      setHasProcessed(true);
      setDetailOpen(true);
      setActiveView("tickets");
    } finally {
      setLoading(false);
    }
  }

  function handleSelectTicket(ticket: SupportTicket) {
    setSelectedTicket(ticket);
    setDetailOpen(true);
  }

  const workflowActiveStep = loading ? 4 : hasProcessed ? 8 : 0;
  const weekLabel = formatWeekLabel();

  return (
    <div className="flex min-h-screen w-full">
      <DashboardSidebar
        activeView={activeView}
        onNavigate={setActiveView}
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        showDevTools={showDevTools}
        onToggleDevTools={handleToggleDevTools}
        badges={{
          tickets: weeklyTickets.length,
          scams: scamAlerts.length,
        }}
      />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:ml-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                {VIEW_TITLES[activeView]}
              </h2>
              {activeView === "tickets" && (
                <p className="mt-1 text-sm text-slate-500">
                  Messages received this week · {weekLabel}
                </p>
              )}
            </div>
            <p
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                webhookConfigured
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                  : "bg-amber-50 text-amber-800 ring-1 ring-amber-200"
              }`}
              role="status"
            >
              {webhookConfigured ? "n8n connected" : "Demo mode"}
            </p>
          </div>

          {activeView === "overview" && (
            <div className="space-y-6 animate-app-slide-in">
              <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                <StatCard
                  variant="messages"
                  label="This week"
                  value={weeklyTickets.length}
                  description="Messages received"
                />
                <StatCard
                  variant="scam"
                  label="Scam alerts"
                  value={scamAlerts.length}
                />
                <StatCard
                  variant="escalated"
                  label="Escalated"
                  value={escalated.length}
                />
                <StatCard
                  variant="open"
                  label="Open tickets"
                  value={openTickets.length}
                />
                <StatCard
                  variant="auto"
                  label="Auto-replied"
                  value={weeklyTickets.length}
                />
              </section>
              <IntegrationStatusPanel
                key={loading ? "loading" : "idle"}
                loading={loading}
                fallbackUsed={fallbackUsed}
                hasProcessed={hasProcessed}
              />
              <OperationsSummary tickets={weeklyTickets} />
            </div>
          )}

          {activeView === "tickets" && (
            <div className="animate-app-slide-in">
              <TicketQueue
                tickets={weeklyTickets}
                onSelectTicket={handleSelectTicket}
                weekLabel={weekLabel}
              />
            </div>
          )}

          {activeView === "scams" && (
            <div className="animate-app-slide-in">
              <ScamAlertCenter
                tickets={scamAlerts}
                onSelectTicket={handleSelectTicket}
              />
            </div>
          )}

          {activeView === "departments" && (
            <div className="animate-app-slide-in">
              <DepartmentBoard tickets={weeklyTickets} />
            </div>
          )}

          {activeView === "workflow" && (
            <div className="animate-app-slide-in">
              <WorkflowTimeline
                activeStep={workflowActiveStep}
                actions={selectedTicket?.workflowActions}
              />
            </div>
          )}

          {activeView === "dev-tools" && showDevTools && (
            <div className="mx-auto max-w-xl animate-app-slide-in space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <strong>Development tool</strong> — Use this to test how
                customer messages flow into the ticket queue. Hide via the
                sidebar toggle before demo or production.
              </div>
              <MessageSimulator
                onSubmit={handleProcessMessage}
                isLoading={loading}
                loadingStep={loading ? "Processing via n8n workflow…" : ""}
              />
            </div>
          )}
        </main>
      </div>

      <TicketDetailModal
        ticket={detailOpen ? selectedTicket : null}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}
