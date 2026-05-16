import { useState } from "react";
import type { Channel, SupportMessagePayload } from "@/types/support";

const CHANNELS: Channel[] = ["Web", "WhatsApp", "Email", "Facebook"];

type DemoPreset = {
  label: string;
  customerName: string;
  channel: Channel;
  orderId: string;
  message: string;
  accent: "danger" | "warning" | "default";
};

const DEMO_PRESETS: DemoPreset[] = [
  {
    label: "Scam Payment Link",
    customerName: "Nimal",
    channel: "Web",
    orderId: "ORD-5550",
    message:
      "I paid for ORD-5550 but it still says pending. I also got a link asking me to pay delivery again: http://fast-delivery-prize.com",
    accent: "danger",
  },
  {
    label: "Damaged Product",
    customerName: "Kasun",
    channel: "WhatsApp",
    orderId: "ORD-3011",
    message: "My product arrived damaged. I want a replacement or refund.",
    accent: "default",
  },
  {
    label: "Delivery Delay",
    customerName: "Ayesha",
    channel: "Email",
    orderId: "ORD-2048",
    message: "Where is my delivery? It was supposed to arrive today.",
    accent: "default",
  },
  {
    label: "Refund Abuse",
    customerName: "Kasun",
    channel: "Web",
    orderId: "ORD-3011",
    message:
      "I want another refund for this order. This is the third time I am reporting an issue.",
    accent: "warning",
  },
  {
    label: "OTP Scam",
    customerName: "Sanduni",
    channel: "Facebook",
    orderId: "ORD-2048",
    message:
      "Someone called me saying they are from your delivery team and asked for my OTP to confirm delivery.",
    accent: "danger",
  },
];

const accentStyles = {
  danger:
    "border-red-300 bg-red-50 text-red-900 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/50 dark:text-red-100 dark:hover:bg-red-950",
  warning:
    "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100 dark:hover:bg-amber-950",
  default:
    "border-zinc-300 bg-zinc-50 text-zinc-900 hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800",
};

type MessageSimulatorProps = {
  onSubmit: (payload: SupportMessagePayload) => void;
  loading: boolean;
};

export function MessageSimulator({ onSubmit, loading }: MessageSimulatorProps) {
  const [customerName, setCustomerName] = useState("Nimal Perera");
  const [channel, setChannel] = useState<Channel>("Web");
  const [message, setMessage] = useState(
    "I paid for ORD-1024 but it still says pending."
  );
  const [orderId, setOrderId] = useState("ORD-1024");

  function applyPreset(preset: DemoPreset) {
    setCustomerName(preset.customerName);
    setChannel(preset.channel);
    setOrderId(preset.orderId);
    setMessage(preset.message);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const payload: SupportMessagePayload = {
      customerName: customerName.trim(),
      channel,
      message: message.trim(),
      orderId: orderId.trim(),
    };
    onSubmit(payload);
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
        Message simulator
      </h2>

      <div className="mt-3 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-3 dark:border-zinc-600 dark:bg-zinc-900/50">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
          Quick demo scenarios
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {DEMO_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              disabled={loading}
              onClick={() => applyPreset(preset)}
              className={`min-w-[8.5rem] rounded-lg border-2 px-3 py-2.5 text-left text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 ${accentStyles[preset.accent]}`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Customer name
          <input
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Channel
          <select
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            value={channel}
            onChange={(e) => setChannel(e.target.value as Channel)}
          >
            {CHANNELS.map((ch) => (
              <option key={ch} value={ch}>
                {ch}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Order ID (optional)
          <input
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="ORD-1024"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Message
          <textarea
            className="min-h-24 rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {loading ? "Processing…" : "Process with n8n"}
        </button>
      </form>
    </section>
  );
}


