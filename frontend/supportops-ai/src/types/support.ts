export type Channel = "Web" | "WhatsApp" | "Email" | "Facebook";

export type Priority = "Low" | "Medium" | "High" | "Critical";

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export type TicketStatus = "New" | "Assigned" | "Escalated" | "Resolved";

export type SupportMessagePayload = {
  customerName: string;
  channel: Channel;
  message: string;
  orderId?: string;
};

export type SupportTicket = {
  ticketId: string;
  intent: string;
  priority: Priority;
  department: string;
  orderStatus: string;
  riskScore: number;
  riskLevel: RiskLevel;
  scamDetected: boolean;
  scamType: string;
  scamFlags: string[];
  reasoning: string;
  generatedReply: string;
  workflowActions: string[];
  status: TicketStatus;
  originalMessage?: string;
  customerName?: string;
  channel?: Channel;
  createdAt?: string;
};
