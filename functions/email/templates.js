const escapeHtml = value => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

export const EMAIL_TEMPLATE_TYPES = Object.freeze([
  'welcome',
  'verification',
  'password_reset',
  'contact_received',
  'contact_notification',
  'support_notification',
  'system'
]);

const layouts = {
  welcome: ({ title, body }) => `<!doctype html><html><body style="margin:0;background:#06111f;color:#eaf3ff;font-family:Arial,sans-serif"><div style="max-width:620px;margin:0 auto;padding:32px"><h1 style="margin:0 0 16px">${escapeHtml(title)}</h1><div style="line-height:1.7;color:#c6d5e5">${body}</div><p style="margin-top:28px;color:#7890a8">Trade Avata — Your Trading Journey Starts Here.</p></div></body></html>`,
  default: ({ title, body }) => `<!doctype html><html><body style="margin:0;background:#06111f;color:#eaf3ff;font-family:Arial,sans-serif"><div style="max-width:620px;margin:0 auto;padding:32px"><h1 style="margin:0 0 16px">${escapeHtml(title)}</h1><div style="line-height:1.7;color:#c6d5e5">${body}</div><p style="margin-top:28px;color:#7890a8">Trade Avata</p></div></body></html>`
};

export function renderEmailTemplate(type, data = {}) {
  const title = data.title || ({
    welcome: 'Welcome to Trade Avata',
    verification: 'Verify your email',
    password_reset: 'Reset your password',
    contact_received: 'We received your message',
    contact_notification: 'New contact message',
    support_notification: 'New support message',
    system: 'Trade Avata notification'
  }[type] || 'Trade Avata notification');

  const safeName = escapeHtml(data.name || 'Trader');
  const safeMessage = escapeHtml(data.message || '').replaceAll('\n', '<br>');
  const button = data.actionUrl && data.actionLabel
    ? `<p><a href="${escapeHtml(data.actionUrl)}" style="display:inline-block;padding:12px 18px;background:#0b73ff;color:#fff;text-decoration:none;border-radius:8px">${escapeHtml(data.actionLabel)}</a></p>`
    : '';

  const body = data.htmlBody || `
    <p>Hello ${safeName},</p>
    ${safeMessage ? `<p>${safeMessage}</p>` : ''}
    ${button}
  `;

  return (layouts[type] || layouts.default)({ title, body });
}
