"use client";

import { Loader2, Zap } from "lucide-react";
import { useState } from "react";

type SupportMessagePayload = {
  customerName: string;
  channel: "Web" | "WhatsApp" | "Email" | "Facebook";
  message: string;
  orderId?: string;
};

type MessageSimulatorProps = {
  onSubmit: (payload: SupportMessagePayload) => void;
  isLoading: boolean;
  loadingStep: string;
};

const CHANNELS: SupportMessagePayload["channel"][] = [
  "Web",
  "WhatsApp",
  "Email",
  "Facebook",
];

const DEMO_SCENARIOS: {
  label: string;
  data: SupportMessagePayload;
  buttonClass: string;
}[] = [
  {
    label: "🚨 Scam Payment Link",
    buttonClass:
      "border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 hover:scale-[1.02]",
    data: {
      customerName: "Nimal Perera",
      channel: "Web",
      orderId: "ORD-5550",
      message:
        "I paid for ORD-5550 but it still says pending. I also got a link asking me to pay delivery again: http://fast-delivery-prize.lk/pay",
    },
  },
  {
    label: "☎️ OTP Scam",
    buttonClass:
      "border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400 hover:scale-[1.02]",
    data: {
      customerName: "Ayesha Fernando",
      channel: "WhatsApp",
      orderId: "",
      message:
        "Someone called me claiming to be from your company and asked for my OTP to confirm my delivery. I already gave it. What should I do now?",
    },
  },
  {
    label: "📦 Damaged Product",
    buttonClass:
      "border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 hover:scale-[1.02]",
    data: {
      customerName: "Kasun Jayawardena",
      channel: "Email",
      orderId: "ORD-3011",
      message:
        "My product arrived completely damaged. The box was broken and the item inside is unusable. I need a refund immediately.",
    },
  },
  {
    label: "🚚 Delivery Delay",
    buttonClass:
      "border-violet-300 text-violet-700 hover:bg-violet-50 hover:border-violet-400 hover:scale-[1.02]",
    data: {
      customerName: "Ayesha Silva",
      channel: "WhatsApp",
      orderId: "ORD-2048",
      message:
        "Where is my delivery? I ordered 3 days ago and still nothing has arrived. Please update me on my order status.",
    },
  },
  {
    label: "🔄 Refund Abuse",
    buttonClass:
      "border-amber-300 text-amber-800 hover:bg-amber-50 hover:border-amber-400 hover:scale-[1.02]",
    data: {
      customerName: "Kasun Jay",
      channel: "Web",
      orderId: "ORD-3011",
      message:
        "I want another refund for ORD-3011. The product was damaged again. This is the third time I am asking.",
    },
  },
];

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 transition-all duration-200";

export function MessageSimulator({
  onSubmit,
  isLoading,
  loadingStep,
}: MessageSimulatorProps) {
  const [customerName, setCustomerName] = useState("");
  const [channel, setChannel] =
    useState<SupportMessagePayload["channel"]>("Web");
  const [orderId, setOrderId] = useState("");
  const [message, setMessage] = useState("");

  const fillDemo = (data: SupportMessagePayload) => {
    setCustomerName(data.customerName);
    setChannel(data.channel);
    setOrderId(data.orderId ?? "");
    setMessage(data.message);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({
      customerName: customerName.trim(),
      channel,
      message: message.trim(),
      orderId: orderId.trim() || undefined,
    });
  };

  return (
    <section className="app-card p-5 sm:p-6">
      <header className="mb-4">
        <h2 className="text-lg font-bold text-slate-900">Message Simulator</h2>
        <p className="mt-1 text-sm text-slate-500">
          Test how messages are added to the queue (dev only)
        </p>
      </header>

      <div className="app-scrollbar -mx-1 mb-4 flex gap-2 overflow-x-auto pb-1">
        {DEMO_SCENARIOS.map((scenario) => (
          <button
            key={scenario.label}
            type="button"
            onClick={() => fillDemo(scenario.data)}
            disabled={isLoading}
            className={`shrink-0 rounded-full border-2 bg-white px-3 py-1.5 text-xs font-medium transition-all duration-200 disabled:opacity-50 ${scenario.buttonClass}`}
          >
            {scenario.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Customer name
          </span>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
            disabled={isLoading}
            className={inputClass}
            placeholder="e.g. Nimal Perera"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Channel
          </span>
          <select
            value={channel}
            onChange={(e) =>
              setChannel(e.target.value as SupportMessagePayload["channel"])
            }
            disabled={isLoading}
            className={inputClass}
          >
            {CHANNELS.map((ch) => (
              <option key={ch} value={ch}>
                {ch}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Order ID (optional)
          </span>
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            disabled={isLoading}
            className={inputClass}
            placeholder="ORD-1234"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Message
          </span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            disabled={isLoading}
            rows={4}
            className={`${inputClass} min-h-[6rem] resize-y`}
            placeholder="Enter the customer message..."
          />
        </label>

        <footer>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all duration-200 hover:bg-blue-700 disabled:opacity-60 sm:w-auto"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Zap className="h-4 w-4" aria-hidden />
            )}
            Process with n8n
          </button>
          {isLoading && loadingStep ? (
            <p className="mt-2 text-xs text-slate-500">{loadingStep}</p>
          ) : null}
        </footer>
      </form>
    </section>
  );
}
