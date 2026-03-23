import { sanitize } from "./sanitize";

interface EmailOpts {
  env: Env;
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  from?: string;
}

export async function sendEmail({ env, to, subject, html, text, from }: EmailOpts) {
  const fromAddr = from || env.RESEND_FROM_EMAIL;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddr,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      headers: {
        "List-Unsubscribe": `<${env.BASE_URL}/settings>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend API error (${res.status}): ${err}`);
  }
  return await res.json();
}

// Outlook-safe CTA button using VML fallback
function button(href: string, label: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px auto">
<tr><td align="center" style="border-radius:6px;background-color:#2563eb">
<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:44px;v-text-anchor:middle;width:200px" arcsize="14%" strokecolor="#2563eb" fillcolor="#2563eb">
<w:anchorlock/><center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold">${label}</center>
</v:roundrect>
<![endif]-->
<!--[if !mso]><!--><a href="${href}" target="_blank" style="display:inline-block;padding:12px 32px;background-color:#2563eb;color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:600;text-decoration:none;border-radius:6px;line-height:20px">${label}</a><!--<![endif]-->
</td></tr></table>`;
}

function wrap(title: string, preheader: string, body: string, baseUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${title}</title>
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<style>table,td{border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0}img{-ms-interpolation-mode:bicubic}</style>
<![endif]-->
<style>:root{color-scheme:light only}</style>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%">

<!-- Preheader (hidden preview text with whitespace padding to prevent body text leaking into preview) -->
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all">${preheader}${"&#847; &zwnj; &nbsp; ".repeat(30)}</div>

<!-- Outer wrapper for background color -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f3f4f6">
<tr><td style="padding:24px 16px">

<!-- Outlook fixed-width wrapper -->
<!--[if mso]><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" align="center"><tr><td><![endif]-->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:600px;margin:0 auto">

<!-- Header -->
<tr><td style="background-color:#2563eb;padding:24px 32px;text-align:center;border-radius:8px 8px 0 0">
<!--[if mso]><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td style="background-color:#2563eb;padding:24px 32px;text-align:center"><![endif]-->
<h1 style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;color:#ffffff;line-height:28px">Market Street HOA</h1>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>

<!-- Body -->
<tr><td style="background-color:#ffffff;padding:32px;border-radius:0 0 8px 8px">
<!--[if mso]><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td style="background-color:#ffffff;padding:32px"><![endif]-->
<h2 style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:700;color:#111827;line-height:30px">${title}</h2>
${body}
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>

<!-- Footer -->
<tr><td style="padding:24px 32px;text-align:center">
<p style="margin:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#9ca3af;line-height:20px">Market Street Homeowners Association</p>
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#9ca3af;line-height:20px">
<a href="${baseUrl}/settings" style="color:#9ca3af;text-decoration:underline">Email preferences</a>
</p>
</td></tr>

</table>
<!--[if mso]></td></tr></table><![endif]-->

</td></tr>
</table>
</body>
</html>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#374151;line-height:24px">${text}</p>`;
}

function divider(): string {
  return `<hr style="margin:24px 0;border:0;border-top:1px solid #e5e7eb">`;
}

function detail(label: string, value: string): string {
  return `<tr>
<td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b7280;line-height:20px">${label}</td>
<td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111827;font-weight:600;line-height:20px;text-align:right">${value}</td>
</tr>`;
}

function detailTable(rows: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:16px 0">${rows}</table>`;
}

