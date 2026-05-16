# SupportOps AI — n8n workflow documentation

## Project

**SupportOps AI** is an n8n-powered customer support operations desk with scam detection. The Next.js frontend collects customer messages and calls an n8n webhook; n8n runs classification, risk checks, routing, and reply generation, then returns a structured ticket as JSON.

## n8n as the core workflow engine

n8n is the **core workflow engine** for SupportOps AI. It orchestrates every automated step after a message arrives:

- Receives inbound messages from the frontend webhook
- Runs AI and rule-based logic without hard-coding that flow in the UI
- Connects to mock (or real) order/payment data
- Produces a single, consistent JSON ticket for the dashboard

The frontend (`submitSupportMessage`) only **POSTs the payload** and **renders the response**. If the webhook is unavailable, the app uses a local fallback classifier for demos—not a replacement for production n8n logic.

Configure the webhook URL in `.env.local` (never commit real URLs):

```env
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-webhook-url
```

See `.env.example` for the template.

---

## Workflow name

**SupportOps AI - Scam Detection Workflow**

---

## Workflow steps

| Step | Description |
|------|-------------|
| 1 | **Webhook** receives the customer message from the frontend |
| 2 | **AI** classifies customer intent (payment, delivery, refund, scam, etc.) |
| 3 | **Mock order/payment lookup** runs when `orderId` is present |
| 4 | **Scam and risk detection** evaluates links, OTP requests, payment mismatch, and abuse patterns |
| 5 | **Priority score** is assigned (`Low` → `Critical`, plus numeric `riskScore`) |
| 6 | **Department routing** selects the team (Payments, Logistics, Support, Risk Review, etc.) |
| 7 | **High-risk tickets** are escalated (`status: Escalated`, Risk Review Team) |
| 8 | **Safe customer reply** is generated (no sharing of credentials; warn on suspicious links) |
| 9 | **JSON response** is returned to the frontend with HTTP `200` |

Suggested n8n node types: **Webhook** → **AI / Code** → **Set / IF** → **Respond to Webhook**.

---

## Webhook contract

| Item | Value |
|------|--------|
| Method | `POST` |
| Content-Type | `application/json` |
| Environment variable | `NEXT_PUBLIC_N8N_WEBHOOK_URL` |
| Success status | `200` |

### Expected input JSON

Matches `SupportMessagePayload` in `src/types/support.ts`.

