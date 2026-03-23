import { describe, it, expect } from "vitest";

/**
 * Autopay business logic tests.
 * Tests the decision logic for autopay eligibility and subscription management.
 */

describe("autopay eligibility", () => {
  interface User {
    autopayEnabled: boolean;
    helcimSubscriptionId: number | null;
    helcimCustomerCode: string | null;
    memberStatus: string;
  }

  function canSetupAutopay(user: User): { eligible: boolean; reason?: string } {
    if (user.memberStatus !== "active") {
      return { eligible: false, reason: "Account is not active" };
    }
    if (user.autopayEnabled && user.helcimSubscriptionId) {
      return { eligible: false, reason: "Autopay is already active" };
    }
    return { eligible: true };
  }

  function canCancelAutopay(user: User): { eligible: boolean; reason?: string } {
    if (!user.autopayEnabled || !user.helcimSubscriptionId) {
      return { eligible: false, reason: "No active autopay subscription" };
    }
    return { eligible: true };
  }

  it("allows active user to set up autopay", () => {
    const result = canSetupAutopay({
      autopayEnabled: false,
      helcimSubscriptionId: null,
      helcimCustomerCode: null,
      memberStatus: "active",
    });
    expect(result.eligible).toBe(true);
  });

  it("blocks inactive user from setting up autopay", () => {
    const result = canSetupAutopay({
      autopayEnabled: false,
      helcimSubscriptionId: null,
      helcimCustomerCode: null,
      memberStatus: "inactive",
    });
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe("Account is not active");
  });

  it("blocks user who already has autopay", () => {
    const result = canSetupAutopay({
      autopayEnabled: true,
      helcimSubscriptionId: 12345,
      helcimCustomerCode: "CUST001",
      memberStatus: "active",
    });
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe("Autopay is already active");
  });

  it("allows re-setup if subscription was cleared", () => {
    const result = canSetupAutopay({
      autopayEnabled: false,
      helcimSubscriptionId: null,
      helcimCustomerCode: "CUST001",
      memberStatus: "active",
    });
    expect(result.eligible).toBe(true);
  });

  it("allows cancel when autopay is active", () => {
    const result = canCancelAutopay({
      autopayEnabled: true,
      helcimSubscriptionId: 12345,
      helcimCustomerCode: "CUST001",
      memberStatus: "active",
    });
    expect(result.eligible).toBe(true);
  });

  it("blocks cancel when no subscription", () => {
    const result = canCancelAutopay({
      autopayEnabled: false,
      helcimSubscriptionId: null,
      helcimCustomerCode: null,
      memberStatus: "active",
    });
    expect(result.eligible).toBe(false);
  });
});

describe("autopay subscription state transitions", () => {
  type AutopayState = "inactive" | "setup_pending" | "active" | "cancelling";

  function getAutopayState(user: {
    autopayEnabled: boolean;
    helcimSubscriptionId: number | null;
  }): AutopayState {
    if (user.autopayEnabled && user.helcimSubscriptionId) return "active";
    return "inactive";
  }

  it("returns inactive when not enabled", () => {
    expect(getAutopayState({ autopayEnabled: false, helcimSubscriptionId: null })).toBe("inactive");
  });

  it("returns active when enabled with subscription", () => {
    expect(getAutopayState({ autopayEnabled: true, helcimSubscriptionId: 123 })).toBe("active");
  });

  it("returns inactive when enabled but no subscription (stale state)", () => {
    expect(getAutopayState({ autopayEnabled: true, helcimSubscriptionId: null })).toBe("inactive");
  });
});

describe("dues amount validation for autopay", () => {
  function isValidAutopayAmount(amount: number): boolean {
    return amount > 0 && amount < 10000 && Number.isFinite(amount);
  }

  it("accepts normal dues amount", () => {
    expect(isValidAutopayAmount(150)).toBe(true);
  });

  it("accepts small amount", () => {
    expect(isValidAutopayAmount(1)).toBe(true);
  });

  it("rejects zero", () => {
    expect(isValidAutopayAmount(0)).toBe(false);
  });

  it("rejects negative", () => {
    expect(isValidAutopayAmount(-50)).toBe(false);
  });

  it("rejects unreasonably large amount", () => {
    expect(isValidAutopayAmount(10000)).toBe(false);
  });

  it("rejects NaN", () => {
    expect(isValidAutopayAmount(NaN)).toBe(false);
  });

  it("rejects Infinity", () => {
    expect(isValidAutopayAmount(Infinity)).toBe(false);
  });
});