export async function sendWelcomeEmail(env: Env, to: string, name: string) {
  const s = sanitize(name);
  return sendEmail({
    env, to,
    subject: "Welcome to Market Street HOA",
    text: `Hi ${name}, your account has been set up for the Market Street HOA portal.\n\nFrom the portal you can:\n- View and pay your dues online\n- Submit architectural requests\n- Access HOA documents\n- Update your household information\n\nVisit the portal: ${env.BASE_URL}\n\nYou'll sign in with a one-time code sent to this email address — no password needed.\n\nMarket Street Homeowners Association\nEmail preferences: ${env.BASE_URL}/settings`,
    html: wrap("Welcome!",
      `Your account is ready — sign in to view dues, submit requests, and more.`,
      [
        paragraph(`Hi ${s}, your account has been set up for the Market Street HOA portal.`),
        paragraph("From the portal you can:"),
        `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 16px 0">
<tr><td style="padding:4px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#374151;line-height:24px">&bull;&nbsp; View and pay your dues online</td></tr>
<tr><td style="padding:4px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#374151;line-height:24px">&bull;&nbsp; Submit architectural requests</td></tr>
<tr><td style="padding:4px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#374151;line-height:24px">&bull;&nbsp; Access HOA documents</td></tr>
<tr><td style="padding:4px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#374151;line-height:24px">&bull;&nbsp; Update your household information</td></tr>
</table>`,
        button(`${env.BASE_URL}`, "Visit Portal"),
        paragraph(`<span style="font-size:13px;color:#6b7280">You'll sign in with a one-time code sent to this email address &mdash; no password needed.</span>`),
      ].join(""), env.BASE_URL),
  });
}

export async function sendDuesNotificationEmail(env: Env, to: string, name: string, amount: string, dueDate: string) {
  const s = sanitize(name);
  const a = sanitize(amount);
  const d = sanitize(dueDate);
  return sendEmail({
    env, to,
    subject: "Dues Posted - Market Street HOA",
    text: `Hi ${name}, your monthly HOA dues have been posted.\n\nAmount Due: $${amount}\nDue Date: ${dueDate}\n\nPay now: ${env.BASE_URL}/payments\n\nYou can also pay by check — see the portal for mailing instructions.\n\nMarket Street Homeowners Association\nEmail preferences: ${env.BASE_URL}/settings`,
    html: wrap("Dues Posted",
      `Your $${a} dues are due by ${d}. Pay online anytime.`,
      [
        paragraph(`Hi ${s}, your monthly HOA dues have been posted.`),
        detailTable(
          detail("Amount Due", `$${a}`) +
          detail("Due Date", d)
        ),
        button(`${env.BASE_URL}/payments`, "Pay Now"),
        paragraph(`<span style="font-size:13px;color:#6b7280">You can also pay by check &mdash; see the portal for mailing instructions.</span>`),
      ].join(""), env.BASE_URL),
    from: env.RESEND_BILLING_EMAIL,
  });
}

export async function sendPaymentReceiptEmail(env: Env, to: string, name: string, amount: string, method: string) {
  const s = sanitize(name);
  const a = sanitize(amount);
  const m = sanitize(method);
  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return sendEmail({
    env, to,
    subject: "Payment Received - Market Street HOA",
    text: `Hi ${name}, thank you for your payment.\n\nAmount Paid: $${amount}\nPayment Method: ${method}\nDate: ${dateStr}\n\nThis confirms your payment has been received. Your payment status will update to "settled" once fully processed.\n\nView payment history: ${env.BASE_URL}/payments\n\nMarket Street Homeowners Association\nEmail preferences: ${env.BASE_URL}/settings`,
    html: wrap("Payment Received",
      `We received your $${a} payment via ${m}. Thank you!`,
      [
        paragraph(`Hi ${s}, thank you for your payment. Here are the details:`),
        detailTable(
          detail("Amount Paid", `$${a}`) +
          detail("Payment Method", m) +
          detail("Date", dateStr)
        ),
        divider(),
        paragraph(`<span style="font-size:13px;color:#6b7280">This confirms your payment has been received. Your payment status will update to &ldquo;settled&rdquo; once fully processed.</span>`),
        button(`${env.BASE_URL}/payments`, "View Payment History"),
      ].join(""), env.BASE_URL),
    from: env.RESEND_BILLING_EMAIL,
  });
}

