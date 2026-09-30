# Trade Avata Communication Layer

Visitors can open support chat without registering. The chat is text-only and has no uploads or community features. Admins/staff see unread/open/resolved conversations and the admin identity on replies. Important admin actions are written to audit logs; audit logs cannot be updated or deleted through Firestore rules. Resolved conversations are eligible for scheduled cleanup according to `siteSettings/global.supportRetentionDays` (default 7 days); unresolved conversations are retained.

Admins can create reusable email templates and queue campaigns for all registered users, students, or selected email addresses. Delivery uses the Trade Avata server-side email transport boundary; Firestore is the queue/data layer, not the mail transport. No provider is required for the zero-cost build/test mode.

Trade Avata does not implement a public community feed, trader-to-trader chat, file sharing, or community rooms. A separate Telegram/community product can be used if desired.

## Provider-agnostic email architecture

The application now separates **email composition/queueing** from **email transport**. Firestore `mail` documents are the queue/data layer. The `processEmailQueue` Cloud Function is the transport boundary.

### Current zero-cost mode

The default configuration is `EMAIL_PROVIDER=none`, `EMAIL_ENABLED=false`, and `EMAIL_DRY_RUN=true`. The site can therefore be built, tested and uploaded without buying a mailbox or adding an email-provider key. Queue records and safe email logs can still be exercised.

### Future providers

The server transport supports SMTP and Resend through the same `sendEmail({ to, subject, html, text })` interface. Provider credentials are server-side environment/secrets only. The frontend never receives SMTP passwords or provider API keys.

### Domain later

No production domain is hard-coded. When the domain is purchased, configure `APP_URL`/`FRONTEND_URL`, the sender address, and the selected provider. Incoming routing (for example `support@DOMAIN`) is a separate DNS/email-routing concern from outbound transactional delivery.

### Email types

The queue accepts: `welcome`, `verification`, `password_reset`, `contact_received`, `contact_notification`, `support_notification`, and `system`.

### Logging

`emailLogs` records type, recipient count, subject, status, provider, dry-run state, timestamps and bounded error text. Secrets and message bodies are not stored in the log.
