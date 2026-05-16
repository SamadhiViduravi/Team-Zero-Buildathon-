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
  if (!data || typeof data !== "object") {
    throw new Error("Invalid n8n response: expected JSON object");
  }

  const record = data as Record<string, unknown>;

  const ticketId =
    typeof record.ticketId === "string" ? record.ticketId.trim() : "";
  if (!ticketId) {
    throw new Error("Invalid n8n response: missing ticketId");
  }

  return {
    ticketId,
    intent: asString(record.intent, "General Inquiry"),
    priority: asEnum(record.priority, PRIORITIES, "Medium"),
    department: asString(record.department, "Support Team"),
    orderStatus: asString(record.orderStatus, "Unknown"),
    riskScore: asNumber(record.riskScore, 0),
    riskLevel: asEnum(record.riskLevel, RISK_LEVELS, "Medium"),
    scamDetected: record.scamDetected === true,
    scamType: asString(record.scamType, ""),
    scamFlags: asStringArray(record.scamFlags),
    reasoning: asString(record.reasoning, ""),
    generatedReply: asString(record.generatedReply, ""),
    workflowActions: asStringArray(record.workflowActions),
    status: asEnum(record.status, TICKET_STATUSES, "New"),
  };
}

function fallbackTicket(payload: SupportMessagePayload): SupportTicket {
  const message = payload.message.toLowerCase();
  const risky = SCAM_KEYWORDS.some((keyword) => message.includes(keyword));

  const createdAt = new Date().toISOString();
  const orderStatus = payload.orderId
    ? `Fallback: checked order ${payload.orderId}`
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

  return {
    ticketId: `TKT-${Date.now().toString().slice(-5)}`,
    intent: "General Inquiry",
    priority: "Medium",
    department: "Support Team",
    orderStatus,
    riskScore: 35,
    riskLevel: "Medium",
    scamDetected: false,
    scamType: "",
    scamFlags: [],
    reasoning:
      "Fallback mode classified the message as a normal support request with no scam keywords detected.",
    generatedReply:
      "Thank you for contacting us. Our support team has received your request and will respond shortly.",
    workflowActions: [
      "Fallback mode activated",
      "Message classified as General Inquiry",
      "Ticket assigned to Support Team",
      "Safe reply generated",
    ],
    status: "Assigned",
    originalMessage: payload.message,
    customerName: payload.customerName,
    channel: payload.channel,
    createdAt,
  };
}

const PRIORITIES: Priority[] = ["Low", "Medium", "High", "Critical"];
const RISK_LEVELS: RiskLevel[] = ["Low", "Medium", "High", "Critical"];
const TICKET_STATUSES: TicketStatus[] = [
  "New",
  "Assigned",
  "Escalated",
  "Resolved",
];

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
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
  return allowed.includes(value as T) ? (value as T) : fallback;
}
