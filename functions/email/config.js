const bool = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

export function getEmailConfig(overrides = {}) {
  const env = {
    enabled: bool(process.env.EMAIL_ENABLED, false),
    provider: String(process.env.EMAIL_PROVIDER || 'none').toLowerCase(),
    fromName: String(process.env.EMAIL_FROM_NAME || 'Trade Avata'),
    fromEmail: String(process.env.EMAIL_FROM_EMAIL || ''),
    replyTo: String(process.env.EMAIL_REPLY_TO || ''),
    appUrl: String(process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:4321').replace(/\/$/, ''),
    frontendUrl: String(process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:4321').replace(/\/$/, ''),
    backendUrl: String(process.env.BACKEND_URL || '').replace(/\/$/, ''),
    supportEmail: String(process.env.SUPPORT_EMAIL || ''),
    adminEmail: String(process.env.ADMIN_EMAIL || ''),
    dryRun: bool(process.env.EMAIL_DRY_RUN, true),
    smtpHost: String(process.env.EMAIL_SMTP_HOST || ''),
    smtpPort: Number(process.env.EMAIL_SMTP_PORT || 587),
    smtpSecure: bool(process.env.EMAIL_SMTP_SECURE, false),
    smtpUser: String(process.env.EMAIL_SMTP_USER || ''),
    smtpPassword: String(process.env.EMAIL_SMTP_PASSWORD || ''),
    resendApiKey: String(process.env.EMAIL_RESEND_API_KEY || '')
  };
  return {
    ...env,
    ...Object.fromEntries(Object.entries(overrides).filter(([, value]) => value !== undefined && value !== null && value !== '')),
    smtpHost: env.smtpHost,
    smtpPort: env.smtpPort,
    smtpSecure: env.smtpSecure,
    smtpUser: env.smtpUser,
    smtpPassword: env.smtpPassword,
    resendApiKey: env.resendApiKey
  };
}

export function getEmailStatus(overrides = {}) {
  const config = getEmailConfig(overrides);
  const providerReady = config.provider === 'smtp'
    ? Boolean(config.smtpHost && config.smtpUser && config.smtpPassword && config.fromEmail)
    : config.provider === 'resend'
      ? Boolean(config.resendApiKey && config.fromEmail)
      : false;
  return {
    enabled: config.enabled,
    provider: config.provider,
    providerReady,
    dryRun: config.dryRun,
    fromEmailConfigured: Boolean(config.fromEmail),
    replyToConfigured: Boolean(config.replyTo),
    domainConfigured: Boolean(config.fromEmail && config.fromEmail.includes('@')),
    appUrlConfigured: Boolean(config.appUrl)
  };
}
