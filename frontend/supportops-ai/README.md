# SupportOps AI

n8n-powered customer support operations desk with scam detection.

## Track

Best Use of n8n

## Problem

Small businesses receive customer messages from many channels and manually classify issues, check order/payment status, detect suspicious messages, route tickets, and reply to customers. This causes delays, missed scams, and inconsistent responses.

## Solution

SupportOps AI automates the support workflow using n8n. It receives a customer message, classifies the issue, checks mock order/payment data, detects scam risk, routes the ticket, escalates dangerous cases, and generates a safe reply.

## How n8n is used

n8n is the core workflow engine:

Webhook Intake → Intent Classification → Order Lookup → Scam Detection → Department Routing → Escalation → Safe Reply Generation → Frontend Dashboard Response.

## Tech Stack

Next.js, TypeScript, Tailwind CSS, n8n, AI API, Vercel/Netlify.

## Demo Flow

Use the message:

"I paid for ORD-5550 but it still says pending. I also got a link asking me to pay delivery again: http://fast-delivery-prize.com"

Expected result:

Critical scam alert, Risk Review Team routing, safe customer reply, and workflow actions displayed.

## Environment Variables

NEXT_PUBLIC_N8N_WEBHOOK_URL

## Local Setup

1. Clone the repo
2. Run `npm install`
3. Create `.env.local` in `frontend/supportops-ai` (copy from `.env.example` if helpful)
4. Add:

```env
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://dulan.app.n8n.cloud/webhook-test/supportops-message
```

5. Run `npm run dev` and open [http://localhost:3000](http://localhost:3000)

The **webhook-test** URL works only while n8n is listening for test events (use **Test workflow** in the n8n editor). For final deployment, use the **production webhook URL** from your activated n8n workflow.

## Fallback Mode

If n8n is unavailable, the app uses local fallback scam detection so the demo remains stable.

## Disclaimer

This is a hackathon prototype using mock order data.
