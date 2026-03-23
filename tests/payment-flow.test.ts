import { describe, it, expect } from "vitest";

/**
 * Payment flow logic tests.
 * These test the pure business logic extracted from the payment endpoints,
 * without requiring actual Helcim API calls or D1 database.
 */

describe("payment amount calculation", () => {
  function calculatePaymentAmount(dues: { amount: string; status: string }[]): number {
    return dues
      .filter(d => d.status === "pending" || d.status === "overdue")
      .reduce((sum, d) => sum + parseFloat(d.amount), 0);
  }

  it("sums pending dues correctly", () => {
    const dues = [
      { amount: "150.00", status: "pending" },
      { amount: "150.00", status: "pending" },
      { amount: "150.00", status: "paid" },
    ];
    expect(calculatePaymentAmount(dues)).toBe(300);
  });

  it("includes overdue dues", () => {
    const dues = [
      { amount: "150.00", status: "overdue" },
      { amount: "150.00", status: "pending" },
    ];
    expect(calculatePaymentAmount(dues)).toBe(300);
  });

  it("excludes paid and payment_pending dues", () => {
    const dues = [
      { amount: "150.00", status: "paid" },
      { amount: "150.00", status: "payment_pending" },
      { amount: "150.00", status: "waived" },
    ];
    expect(calculatePaymentAmount(dues)).toBe(0);
  });

  it("returns 0 when no dues exist", () => {
    expect(calculatePaymentAmount([])).toBe(0);
  });

  it("handles decimal amounts", () => {
    const dues = [
      { amount: "75.50", status: "pending" },
      { amount: "24.50", status: "pending" },
    ];
    expect(calculatePaymentAmount(dues)).toBe(100);
  });
});

describe("payment application logic", () => {
  interface DuesItem {
    id: string;
    amount: string;
    status: string;
  }

  interface Application {
    duesId: string;
    appliedAmount: number;
    fullyPaid: boolean;
  }

  function applyPaymentToDues(
    totalPayment: number,
    pendingDues: DuesItem[]
  ): { applications: Application[]; remaining: number } {
    const applications: Application[] = [];
    let remaining = totalPayment;

    for (const dues of pendingDues) {
      if (remaining <= 0) break;
      const duesAmount = parseFloat(dues.amount);
      const applyAmount = Math.min(remaining, duesAmount);

      applications.push({
        duesId: dues.id,
        appliedAmount: applyAmount,
        fullyPaid: applyAmount >= duesAmount,
      });

      remaining -= applyAmount;
    }

    return { applications, remaining };
  }

  it("applies to single dues exactly", () => {
    const result = applyPaymentToDues(150, [
      { id: "d1", amount: "150.00", status: "pending" },
    ]);
    expect(result.applications).toHaveLength(1);
    expect(result.applications[0].appliedAmount).toBe(150);
    expect(result.applications[0].fullyPaid).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it("applies to multiple dues in order", () => {
    const result = applyPaymentToDues(300, [
      { id: "d1", amount: "150.00", status: "pending" },
      { id: "d2", amount: "150.00", status: "pending" },
    ]);
    expect(result.applications).toHaveLength(2);
    expect(result.applications[0].fullyPaid).toBe(true);
    expect(result.applications[1].fullyPaid).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it("handles partial payment of last dues item", () => {
    const result = applyPaymentToDues(200, [
      { id: "d1", amount: "150.00", status: "pending" },
      { id: "d2", amount: "150.00", status: "pending" },
    ]);
    expect(result.applications).toHaveLength(2);
    expect(result.applications[0].fullyPaid).toBe(true);
    expect(result.applications[1].appliedAmount).toBe(50);
    expect(result.applications[1].fullyPaid).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("handles overpayment", () => {
    const result = applyPaymentToDues(500, [
      { id: "d1", amount: "150.00", status: "pending" },
    ]);
    expect(result.applications).toHaveLength(1);
    expect(result.remaining).toBe(350);
  });

  it("handles zero payment", () => {
    const result = applyPaymentToDues(0, [
      { id: "d1", amount: "150.00", status: "pending" },
    ]);
    expect(result.applications).toHaveLength(0);
    expect(result.remaining).toBe(0);
  });

  it("handles no pending dues", () => {
    const result = applyPaymentToDues(150, []);
    expect(result.applications).toHaveLength(0);
    expect(result.remaining).toBe(150);
  });
});

describe("payment settlement status", () => {
  function isSettled(tx: {
    status?: string;
    statusClearing?: string | number;
  }): boolean {
    return (
      tx.status === "APPROVED" ||
      tx.statusClearing === "SETTLED" ||
      tx.statusClearing === 3
    );
  }

  it("recognizes APPROVED status", () => {
    expect(isSettled({ status: "APPROVED" })).toBe(true);
  });

  it("recognizes SETTLED clearing status", () => {
    expect(isSettled({ statusClearing: "SETTLED" })).toBe(true);
  });

  it("recognizes numeric clearing status 3", () => {
    expect(isSettled({ statusClearing: 3 })).toBe(true);
  });

  it("rejects PENDING status", () => {
    expect(isSettled({ status: "PENDING" })).toBe(false);
  });

  it("rejects undefined status", () => {
    expect(isSettled({})).toBe(false);
  });
});