```json
{
  "customerName": "Nimal",
  "channel": "Web",
  "message": "I paid for ORD-5550 but it still says pending. I also got a link asking me to pay delivery again: http://fast-delivery-prize.com",
  "orderId": "ORD-5550"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `customerName` | string | Yes | Display name for the ticket |
| `channel` | `"Web"` \| `"WhatsApp"` \| `"Email"` \| `"Facebook"` | Yes | Source channel |
| `message` | string | Yes | Full customer message |
| `orderId` | string | No | Triggers mock order/payment lookup in n8n |

### Expected output JSON

Return a JSON object with the fields below. The frontend adds `originalMessage`, `customerName`, `channel`, and `createdAt` from the request payload.

| Field | Type | Description |
|-------|------|-------------|
| `ticketId` | string | Unique ticket ID (e.g. `TKT-5550`) |
| `intent` | string | Classified intent |
| `priority` | `"Low"` \| `"Medium"` \| `"High"` \| `"Critical"` | Ticket priority |
| `department` | string | Routed team |
| `orderStatus` | string | Result of order/payment lookup |
| `riskScore` | number | 0–100 risk score |
| `riskLevel` | `"Low"` \| `"Medium"` \| `"High"` \| `"Critical"` | Risk band |
| `scamDetected` | boolean | Whether scam patterns were found |
| `scamType` | string | Scam category label (empty if none) |
| `scamFlags` | string[] | Human-readable risk flags |
| `reasoning` | string | Short explanation for agents |
| `generatedReply` | string | Safe message to send to the customer |
| `workflowActions` | string[] | Audit trail of steps n8n executed |
| `status` | `"New"` \| `"Assigned"` \| `"Escalated"` \| `"Resolved"` | Ticket state |

#### Example output JSON

```json
{
  "ticketId": "TKT-5550",
  "intent": "Scam Report",
  "priority": "Critical",
  "department": "Risk Review Team",
  "orderStatus": "Payment failed, order pending — external pay-again link not from official store",
  "riskScore": 91,
  "riskLevel": "Critical",
  "scamDetected": true,
  "scamType": "Suspicious payment link / payment mismatch",
  "scamFlags": [
    "Suspicious external payment link detected",
    "Customer claims payment but order database shows payment failed",
    "Pay-again request detected"
  ],
  "reasoning": "Customer reports pending order and a third-party delivery payment link. Order ORD-5550 shows failed FriMi payment; link domain is not on the official allowlist.",
  "generatedReply": "Ayubowan Nimal. Please do not pay via links sent outside our official WhatsApp or website. Your order shows payment failed in our system—use only PayHere or FriMi from your order email. Our Risk Review Team will contact you today.",
  "workflowActions": [
    "Webhook received customer message",
    "AI classified intent as Scam Report",
    "Mock lookup: ORD-5550 payment failed",
    "Scam detection: external link + pay-again pattern",
    "Priority set to Critical (riskScore 91)",
    "Routed to Risk Review Team",
    "Ticket escalated",
    "Safe reply generated",
    "JSON response sent to frontend"
  ],
  "status": "Escalated"
}
```

---

## Demo test messages

Use these payloads to test the workflow in n8n or via the frontend intake form.

### 1. Scam payment link

```json
{
  "customerName": "Kamani Silva",
  "channel": "WhatsApp",
  "message": "Your order needs a re-payment. Pay here: http://lk-pay-again-secure.com/ORD-8821. My FriMi already failed once.",
  "orderId": "ORD-8821"
}
```

**Expected behavior:** `scamDetected: true`, high `riskScore`, `Risk Review Team`, `Escalated`.

---

### 2. Damaged product

```json
{
  "customerName": "Dilani Fernando",
  "channel": "Email",
  "message": "The ceramic curry pot from order ORD-3312 arrived cracked. I can send photos. Can I get a replacement to Matara?",
  "orderId": "ORD-3312"
}
```

**Expected behavior:** Intent e.g. **Product Quality / Replacement**, `Support Team` or **Fulfillment**, `Medium` priority, `scamDetected: false`.

---

### 3. Delivery delay

```json
{
  "customerName": "Ruwan Jayawardena",
  "channel": "Facebook",
  "message": "Order ORD-7740 was supposed to reach Gampaha yesterday. Tracking still says 'out for delivery' since Monday.",
  "orderId": "ORD-7740"
}
```

**Expected behavior:** Intent **Delivery Delay**, route to **Logistics Team**, `High` or `Medium` priority, no scam flags.

---

### 4. Refund abuse

```json
{
  "customerName": "Anonymous Buyer",
  "channel": "Web",
  "message": "Refund ORD-9901 immediately or I will post bad reviews everywhere. I never received it. I want cash to my bank account today, not store credit. This is the third refund I need this month.",
  "orderId": "ORD-9901"
}
```

**Expected behavior:** Intent **Refund Request**, elevated risk for repeat/refund abuse patterns, route to **Payments Team** or **Fraud Review**, `workflowActions` should note repeat-refund check.

---

### 5. OTP scam

```json
{
  "customerName": "Suresh Ratnayake",
  "channel": "WhatsApp",
  "message": "Someone pretending to be your shop asked for my Dialog OTP and card number to release ORD-6610 from customs. I did not share yet. Is this real?",
  "orderId": "ORD-6610"
}
```

**Expected behavior:** `scamDetected: true`, `scamType` related to credential harvesting, `Critical` priority, warn customer not to share OTP/card/password, `Escalated`.

---

## Frontend fallback mode

If `NEXT_PUBLIC_N8N_WEBHOOK_URL` is missing or the request fails, `src/lib/submitSupportMessage.ts` builds a **demo fallback ticket** using keyword-based scam detection. Use n8n for full intent classification, order lookup, and routing in production.

---

## Local setup

```bash
cp .env.example .env.local
# Edit .env.local — set your n8n test webhook URL (do not commit)
npm run dev
```

Test with curl:

```bash
curl -X POST "$NEXT_PUBLIC_N8N_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d @- <<'EOF'
{
  "customerName": "Nimal",
  "channel": "Web",
  "message": "I paid for ORD-5550 but it still says pending.",
  "orderId": "ORD-5550"
}
EOF
```
