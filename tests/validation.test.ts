import { describe, it, expect } from "vitest";
import {
  createRequestSchema,
  reviewRequestSchema,
  commentRequestSchema,
  castVoteSchema,
  createUserSchema,
  updateProfileSchema,
  pushSubscriptionSchema,
  bylawsAskSchema,
} from "../shared/schema";

describe("createRequestSchema", () => {
  it("accepts valid input", () => {
    const result = createRequestSchema.safeParse({
      title: "Fix the fence",
      description: "The fence on the north side is broken and needs repair",
      requestType: "architectural",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty title", () => {
    const result = createRequestSchema.safeParse({
      title: "",
      description: "A valid description here",
      requestType: "architectural",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short description", () => {
    const result = createRequestSchema.safeParse({
      title: "Valid title",
      description: "Short",
      requestType: "architectural",
    });
    expect(result.success).toBe(false);
  });

  it("rejects title over 200 chars", () => {
    const result = createRequestSchema.safeParse({
      title: "A".repeat(201),
      description: "A valid description here",
      requestType: "architectural",
    });
    expect(result.success).toBe(false);
  });

  it("defaults requestType to architectural", () => {
    const result = createRequestSchema.safeParse({
      title: "Valid title",
      description: "A valid description here",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.requestType).toBe("architectural");
    }
  });

  it("rejects invalid requestType", () => {
    const result = createRequestSchema.safeParse({
      title: "Valid title",
      description: "A valid description here",
      requestType: "invalid_type",
    });
    expect(result.success).toBe(false);
  });
});

describe("reviewRequestSchema", () => {
  it("accepts valid approval", () => {
    const result = reviewRequestSchema.safeParse({
      requestId: "550e8400-e29b-41d4-a716-446655440000",
      status: "approved",
      reviewNotes: "Looks good",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid denial", () => {
    const result = reviewRequestSchema.safeParse({
      requestId: "550e8400-e29b-41d4-a716-446655440000",
      status: "denied",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = reviewRequestSchema.safeParse({
      requestId: "550e8400-e29b-41d4-a716-446655440000",
      status: "pending",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-UUID requestId", () => {
    const result = reviewRequestSchema.safeParse({
      requestId: "not-a-uuid",
      status: "approved",
    });
    expect(result.success).toBe(false);
  });

  it("rejects review notes over 2000 chars", () => {
    const result = reviewRequestSchema.safeParse({
      requestId: "550e8400-e29b-41d4-a716-446655440000",
      status: "approved",
      reviewNotes: "A".repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});

describe("commentRequestSchema", () => {
  it("accepts valid comment", () => {
    const result = commentRequestSchema.safeParse({
      requestId: "550e8400-e29b-41d4-a716-446655440000",
      comment: "This is a valid comment",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty comment", () => {
    const result = commentRequestSchema.safeParse({
      requestId: "550e8400-e29b-41d4-a716-446655440000",
      comment: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects comment over 2000 chars", () => {
    const result = commentRequestSchema.safeParse({
      requestId: "550e8400-e29b-41d4-a716-446655440000",
      comment: "A".repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});

describe("castVoteSchema", () => {
  it("accepts valid vote", () => {
    const result = castVoteSchema.safeParse({
      ballotId: "550e8400-e29b-41d4-a716-446655440000",
      optionId: "660e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-UUID ballotId", () => {
    const result = castVoteSchema.safeParse({
      ballotId: "not-uuid",
      optionId: "660e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing optionId", () => {
    const result = castVoteSchema.safeParse({
      ballotId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(false);
  });
});

describe("createUserSchema", () => {
  it("accepts valid user", () => {
    const result = createUserSchema.safeParse({
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
      role: "homeowner",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = createUserSchema.safeParse({
      email: "not-an-email",
      firstName: "John",
      lastName: "Doe",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty firstName", () => {
    const result = createUserSchema.safeParse({
      email: "test@example.com",
      firstName: "",
      lastName: "Doe",
    });
    expect(result.success).toBe(false);
  });

  it("defaults role to homeowner", () => {
    const result = createUserSchema.safeParse({
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.role).toBe("homeowner");
    }
  });

  it("rejects invalid role", () => {
    const result = createUserSchema.safeParse({
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
      role: "superadmin",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateProfileSchema", () => {
  it("accepts partial update", () => {
    const result = updateProfileSchema.safeParse({
      firstName: "Jane",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = updateProfileSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects firstName over 100 chars", () => {
    const result = updateProfileSchema.safeParse({
      firstName: "A".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("rejects phone over 20 chars", () => {
    const result = updateProfileSchema.safeParse({
      phoneNumber: "1".repeat(21),
    });
    expect(result.success).toBe(false);
  });
});

describe("pushSubscriptionSchema", () => {
  it("accepts valid subscription", () => {
    const result = pushSubscriptionSchema.safeParse({
      endpoint: "https://push.example.com/send/123",
      keys: {
        p256dh: "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-T4=",
        auth: "tBHItJI5svbpC7v8Q=",
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid endpoint URL", () => {
    const result = pushSubscriptionSchema.safeParse({
      endpoint: "not-a-url",
      keys: { p256dh: "abc", auth: "def" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing keys", () => {
    const result = pushSubscriptionSchema.safeParse({
      endpoint: "https://push.example.com/send/123",
    });
    expect(result.success).toBe(false);
  });
});

describe("bylawsAskSchema", () => {
  it("accepts valid question", () => {
    const result = bylawsAskSchema.safeParse({
      question: "Can I paint my front door red?",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty question", () => {
    const result = bylawsAskSchema.safeParse({ question: "" });
    expect(result.success).toBe(false);
  });

  it("rejects question over 1000 chars", () => {
    const result = bylawsAskSchema.safeParse({
      question: "A".repeat(1001),
    });
    expect(result.success).toBe(false);
  });
});
