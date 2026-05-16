"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Inbox,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

export type StatVariant =
  | "messages"
  | "scam"
  | "escalated"
  | "open"
  | "auto";

type StatCardProps = {
  label: string;
  value: number;
  description?: string;
  variant: StatVariant;
};

const variantConfig: Record<
  StatVariant,
  { bg: string; icon: LucideIcon; bar: string; iconColor: string }
> = {
  messages: {
    bg: "from-blue-50 to-white border-blue-100",
    bar: "bg-blue-500",
    icon: MessageSquare,
    iconColor: "text-blue-600 bg-blue-100",
  },
  scam: {
    bg: "from-red-50 to-white border-red-100",
    bar: "bg-red-500",
    icon: AlertTriangle,
    iconColor: "text-red-600 bg-red-100",
  },
  escalated: {
    bg: "from-orange-50 to-white border-orange-100",
    bar: "bg-orange-500",
    icon: ArrowUpRight,
    iconColor: "text-orange-600 bg-orange-100",
  },
  open: {
    bg: "from-violet-50 to-white border-violet-100",
    bar: "bg-violet-500",
    icon: Inbox,
    iconColor: "text-violet-600 bg-violet-100",
  },
  auto: {
    bg: "from-emerald-50 to-white border-emerald-100",
    bar: "bg-emerald-500",
    icon: CheckCircle2,
    iconColor: "text-emerald-600 bg-emerald-100",
  },
};

function useCountUp(target: number, duration = 500) {
  const [display, setDisplay] = useState(target);

  useEffect(() => {
    const start = display;
    const diff = target - start;
    if (diff === 0) return;

    const startTime = performance.now();
    let frame: number;

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return display;
}

export function StatCard({
  label,
  value,
  description,
  variant,
}: StatCardProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;
  const displayValue = useCountUp(value);

  return (
    <article
      className={`app-card relative overflow-hidden bg-gradient-to-br p-4 ${config.bg}`}
    >
      <Icon
        className="pointer-events-none absolute -right-1 -top-1 h-16 w-16 text-slate-900/[0.04]"
        strokeWidth={1.25}
        aria-hidden
      />
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">
              {displayValue}
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
          </p>
          {description && (
            <p className="mt-0.5 text-[11px] text-slate-500">{description}</p>
          )}
        </div>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${config.iconColor}`}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <span
        className={`absolute bottom-0 left-0 right-0 h-0.5 ${config.bar}`}
        aria-hidden
      />
    </article>
  );
}
