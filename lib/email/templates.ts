import "server-only";

type EmailTemplate = {
  subject: string;
  text: string;
  html: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function emailLayout({
  preheader,
  heading,
  body,
  action,
  actionUrl,
  footer,
}: {
  preheader: string;
  heading: string;
  body: string;
  action?: string;
  actionUrl?: string;
  footer: string;
}) {
  const button =
    action && actionUrl
      ? `<tr>
          <td style="padding:28px 0 8px">
            <a href="${escapeHtml(actionUrl)}" style="display:inline-block;border-radius:10px;background:#2563eb;color:#ffffff;font-size:15px;font-weight:700;line-height:20px;padding:13px 22px;text-decoration:none">${escapeHtml(action)}</a>
          </td>
        </tr>`
      : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${escapeHtml(heading)}</title>
  </head>
  <body style="margin:0;background:#0f172a;color:#f8fafc;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0f172a;padding:32px 12px">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px">
            <tr>
              <td style="padding:0 0 18px;font-size:20px;font-weight:800;letter-spacing:-.4px;color:#f8fafc">
                <span style="display:inline-block;margin-right:8px;border-radius:8px;background:#2563eb;color:white;padding:5px 9px">S</span>
                Stockeyfy
              </td>
            </tr>
            <tr>
              <td style="border:1px solid #334155;border-radius:18px;background:#1e293b;padding:38px 36px;box-shadow:0 8px 28px rgba(2,6,23,.35)">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="font-size:26px;font-weight:800;line-height:34px;letter-spacing:-.5px;color:#f8fafc">${escapeHtml(heading)}</td>
                  </tr>
                  <tr>
                    <td style="padding-top:16px;font-size:16px;line-height:26px;color:#cbd5e1">${body}</td>
                  </tr>
                  ${button}
                  <tr>
                    <td style="padding-top:26px;font-size:13px;line-height:20px;color:#94a3b8">${footer}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 8px;text-align:center;font-size:12px;line-height:18px;color:#64748b">
                This is an automated security message from Stockeyfy.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function verificationEmailTemplate(
  name: string,
  verificationUrl: string,
): EmailTemplate {
  const safeName = escapeHtml(name);

  return {
    subject: "Verify your Stockeyfy email",
    text: `Hi ${name}, verify your email by visiting: ${verificationUrl}. This link expires in 24 hours.`,
    html: emailLayout({
      preheader: "Confirm your email address to activate your Stockeyfy account.",
      heading: "Verify your email",
      body: `Hi ${safeName},<br><br>Confirm that this email belongs to you to activate your account and securely sign in.`,
      action: "Verify email address",
      actionUrl: verificationUrl,
      footer:
        "This link expires in 24 hours. If you did not create this account, you can safely ignore this email.",
    }),
  };
}

export function passwordResetEmailTemplate(
  name: string,
  resetUrl: string,
): EmailTemplate {
  const safeName = escapeHtml(name);

  return {
    subject: "Reset your Stockeyfy password",
    text: `Hi ${name}, reset your password by visiting: ${resetUrl}. This link expires in 1 hour.`,
    html: emailLayout({
      preheader: "A password reset was requested for your Stockeyfy account.",
      heading: "Reset your password",
      body: `Hi ${safeName},<br><br>We received a request to reset your password. Use the secure link below to choose a new one.`,
      action: "Reset password",
      actionUrl: resetUrl,
      footer:
        "This link expires in 1 hour and can only be used once. If you did not request it, no action is needed.",
    }),
  };
}

export function welcomeEmailTemplate(
  name: string,
  dashboardUrl: string,
): EmailTemplate {
  const safeName = escapeHtml(name);

  return {
    subject: "Welcome to Stockeyfy",
    text: `Welcome, ${name}. Your email is verified and your Stockeyfy account is ready: ${dashboardUrl}`,
    html: emailLayout({
      preheader: "Your Stockeyfy account is verified and ready.",
      heading: "You’re all set",
      body: `Welcome, ${safeName}.<br><br>Your email has been verified and your account is ready. You can now sign in securely.`,
      action: "Continue to Stockeyfy",
      actionUrl: dashboardUrl,
      footer:
        "Keep your password private and contact your administrator if you notice unexpected account activity.",
    }),
  };
}

export function passwordChangedEmailTemplate(
  name: string,
  loginUrl: string,
): EmailTemplate {
  const safeName = escapeHtml(name);

  return {
    subject: "Your Stockeyfy password was changed",
    text: `Hi ${name}, your Stockeyfy password was changed. If this was not you, contact your administrator immediately. Sign in: ${loginUrl}`,
    html: emailLayout({
      preheader: "Security notice: your Stockeyfy password has changed.",
      heading: "Password changed",
      body: `Hi ${safeName},<br><br>Your password was changed successfully. Existing sessions have been invalidated for your protection.`,
      action: "Sign in again",
      actionUrl: loginUrl,
      footer:
        "If you did not make this change, contact your administrator immediately and secure your email account.",
    }),
  };
}
