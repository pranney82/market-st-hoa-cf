import { getDb } from "./db";
import { payments, duesPayments } from "../../shared/schema";
import { eq, and } from "drizzle-orm";
import { sendDuesNotificationEmail, sendPaymentReceiptEmail } from "./email";

export interface EmailMessage {
  type: "dues_notification" | "payment_receipt" | "dues_reminder" | "request_status" | "password_reset";
  to: string;
  name: string;
  amount?: string;
  dueDate?: string;
  method?: string;
  resetLink?: string;
  title?: string;
  status?: string;
  notes?: string;
}

export interface PaymentMessage {
  type: "check_settlement";
  paymentId: string;
  transactionId: string;
  userId: string;
}

export async function handleEmailQueue(batch: MessageBatch<EmailMessage>, env: Env) {
  for (const msg of batch.messages) {
    try {
      const { type, to, name, amount, dueDate, method } = msg.body;

      switch (type) {
        case "dues_notification":
          await sendDuesNotificationEmail(env, to, name, amount!, dueDate!);
          break;
        case "payment_receipt":
          await sendPaymentReceiptEmail(env, to, name, amount!, method!);
          break;
        case "dues_reminder":
          await sendDuesNotificationEmail(env, to, name, amount!, dueDate!);
          break;
      }
      msg.ack();
    } catch (err) {
      console.error("[Queue] Email send failed:", err);
      msg.retry();
    }
  }
}

export async function handlePaymentQueue(batch: MessageBatch<PaymentMessage>, env: Env) {
  const db = getDb(env);

  for (const msg of batch.messages) {
    try {
      const { paymentId, transactionId } = msg.body;

      // Check settlement status with Helcim
      let res = await fetch(`https://api.helcim.com/v2/card-transactions/${transactionId}`, {
        headers: { accept: "application/json", "api-token": env.HELCIM_API_TOKEN },
      });

      if (!res.ok) {
        res = await fetch(`https://api.helcim.com/v2/bank-transactions/${transactionId}`, {
          headers: { accept: "application/json", "api-token": env.HELCIM_API_TOKEN },
        });
      }

      if (!res.ok) {
        // Not found yet - retry later
        msg.retry();
        continue;
      }

      const tx = await res.json();
      const settled = tx.status === "APPROVED" || tx.statusClearing === "SETTLED" || tx.statusClearing === 3;

      if (settled) {
        // Idempotent: only update if still in pending state
        await db.update(payments).set({
          status: "settled", settledAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        }).where(and(eq(payments.id, paymentId), eq(payments.status, "pending")));

        await db.update(duesPayments).set({
          status: "paid", paidDate: new Date().toISOString(), updatedAt: new Date().toISOString(),
        }).where(and(eq(duesPayments.helcimTransactionId, transactionId), eq(duesPayments.status, "payment_pending")));

        console.log(`[Queue] Settled payment ${paymentId}`);
        msg.ack();
      } else {
        // Not settled yet - retry
        msg.retry();
      }
    } catch (err) {
      console.error("[Queue] Payment settlement failed:", err);
      msg.retry();
    }
  }
}
