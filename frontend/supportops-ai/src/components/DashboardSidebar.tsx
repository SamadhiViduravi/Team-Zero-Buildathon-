"use client";

import {
  AlertTriangle,
  Building2,
  FlaskConical,
  GitBranch,
  LayoutDashboard,
  Ticket,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type DashboardView =
  | "overview"
  | "tickets"
  | "scams"
  | "departments"
  | "workflow"
  | "dev-tools";

type NavItem = {
  id: DashboardView;
  label: string;
  description: string;
  icon: LucideIcon;
  badge?: number;
  devOnly?: boolean;
};

type DashboardSidebarProps = {
  activeView: DashboardView;
  onNavigate: (view: DashboardView) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showDevTools: boolean;
  onToggleDevTools: () => void;
  badges?: Partial<Record<DashboardView, number>>;
};

export function DashboardSidebar({
  activeView,
  onNavigate,
  open,
  onOpenChange,
  showDevTools,
  onToggleDevTools,
  badges = {},
}: DashboardSidebarProps) {
  const navItems: NavItem[] = [
    {
      id: "overview",
      label: "Overview",
      description: "Stats & summary",
      icon: LayoutDashboard,
    },
    {
      id: "tickets",
      label: "Ticket Queue",
      description: "This week's messages",
      icon: Ticket,
      badge: badges.tickets,
    },
    {
      id: "scams",
      label: "Scam Alerts",
      description: "High-risk flags",
      icon: AlertTriangle,
      badge: badges.scams,
    },
    {
      id: "departments",
      label: "Departments",
      description: "Team routing board",
      icon: Building2,
    },
    {
      id: "workflow",
      label: "n8n Workflow",
      description: "Pipeline status",
      icon: GitBranch,
    },
    {
      id: "dev-tools",
      label: "Test Simulator",
      description: "Dev / demo only",
      icon: FlaskConical,
      devOnly: true,
    },
  ];

  const visibleItems = navItems.filter(
    (item) => !item.devOnly || showDevTools
  );

  function handleNav(id: DashboardView) {
    onNavigate(id);
    onOpenChange(false);
  }

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 lg:py-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            Navigation
          </p>
          <p className="mt-0.5 text-sm text-slate-500">Jump to any section</p>
        </div>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3 app-scrollbar">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNav(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 ${
                active
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  active ? "bg-white/20" : "bg-slate-100 text-blue-600"
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="block text-sm font-semibold">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        active
                          ? "bg-white/25 text-white"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </span>
                <span
                  className={`block truncate text-xs ${
                    active ? "text-blue-100" : "text-slate-500"
                  }`}
                >
                  {item.description}
                </span>
              </span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-amber-300 bg-amber-50 px-3 py-2.5">
          <span className="text-xs text-amber-900">
            <span className="font-semibold">Test simulator</span>
            <br />
            Not for production
          </span>
          <input
            type="checkbox"
            checked={showDevTools}
            onChange={onToggleDevTools}
            className="h-4 w-4 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
          />
        </label>
      </div>
    </>
  );

  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          aria-label="Close menu overlay"
          onClick={() => onOpenChange(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(100vw-3rem,280px)] flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 ease-out lg:static lg:z-auto lg:w-64 lg:translate-x-0 lg:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
