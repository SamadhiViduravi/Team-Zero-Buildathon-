export type SupportMessagePayload = {
  customerName: string;
  channel: "Web" | "WhatsApp" | "Email" | "Facebook";
  message: string;
  orderId?: string;
};

export type SupportTicket = {
  ticketId: string;
  intent: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  department: string;
  orderStatus: string;
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  scamDetected: boolean;
  scamType: string;
  scamFlags: string[];
  reasoning: string;
  generatedReply: string;
  workflowActions: string[];
  status: "New" | "Assigned" | "Escalated" | "Resolved";
  originalMessage?: string;
  customerName?: string;
  channel?: string;
  createdAt?: string;
};
