# Trade Avata Platform Analytics & Admin Monitoring

Trade Avata needs a separate administrative observability layer so administrators can understand how the platform is being used.

## Admin dashboard

The admin dashboard should provide:

- Active users now
- Active users today, 7 days and 30 days
- New registrations
- Top countries at country level
- Top pages
- Most-used tools
- AI Analytics runs
- AI Journal analysis runs
- Journal entry activity
- Voice journal transcription activity
- Course views, starts and completions
- Product views and purchases
- Account connection activity
- Reports generated
- Conversion funnel
- Important system errors

Time filters: Today, Yesterday, 7 Days, 30 Days, 90 Days and Custom.

## AI usage control

AI Analytics and AI Journal are product features, not chatbots. A user submits trading/account/journal data and requests a bounded analysis. The system calculates evidence first and then asks the AI service to interpret that evidence.

There is no open-ended user-to-AI chat endpoint.

Meter AI usage by analysis run and enforce server-side quotas/fair-use limits. Do not put provider API keys in the browser or GitHub.

## Location and privacy

Country-level reporting is sufficient for platform monitoring. Do not store exact physical location merely to produce a country report. Use privacy-conscious analytics, clear retention rules and applicable consent/cookie controls where required.

## Data separation

**Customer Analytics:** what is happening in a customer's trading account.

**Platform Analytics:** what is happening across Trade Avata as a service.

These must remain separate collections/permissions and separate admin views.

## Example admin view

- Live now: calculated from recent active sessions/events
- Today: unique active users for the current day
- Top countries: aggregated country counts/percentages
- Feature usage: counts by tool/product/feature
- AI usage: analysis runs and quota consumption

All values must be database/event driven. Never hard-code production statistics.