export async function sendDuesReminderEmail(env: Env, to: string, name: string, amount: string, dueDate: string) {
  const s = sanitize(name);
  const a = sanitize(amount);
  const d = sanitize(dueDate);
  return sendEmail({
    env, to,
    subject: "Reminder: Dues Payment Pending - Market Street HOA",
    text: `Hi ${name}, this is a friendly reminder that you have an outstanding balance.\n\nAmount Due: $${amount}\nDue Date: ${dueDate}\nStatus: Pending\n\nPlease submit your payment at your earliest convenience to avoid any late fees.\n\nPay now: ${env.BASE_URL}/payments\n\nMarket Street Homeowners Association\nEmail preferences: ${env.BASE_URL}/settings`,
    html: wrap("Payment Reminder",
      `Friendly reminder: your $${a} dues (due ${d}) are still pending.`,
      [
        paragraph(`Hi ${s}, this is a friendly reminder that you have an outstanding balance.`),
        detailTable(
          detail("Amount Due", `$${a}`) +
          detail("Due Date", d) +
          detail("Status", `<span style="color:#d97706;font-weight:600">Pending</span>`)
        ),
        paragraph("Please submit your payment at your earliest convenience to avoid any late fees."),
        button(`${env.BASE_URL}/payments`, "Pay Now"),
      ].join(""), env.BASE_URL),
    from: env.RESEND_BILLING_EMAIL,
  });
}

export async function sendRequestStatusEmail(env: Env, to: string, name: string, title: string, status: string, notes?: string, requestId?: string) {
  const sName = sanitize(name);
  const sTitle = sanitize(title);
  const sNotes = notes ? sanitize(notes) : "";
  const isApproved = status === "approved";
  const statusColor = isApproved ? "#059669" : "#dc2626";
  const statusLabel = isApproved ? "Approved" : "Denied";
  const statusIcon = isApproved ? "&#10003;" : "&#10007;";
  const requestUrl = requestId ? `${env.BASE_URL}/requests/${requestId}` : `${env.BASE_URL}/requests`;

  return sendEmail({
    env, to,
    subject: `Request ${statusLabel}: ${sTitle} - Market Street HOA`,
    text: `Hi ${name}, your architectural request has been reviewed by the board.\n\nRequest: ${title}\nStatus: ${statusLabel}\n${notes ? `Board Notes: ${notes}\n` : ""}\nView request: ${requestUrl}\n\nMarket Street Homeowners Association\nEmail preferences: ${env.BASE_URL}/settings`,
    html: wrap(`Request ${statusLabel}`,
      `Your request "${sTitle}" has been ${statusLabel.toLowerCase()} by the board.`,
      [
        paragraph(`Hi ${sName}, your architectural request has been reviewed by the board.`),
        `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:16px 0;border:1px solid #e5e7eb;border-radius:8px">
<!--[if mso]><table role="presentation" cellspacing="0" cellpadding="0" border="1" width="100%" style="border-color:#e5e7eb"><![endif]-->
<tr><td style="padding:16px 20px;background-color:#f9fafb;border-radius:8px">
<p style="margin:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b7280;line-height:20px">Request</p>
<p style="margin:0 0 12px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#111827;font-weight:600;line-height:22px">${sTitle}</p>
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:22px">
<span style="color:${statusColor};font-weight:700">${statusIcon} ${statusLabel}</span>
</p>
</td></tr>
</table>`,
        sNotes ? [
          `<p style="margin:0 0 4px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b7280;line-height:20px;font-weight:600">Board Notes</p>`,
          `<p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#374151;line-height:24px;padding:12px 16px;background-color:#f9fafb;border-left:3px solid #d1d5db;border-radius:0 4px 4px 0">${sNotes}</p>`,
        ].join("") : "",
        button(requestId ? `${env.BASE_URL}/requests/${sanitize(requestId)}` : `${env.BASE_URL}/requests`, "View Request"),
      ].join(""), env.BASE_URL),
    from: env.RESEND_REQUESTS_EMAIL,
  });
}
