import type { SupportMessagePayload, SupportTicket } from "@/types/support";

const LOADING_STEPS = [
  "Sending message to n8n...",
  "Classifying intent...",
  "Checking order & payment data...",
  "Running scam detection...",
  "Routing ticket...",
  "Generating safe reply...",
] as const;

export { LOADING_STEPS };

function isRiskyMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("http") ||
    lower.includes("otp") ||
    lower.includes("pay again")
  );
}

function generateTicketId(): string {
  return `TKT-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

function buildFallbackTicket(payload: SupportMessagePayload): SupportTicket {
  const risky = isRiskyMessage(payload.message);
  const now = new Date().toISOString();
  const ticketId = generateTicketId();

  if (risky) {
    const scamType = payload.message.toLowerCase().includes("otp")
      ? "OTP Phishing"
      : payload.message.toLowerCase().includes("http")
        ? "Payment Link Fraud"
        : "Duplicate Payment Scam";

    return {
      ticketId,
      intent: "Fraud / Scam Report",
      priority: "Critical",
      department: "Trust & Safety",
      orderStatus: payload.orderId ? "Under Review" : "N/A",
      riskScore: 91,
      riskLevel: "Critical",
      scamDetected: true,
      scamType,
      scamFlags: [
        "Suspicious external URL detected",
        "Payment re-request pattern",
        "High-risk language markers",
      ],
      reasoning:
        "Message contains indicators commonly associated with payment fraud or credential harvesting. Customer may have received a phishing link or impersonation attempt. Immediate escalation recommended.",
      generatedReply: `Hi ${payload.customerName}, thank you for reporting this. We will NEVER ask for your OTP or payment via external links. Please do not click any suspicious URLs. Our team is reviewing your case and will contact you through official channels only.`,
      workflowActions: [
        "Flagged account for fraud monitoring",
        "Blocked suspicious URL pattern",
        "Escalated to Trust & Safety",
        "Sent safe-reply template to customer",
      ],
      status: "Escalated",
      originalMessage: payload.message,
      customerName: payload.customerName,
      channel: payload.channel,
      createdAt: now,
    };
  }

  const intent = payload.message.toLowerCase().includes("refund")
    ? "Refund Request"
    : payload.message.toLowerCase().includes("delivery") ||
        payload.message.toLowerCase().includes("transit")
      ? "Delivery Inquiry"
      : payload.message.toLowerCase().includes("damaged")
        ? "Product Quality Issue"
        : "General Support";

  return {
    ticketId,
    intent,
    priority: "Medium",
    department:
      intent === "Refund Request"
        ? "Billing"
        : intent === "Delivery Inquiry"
          ? "Logistics"
          : "Customer Care",
    orderStatus: payload.orderId ? "In Transit" : "N/A",
    riskScore: 35,
    riskLevel: "Medium",
    scamDetected: false,
    scamType: "None",
    scamFlags: [],
    reasoning:
      "Standard support inquiry with no significant fraud indicators. Routed to appropriate department based on intent classification.",
    generatedReply: `Hi ${payload.customerName}, thank you for reaching out. We've received your message regarding ${payload.orderId || "your inquiry"} and our ${intent === "Refund Request" ? "billing" : "support"} team is looking into this. You'll receive an update within 24 hours.`,
    workflowActions: [
      "Intent classified successfully",
      "Order lookup completed",
      "Routed to department queue",
      "Auto-reply generated",
    ],
    status: "Assigned",
    originalMessage: payload.message,
    customerName: payload.customerName,
    channel: payload.channel,
    createdAt: now,
  };
}

export async function submitSupportMessage(
  payload: SupportMessagePayload
): Promise<{ ticket: SupportTicket; fallback: boolean }> {
  const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

  if (!webhookUrl || webhookUrl === "placeholder") {
    return { ticket: buildFallbackTicket(payload), fallback: true };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { ticket: buildFallbackTicket(payload), fallback: true };
    }

    const data = await response.json();
    const ticket = (data.ticket ?? data) as SupportTicket;

    return {
      ticket: {
        ...ticket,
        originalMessage: ticket.originalMessage ?? payload.message,
        customerName: ticket.customerName ?? payload.customerName,
        channel: ticket.channel ?? payload.channel,
        createdAt: ticket.createdAt ?? new Date().toISOString(),
      },
      fallback: false,
    };
  } catch {
    return { ticket: buildFallbackTicket(payload), fallback: true };
  }
}
