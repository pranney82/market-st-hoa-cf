import { sanitize } from "./sanitize";

interface EmailOpts {
  env: Env;
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ env, to, subject, html, from }: EmailOpts) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: from || env.RESEND_FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Resend error:", err);
    return { success: false, error: err };
  }
  return { success: true, data: await res.json() };
}

function wrap(title: string, body: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0}
.c{max-width:600px;margin:0 auto;padding:20px}
.h{background:#2563eb;color:#fff;padding:20px;text-align:center;border-radius:8px 8px 0 0}
.b{background:#f9fafb;padding:30px;border-radius:0 0 8px 8px}
.f{text-align:center;padding:20px;color:#6b7280;font-size:13px}
.btn{display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-weight:600}
</style></head><body><div class="c">
<div class="h"><h1 style="margin:0;font-size:20px">Market Street HOA</h1></div>
<div class="b"><h2 style="margin-top:0">${title}</h2>${body}</div>
<div class="f"><p>Market Street Homeowners Association</p></div>
</div></body></html>`;
}

export async function sendWelcomeEmail(env: Env, to: string, name: string) {
  const s = sanitize(name);
  return sendEmail({ env, to, subject: "Welcome to Market St HOA",
    html: wrap("Welcome!", `<p>Hi ${s}, your account has been set up for the Market Street HOA portal.</p><p style="text-align:center;margin:24px 0"><a href="${env.BASE_URL}" class="btn">Visit Portal</a></p><p style="font-size:13px;color:#6b7280">You'll sign in with a one-time code sent to this email.</p>`) });
}

export async function sendDuesNotificationEmail(env: Env, to: string, name: string, amount: string, dueDate: string) {
  const s = sanitize(name);
  const a = sanitize(amount);
  const d = sanitize(dueDate);
  return sendEmail({ env, to, subject: "Dues Posted - Market St HOA",
    html: wrap("Dues Posted", `<p>Hi ${s}, your dues of <strong>$${a}</strong> are due by <strong>${d}</strong>.</p><p style="text-align:center;margin:24px 0"><a href="${env.BASE_URL}/payments" class="btn">Pay Now</a></p>`),
    from: env.RESEND_BILLING_EMAIL });
}

export async function sendPaymentReceiptEmail(env: Env, to: string, name: string, amount: string, method: string) {
  const s = sanitize(name);
  const a = sanitize(amount);
  const m = sanitize(method);
  return sendEmail({ env, to, subject: "Payment Received - Market St HOA",
    html: wrap("Payment Received", `<p>Hi ${s}, we received your payment of <strong>$${a}</strong> via ${m}.</p>`),
    from: env.RESEND_BILLING_EMAIL });
}

export async function sendRequestStatusEmail(env: Env, to: string, name: string, title: string, status: string, notes?: string) {
  const sName = sanitize(name);
  const sTitle = sanitize(title);
  const sStatus = sanitize(status);
  const sNotes = notes ? sanitize(notes) : "";
  return sendEmail({ env, to, subject: `Request ${sStatus}: ${sTitle}`,
    html: wrap(`Request ${sStatus.charAt(0).toUpperCase() + sStatus.slice(1)}`, `<p>Hi ${sName}, your request "<strong>${sTitle}</strong>" was <strong>${sStatus}</strong>.</p>${sNotes ? `<p>Notes: ${sNotes}</p>` : ""}`),
    from: env.RESEND_REQUESTS_EMAIL });
}
