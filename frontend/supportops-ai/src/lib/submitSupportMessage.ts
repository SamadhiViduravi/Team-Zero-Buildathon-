import type {
  Priority,
  RiskLevel,
  SupportMessagePayload,
  SupportTicket,
  TicketStatus,
} from "@/types/support";

const SCAM_KEYWORDS = [
  "http",
  "link",
  "otp",
  "password",
  "card",
  "pay again",
  "delivery fee",
  "bank transfer",
  "prize",
] as const;

type N8nWebhookBody = {
  customerName: string;
  channel: SupportMessagePayload["channel"];
  message: string;
  orderId?: string;
};

type N8nTicketCore = Omit<
  SupportTicket,
  "originalMessage" | "customerName" | "channel" | "createdAt"
>;

export async function submitSupportMessage(
  payload: SupportMessagePayload
): Promise<{ ticket: SupportTicket; fallback: boolean }> {
  const url = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL?.trim();

  if (!url) {
    return { ticket: fallbackTicket(payload), fallback: true };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toWebhookBody(payload)),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook failed (${response.status})`);
    }

    const data: unknown = await response.json();
    const ticket = toSupportTicket(data, payload);

    return { ticket, fallback: false };
  } catch (error) {
    console.error("SupportOps fallback used:", error);
    return { ticket: fallbackTicket(payload), fallback: true };
  }
}

function toWebhookBody(payload: SupportMessagePayload): N8nWebhookBody {
  const body: N8nWebhookBody = {
    customerName: payload.customerName,
    channel: payload.channel,
    message: payload.message,
  };

  if (payload.orderId) {
    body.orderId = payload.orderId;
  }

  return body;
}

function toSupportTicket(
  data: unknown,
  payload: SupportMessagePayload
): SupportTicket {
  const core = parseN8nTicketCore(data);

  return {
    ...core,
    originalMessage: payload.message,
    customerName: payload.customerName,
    channel: payload.channel,
    createdAt: new Date().toISOString(),
  };
}

function parseN8nTicketCore(data: unknown): N8nTicketCore {
  const record = unwrapN8nPayload(data);

  const ticketId = pickString(record, ["ticketId", "ticket_id", "id"]);
  if (!ticketId) {
    throw new Error("Invalid n8n response: missing ticketId");
  }

  const orderStatus = pickString(record, [
    "orderStatus",
    "order_status",
    "orderStatusText",
    "order_status_text",
    "orderState",
    "order_state",
  ]);

  const reasoning = pickString(record, [
    "reasoning",
    "aiReasoning",
    "ai_reasoning",
    "explanation",
    "analysis",
    "rationale",
  ]);

  const generatedReply = pickString(record, [
    "generatedReply",
    "generated_reply",
    "safeReply",
    "safe_reply",
    "reply",
    "customerReply",
    "customer_reply",
    "autoReply",
    "auto_reply",
    "response",
    "messageReply",
    "message_reply",
  ]);

  const core: N8nTicketCore = {
    ticketId,
    intent: pickString(record, ["intent", "classification", "category"], "General Inquiry"),
    priority: asEnum(
      pickRaw(record, ["priority", "ticketPriority", "ticket_priority"]),
      PRIORITIES,
      "Medium"
    ),
    department: pickString(record, ["department", "team", "assignedDepartment"], "Support Team"),
    orderStatus: orderStatus || "Unknown",
    riskScore: asNumber(pickRaw(record, ["riskScore", "risk_score", "score"]), 0),
    riskLevel: asEnum(
      pickRaw(record, ["riskLevel", "risk_level", "risk"]),
      RISK_LEVELS,
      "Low"
    ),
    scamDetected:
      record.scamDetected === true ||
      record.scam_detected === true ||
      pickString(record, ["scamDetected", "scam_detected"]) === "true",
    scamType: pickString(record, ["scamType", "scam_type", "scamCategory"]),
    scamFlags: pickStringArray(record, ["scamFlags", "scam_flags", "flags"]),
    reasoning,
    generatedReply,
    workflowActions: pickStringArray(record, [
      "workflowActions",
      "workflow_actions",
      "actions",
      "steps",
    ]),
    status: asEnum(
      pickRaw(record, ["status", "ticketStatus", "ticket_status"]),
      TICKET_STATUSES,
      "New"
    ),
  };

  if (!reasoning || !generatedReply || orderStatus === "Unknown") {
    console.warn("[SupportOps] n8n response missing some fields. Parsed keys:", Object.keys(record));
    if (!reasoning) console.warn("[SupportOps] Missing: reasoning");
    if (!generatedReply) console.warn("[SupportOps] Missing: generatedReply / reply");
    if (orderStatus === "Unknown") console.warn("[SupportOps] Missing: orderStatus");
  }

  return core;
}

/** Unwrap common n8n / webhook response shapes into a flat ticket object */
function unwrapN8nPayload(data: unknown): Record<string, unknown> {
  let current: unknown = data;

  for (let depth = 0; depth < 10; depth++) {
    if (current == null) {
      return {};
    }

    if (typeof current === "string") {
      const parsed = tryParseJson(current);
      if (parsed) {
        current = parsed;
        continue;
      }
      return {};
    }

    if (Array.isArray(current)) {
      current = current.length > 0 ? current[0] : null;
      continue;
    }

    if (typeof current !== "object") {
      return {};
    }

    const record = current as Record<string, unknown>;

    if (hasTicketId(record.ticket)) {
      current = record.ticket;
      continue;
    }

    if (hasTicketId(record)) {
      return mergeTicketSources(record);
    }

    const nestedKeys = ["json", "body", "data", "output", "result", "response"] as const;
    let stepped = false;

    for (const key of nestedKeys) {
      const nested = record[key];
      if (nested == null) continue;

      if (typeof nested === "object") {
        current = nested;
        stepped = true;
        break;
      }

      if (typeof nested === "string") {
        const parsed = tryParseJson(nested);
        if (parsed && (hasTicketId(parsed) || "intent" in parsed)) {
          current = parsed;
          stepped = true;
          break;
        }
      }
    }

    if (!stepped) {
      return mergeTicketSources(record);
    }
  }

  if (current && typeof current === "object" && !Array.isArray(current)) {
    return mergeTicketSources(current as Record<string, unknown>);
  }

  return {};
}

/** Merge top-level fields with nested ticket / AI output objects */
function mergeTicketSources(
  record: Record<string, unknown>
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...record };

  const nestedSources = [
    record.ticket,
    record.data,
    record.output,
    record.result,
  ];

  for (const source of nestedSources) {
    if (source && typeof source === "object" && !Array.isArray(source)) {
      Object.assign(merged, source as Record<string, unknown>);
    } else if (typeof source === "string") {
      const parsed = tryParseJson(source);
      if (parsed) Object.assign(merged, parsed);
    }
  }

  return merged;
}

function hasTicketId(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const id = (value as Record<string, unknown>).ticketId;
  return typeof id === "string" && id.trim().length > 0;
}

function tryParseJson(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return null;

  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (Array.isArray(parsed) && parsed[0] && typeof parsed[0] === "object") {
      return parsed[0] as Record<string, unknown>;
    }
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return null;
  }

  return null;
}

function pickRaw(
  record: Record<string, unknown>,
  keys: string[]
): unknown {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) {
      return record[key];
    }
  }
  return undefined;
}

function pickString(
  record: Record<string, unknown>,
  keys: string[],
  fallback = ""
): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }
  return fallback;
}

function pickStringArray(
  record: Record<string, unknown>,
  keys: string[]
): string[] {
  for (const key of keys) {
    const value = record[key];
    const arr = asStringArray(value);
    if (arr.length > 0) return arr;
  }
  return [];
}

function fallbackTicket(payload: SupportMessagePayload): SupportTicket {
  const message = payload.message.toLowerCase();
  const risky = SCAM_KEYWORDS.some((keyword) => message.includes(keyword));

  const createdAt = new Date().toISOString();
  const orderStatus = payload.orderId
    ? `Checked order ${payload.orderId} — confirmation pending in system`
    : "No order ID provided";

  if (risky) {
    return {
      ticketId: `TKT-${Date.now().toString().slice(-5)}`,
      intent: "Scam Report",
      priority: "Critical",
      department: "Risk Review Team",
      orderStatus,
      riskScore: 91,
      riskLevel: "Critical",
      scamDetected: true,
      scamType: "Suspicious payment or credential request",
      scamFlags: [
        "Message matched fallback scam keyword patterns (link, OTP, payment, or prize-related)",
      ],
      reasoning:
        "Fallback mode detected scam-related phrases in the customer message. Manual risk review is recommended.",
      generatedReply:
        "For your safety, please do not open unofficial links or share OTP, card, or password details. Our risk review team will check this message manually.",
      workflowActions: [
        "Fallback mode activated",
        "Scam keyword check triggered",
        "Ticket escalated to Risk Review Team",
        "Safe reply generated",
      ],
      status: "Escalated",
      originalMessage: payload.message,
      customerName: payload.customerName,
      channel: payload.channel,
      createdAt,
    };
  }

  const orderRef = payload.orderId ? `Order ID: ${payload.orderId}` : "your request";

  return {
    ticketId: `TKT-${Date.now().toString().slice(-5)}`,
    intent: inferIntentFromMessage(message),
    priority: "Medium",
    department: inferDepartmentFromMessage(message),
    orderStatus,
    riskScore: 35,
    riskLevel: "Medium",
    scamDetected: false,
    scamType: "",
    scamFlags: [],
    reasoning:
      "Fallback mode classified the message as a normal support request with no scam keywords detected.",
    generatedReply: `Thank you for your message regarding ${orderRef}. We have received your request and our team will update you shortly.`,
    workflowActions: [
      "Fallback mode activated",
      "Message classified locally",
      "Ticket assigned to support team",
      "Safe reply generated",
    ],
    status: "Assigned",
    originalMessage: payload.message,
    customerName: payload.customerName,
    channel: payload.channel,
    createdAt,
  };
}

function inferIntentFromMessage(message: string): string {
  if (message.includes("delivery") || message.includes("ship")) return "Delivery Issue";
  if (message.includes("refund") || message.includes("damage")) return "Refund Request";
  if (message.includes("pay") || message.includes("payment")) return "Payment Issue";
  return "General Inquiry";
}

function inferDepartmentFromMessage(message: string): string {
  if (message.includes("delivery")) return "Delivery Team";
  if (message.includes("refund") || message.includes("damage")) return "Returns Team";
  if (message.includes("pay")) return "Payments Team";
  return "Support Team";
}

const PRIORITIES: Priority[] = ["Low", "Medium", "High", "Critical"];
const RISK_LEVELS: RiskLevel[] = ["Low", "Medium", "High", "Critical"];
const TICKET_STATUSES: TicketStatus[] = [
  "New",
  "Assigned",
  "Escalated",
  "Resolved",
];

function asNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function asEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T
): T {
  if (typeof value === "string" && allowed.includes(value as T)) {
    return value as T;
  }
  return fallback;
}
