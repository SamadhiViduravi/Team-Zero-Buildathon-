import type { SupportTicket } from "@/types/support";

export const initialTickets: SupportTicket[] = [
  {
    ticketId: "TKT-1024",
    intent: "Payment Issue",
    priority: "High",
    department: "Payments Team",
    orderStatus: "Payment received, confirmation pending",
    riskScore: 48,
    riskLevel: "Medium",
    scamDetected: false,
    scamType: "",
    scamFlags: [],
    reasoning:
      "Customer transferred LKR 4,850 via FriMi for order ORD-1024. Bank slip reference matches our pending queue, but the order is still marked pending in Shopify—likely a delay between FriMi settlement and manual reconciliation.",
    generatedReply:
      "Ayubowan Nimal! We received your FriMi payment for order ORD-1024 (handloom saree, delivery to Nugegoda). Our payments team is confirming the transfer with the bank and will update your order within 2–3 working hours. You will get an SMS once it is confirmed.",
    workflowActions: [
      "Message received via Web chat",
      "Intent classified as Payment Issue",
      "Order ORD-1024 looked up in order database",
      "FriMi reference matched to pending payment queue",
      "Ticket assigned to Payments Team",
      "Safe reply generated in English",
    ],
    status: "Assigned",
    originalMessage:
      "Hi, I paid LKR 4,850 through FriMi for order ORD-1024 yesterday evening. Slip ref FR-882914. App still shows pending. Can you confirm?",
    customerName: "Nimal Perera",
    channel: "Web",
    createdAt: "2026-05-15T09:42:00.000Z",
  },
  {
    ticketId: "TKT-5550",
    intent: "Scam Report",
    priority: "Critical",
    department: "Risk Review Team",
    orderStatus: "Payment failed, order pending",
    riskScore: 91,
    riskLevel: "Critical",
    scamDetected: true,
    scamType: "Suspicious payment link / payment mismatch",
    scamFlags: [
      "Suspicious external payment link detected",
      "Customer claims payment but order database shows payment failed",
      "Pay-again request detected",
    ],
    reasoning:
      "Customer received a WhatsApp message with a bit.ly link asking to pay LKR 2,200 again for COD order ORD-5550. Our records show the original FriMi attempt failed (insufficient funds). The link domain does not match our official store or licensed payment partners (PayHere, FriMi, bank transfer).",
    generatedReply:
      "Ayubowan Kamani. Please do not pay through links sent on WhatsApp unless they come from our official number (+94 11 …). Your order ORD-5550 shows payment failed in our system. Pay only via our website checkout or the PayHere link in your order email. Our Risk Review Team will call you today to verify.",
    workflowActions: [
      "Message received via WhatsApp",
      "Intent classified as Scam Report",
      "Order ORD-5550: payment status = failed",
      "External link flagged against allowlist",
      "Risk score elevated to Critical",
      "Ticket escalated to Risk Review Team",
      "Customer advised not to use third-party payment links",
    ],
    status: "Escalated",
    originalMessage:
      "Someone from your shop WhatsApp sent this link to pay again for my Kandy spice box order ORD-5550: bit.ly/pay-again-lk. I already tried FriMi but it failed. Is this real?",
    customerName: "Kamani Silva",
    channel: "WhatsApp",
    createdAt: "2026-05-16T07:18:00.000Z",
  },
];
