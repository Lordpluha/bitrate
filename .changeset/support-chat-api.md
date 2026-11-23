---
'@bitrate/api': minor
'@bitrate/contracts': minor
---

Added the support assistant's web chat (#571). Guests and signed-in listeners start a conversation with `POST /v1/support/conversations`; a guest gets a token, stored only as a hash. `POST /v1/support/conversations/:id/messages` streams the reply as Server-Sent Events, and `GET /v1/support/conversations/:id` returns the history. Each turn answers from the knowledge base with Claude Haiku 5.5 at low effort, or hands the conversation to an operator and opens a ticket. The handoff also happens when the assistant is not configured, when the $10 monthly budget (`SUPPORT_MONTHLY_BUDGET_USD`) is spent, when a conversation has used its token allowance, or when the model fails. Conversations are deleted 90 days after their last message.
