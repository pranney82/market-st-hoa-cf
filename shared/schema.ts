import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real, uniqueIndex, index } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// D1 helpers
const id = () => text("id").primaryKey().$defaultFn(() => crypto.randomUUID());
const ts = { createdAt: text("created_at").$defaultFn(() => new Date().toISOString()), updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()) };

// Types
export type UserRole = "admin" | "board" | "homeowner";
export type UserPosition = "president" | "vice_president" | "secretary" | "treasurer" | "member" | null;
export type BallotType = "yes_no" | "multiple_choice" | "election";
export type BallotStatus = "draft" | "active" | "closed" | "cancelled";

// ── Tables ──────────────────────────────────────────────────────

export const households = sqliteTable("households", {
  id: id(), address: text("address").notNull(), unitNumber: text("unit_number"),
  primaryContactId: text("primary_contact_id"), notes: text("notes"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  movingStatus: text("moving_status"), movingDate: text("moving_date"), ...ts,
}, (t) => [uniqueIndex("households_address_unit_idx").on(t.address, t.unitNumber)]);

export const users = sqliteTable("users", {
  id: text("id").primaryKey(), email: text("email").unique(),
  firstName: text("first_name"), lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  role: text("role").notNull().default("homeowner"), position: text("position"),
  unitNumber: text("unit_number"), address: text("address"), phoneNumber: text("phone_number"),
  emergencyContact: text("emergency_contact"),
  spousePartnerName: text("spouse_partner_name"), spousePartnerPhone: text("spouse_partner_phone"), spousePartnerEmail: text("spouse_partner_email"),
  emergencyContactName: text("emergency_contact_name"), emergencyContactPhone: text("emergency_contact_phone"),
  emergencyContactIsSpouse: integer("emergency_contact_is_spouse", { mode: "boolean" }).default(false),
  kids: text("kids"), pets: text("pets"), // JSON arrays as text

  emailNotifications: integer("email_notifications", { mode: "boolean" }).default(true),
  autopayEnabled: integer("autopay_enabled", { mode: "boolean" }).default(false),
  autopayMethod: text("autopay_method"), autopayCardToken: text("autopay_card_token"),
  autopayCardLast4: text("autopay_card_last4"), autopayCardType: text("autopay_card_type"), autopayCardExpiry: text("autopay_card_expiry"),
  autopayBankToken: text("autopay_bank_token"), autopayBankLast4: text("autopay_bank_last4"), autopayBankName: text("autopay_bank_name"), autopayBankType: text("autopay_bank_type"),
  helcimCustomerCode: text("helcim_customer_code"), // Helcim customer ID for recurring
  helcimSubscriptionId: integer("helcim_subscription_id"), // Helcim recurring subscription ID
  householdId: text("household_id").references(() => households.id, { onDelete: "set null" }),
  movingStatus: text("moving_status"), movingDate: text("moving_date"),
  memberStatus: text("member_status").notNull().default("active"),
  departedAt: text("departed_at"), departureNotes: text("departure_notes"),
  profileCompleted: integer("profile_completed", { mode: "boolean" }).default(false),
  ...ts,
}, (t) => [
  index("users_household_id_idx").on(t.householdId),
  index("users_member_status_idx").on(t.memberStatus),
]);


export const documents = sqliteTable("documents", {
  id: id(), fileName: text("file_name").notNull(), fileSize: text("file_size").notNull(),
  mimeType: text("mime_type").notNull(), storagePath: text("storage_path").notNull(),
  category: text("category").notNull(), tags: text("tags"), description: text("description"),
  uploadedBy: text("uploaded_by").references(() => users.id, { onDelete: "set null" }),
  isPublic: integer("is_public", { mode: "boolean" }).default(false), version: text("version").default("1"), ...ts,
});

export const documentCategories = ["Bylaws","Financial","Minutes","Insurance","Contracts","Rules","Forms","Notices","Other"] as const;

export const architecturalRequests = sqliteTable("architectural_requests", {
  id: id(), requestType: text("request_type").notNull().default("architectural"),
  title: text("title").notNull(), description: text("description").notNull(),
  status: text("status").notNull().default("pending"),
  householdId: text("household_id").references(() => households.id, { onDelete: "cascade" }),
  submittedBy: text("submitted_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  reviewedBy: text("reviewed_by").references(() => users.id, { onDelete: "set null" }),
  reviewNotes: text("review_notes"), attachmentUrls: text("attachment_urls"), // JSON
  ...ts, reviewedAt: text("reviewed_at"),
}, (t) => [
  index("architectural_requests_submitted_by_idx").on(t.submittedBy),
  index("architectural_requests_household_id_idx").on(t.householdId),
]);

export const requestComments = sqliteTable("request_comments", {
  id: id(), requestId: text("request_id").notNull().references(() => architecturalRequests.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  comment: text("comment").notNull(), ...ts,
});

export const requestVotes = sqliteTable("request_votes", {
  id: id(), requestId: text("request_id").notNull().references(() => architecturalRequests.id, { onDelete: "cascade" }),
  householdId: text("household_id").notNull().references(() => households.id, { onDelete: "cascade" }),
  voterId: text("voter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  vote: text("vote").notNull(), createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
}, (t) => [uniqueIndex("request_votes_household_request_idx").on(t.requestId, t.householdId)]);

export const duesPayments = sqliteTable("dues_payments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  paymentType: text("payment_type").notNull(), amount: text("amount").notNull(),
  periodStart: text("period_start").notNull(), periodEnd: text("period_end").notNull(),
  status: text("status").notNull().default("pending"), dueDate: text("due_date").notNull(),
  paidDate: text("paid_date"), helcimTransactionId: text("helcim_transaction_id"),
  autopayAttemptedAt: text("autopay_attempted_at"), autopayStatus: text("autopay_status"),
  autopayFailureReason: text("autopay_failure_reason"), notes: text("notes"),
  description: text("description"), imageUrl: text("image_url"), ...ts,
}, (t) => [
  index("dues_payments_user_id_idx").on(t.userId),
  index("dues_payments_status_idx").on(t.status),
  index("dues_payments_user_status_idx").on(t.userId, t.status),
  index("dues_payments_due_date_idx").on(t.dueDate),
]);

export const payments = sqliteTable("payments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  householdId: text("household_id").references(() => households.id, { onDelete: "set null" }),
  amount: text("amount").notNull(), paymentMethod: text("payment_method").notNull(),
  helcimTransactionId: text("helcim_transaction_id").notNull().unique(),
  last4: text("last4"), cardType: text("card_type"), bankName: text("bank_name"),
  status: text("status").notNull().default("pending"), settledAt: text("settled_at"),
  failureReason: text("failure_reason"), appliedAmount: text("applied_amount").default("0"),
  unappliedAmount: text("unapplied_amount"), source: text("source").notNull().default("online"),
  notes: text("notes"), ...ts,
}, (t) => [
  index("payments_user_id_idx").on(t.userId),
  index("payments_status_idx").on(t.status),
  index("payments_created_at_idx").on(t.createdAt),
]);

export const paymentApplications = sqliteTable("payment_applications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  paymentId: text("payment_id").notNull().references(() => payments.id, { onDelete: "cascade" }),
  duesPaymentId: text("dues_payment_id").notNull().references(() => duesPayments.id, { onDelete: "cascade" }),
  amount: text("amount").notNull(), appliedAt: text("applied_at").$defaultFn(() => new Date().toISOString()),
});

export const bylaws = sqliteTable("bylaws", {
  id: id(), content: text("content").notNull(), version: text("version").notNull().default("1.0"),
  isCurrent: integer("is_current", { mode: "boolean" }).notNull().default(true),
  updatedBy: text("updated_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  notes: text("notes"), ...ts,
});

export const accountCategories = sqliteTable("account_categories", {
  id: id(), code: text("code").notNull().unique(), name: text("name").notNull(),
  type: text("type").notNull(), description: text("description"),
  isActive: integer("is_active", { mode: "boolean" }).default(true), parentId: text("parent_id"), ...ts,
});

export const transactions = sqliteTable("transactions", {
  id: id(), date: text("date").notNull(), description: text("description").notNull(),
  amount: text("amount").notNull(), type: text("type").notNull(),
  categoryId: text("category_id").references(() => accountCategories.id),
  reference: text("reference"), notes: text("notes"), ...ts,
}, (t) => [
  index("transactions_date_idx").on(t.date),
  index("transactions_category_id_idx").on(t.categoryId),
  index("transactions_reference_idx").on(t.reference),
]);

export const budgets = sqliteTable("budgets", {
  id: id(), categoryId: text("category_id").references(() => accountCategories.id),
  year: integer("year").notNull(), month: integer("month"),
  budgetedAmount: text("budgeted_amount").notNull(), notes: text("notes"), ...ts,
});

export const reconciliations = sqliteTable("reconciliations", {
  id: id(), reconciliationDate: text("reconciliation_date").notNull(),
  startingBalance: text("starting_balance").notNull(), endingBalance: text("ending_balance").notNull(),
  clearedBalance: text("cleared_balance").notNull(), differenceAmount: text("difference_amount"),
  isBalanced: integer("is_balanced", { mode: "boolean" }).default(false),
  reconciledBy: text("reconciled_by").notNull(), notes: text("notes"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const transactionCodings = sqliteTable("transaction_codings", {
  id: id(), mercuryTransactionId: text("mercury_transaction_id").notNull().unique(),
  categoryId: text("category_id").references(() => accountCategories.id),
  status: text("status").default("coded"), notes: text("notes"),
  codedBy: text("coded_by").references(() => users.id),
  codedAt: text("coded_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
});

export const ballots = sqliteTable("ballots", {
  id: id(), title: text("title").notNull(), description: text("description").notNull(),
  ballotType: text("ballot_type").notNull().default("yes_no"),
  status: text("status").notNull().default("draft"),
  createdBy: text("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  startsAt: text("starts_at").notNull(), endsAt: text("ends_at").notNull(),
  showResultsBeforeClose: integer("show_results_before_close", { mode: "boolean" }).default(false),
  requiresQuorum: integer("requires_quorum", { mode: "boolean" }).default(true),
  quorumPercentage: integer("quorum_percentage").default(50), ...ts,
});

export const ballotOptions = sqliteTable("ballot_options", {
  id: id(), ballotId: text("ballot_id").notNull().references(() => ballots.id, { onDelete: "cascade" }),
  optionText: text("option_text").notNull(), optionDescription: text("option_description"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const householdVotes = sqliteTable("household_votes", {
  id: id(), ballotId: text("ballot_id").notNull().references(() => ballots.id, { onDelete: "cascade" }),
  householdId: text("household_id").notNull().references(() => households.id, { onDelete: "cascade" }),
  optionId: text("option_id").notNull().references(() => ballotOptions.id, { onDelete: "cascade" }),
  votedBy: text("voted_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  votedAt: text("voted_at").$defaultFn(() => new Date().toISOString()),
}, (t) => [uniqueIndex("household_votes_ballot_household_idx").on(t.ballotId, t.householdId)]);

export const systemSettings = sqliteTable("system_settings", {
  id: id(), key: text("key").notNull().unique(), value: text("value").notNull(),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
});

export const auditLogs = sqliteTable("audit_logs", {
  id: id(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  userEmail: text("user_email"),
  action: text("action").notNull(), // e.g. "user.create", "request.approve", "vote.cast"
  resourceType: text("resource_type").notNull(), // e.g. "user", "request", "payment", "vote"
  resourceId: text("resource_id"),
  details: text("details"), // JSON string with action-specific context
  ipAddress: text("ip_address"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
}, (t) => [
  index("audit_logs_user_id_idx").on(t.userId),
  index("audit_logs_action_idx").on(t.action),
  index("audit_logs_resource_type_idx").on(t.resourceType),
  index("audit_logs_created_at_idx").on(t.createdAt),
]);

// ── Zod Schemas ─────────────────────────────────────────────────
export const upsertUserSchema = createInsertSchema(users).omit({ createdAt: true, updatedAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ createdAt: true, updatedAt: true }).partial({ id: true });
export const updateUserRoleSchema = z.object({ role: z.enum(["admin", "board", "homeowner"]) });
export const updateUserPositionSchema = z.object({ position: z.enum(["president", "vice_president", "secretary", "treasurer", "member"]).nullable() });
export const updateUserProfileSchema = z.object({
  firstName: z.string().min(1).optional(), lastName: z.string().min(1).optional(),
  phoneNumber: z.string().optional(), address: z.string().optional(), unitNumber: z.string().optional(),
  emergencyContact: z.string().optional(), spousePartnerName: z.string().optional(),
  spousePartnerPhone: z.string().optional(), spousePartnerEmail: z.string().email().optional().or(z.literal("")),
  emergencyContactName: z.string().optional(), emergencyContactPhone: z.string().optional(),
  emergencyContactIsSpouse: z.boolean().optional(), kids: z.array(z.string()).optional(), pets: z.array(z.string()).optional(),
});
export const updateNotificationPreferencesSchema = z.object({ emailNotifications: z.boolean() });
export const updateMemberStatusSchema = z.object({ memberStatus: z.enum(["active", "inactive", "archived", "deceased"]), departureNotes: z.string().optional() });
export const insertHouseholdSchema = createInsertSchema(households).omit({ id: true, createdAt: true, updatedAt: true });
export const updateHouseholdSchema = z.object({ address: z.string().min(1).optional(), unitNumber: z.string().optional(), primaryContactId: z.string().optional(), notes: z.string().optional(), isActive: z.boolean().optional(), movingStatus: z.enum(["active", "moving_out", "moved"]).nullable().optional(), movingDate: z.string().nullable().optional() });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, createdAt: true, updatedAt: true }).extend({ category: z.enum(documentCategories), tags: z.array(z.string()).optional(), description: z.string().optional(), isPublic: z.boolean().optional() });
export const updateDocumentSchema = insertDocumentSchema.partial().omit({ fileSize: true, mimeType: true, storagePath: true, uploadedBy: true });
export const insertBylawsSchema = createInsertSchema(bylaws).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBudgetSchema = createInsertSchema(budgets).omit({ id: true, createdAt: true, updatedAt: true });

// ── Type Exports ────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Household = typeof households.$inferSelect;
export type InsertHousehold = z.infer<typeof insertHouseholdSchema>;
export type UpdateHousehold = z.infer<typeof updateHouseholdSchema>;
export type Document = typeof documents.$inferSelect;
export type ArchitecturalRequest = typeof architecturalRequests.$inferSelect;
export type RequestComment = typeof requestComments.$inferSelect;
export type RequestVote = typeof requestVotes.$inferSelect;
export type DuesPayment = typeof duesPayments.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type PaymentApplication = typeof paymentApplications.$inferSelect;
export type Bylaws = typeof bylaws.$inferSelect;
export type Budget = typeof budgets.$inferSelect;
export type Reconciliation = typeof reconciliations.$inferSelect;
export type TransactionCoding = typeof transactionCodings.$inferSelect;
export type Ballot = typeof ballots.$inferSelect;
export type BallotOption = typeof ballotOptions.$inferSelect;
export type HouseholdVote = typeof householdVotes.$inferSelect;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;

// ── API Input Validation Schemas ────────────────────────────────
export const createRequestSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000, "Description too long"),
  requestType: z.enum(["architectural", "general", "contract_change", "bylaw_update"]).default("architectural"),
});

export const reviewRequestSchema = z.object({
  requestId: z.string().uuid("Invalid request ID"),
  status: z.enum(["approved", "denied"], { message: "Status must be approved or denied" }),
  reviewNotes: z.string().max(2000, "Notes too long").optional().default(""),
});

export const commentRequestSchema = z.object({
  requestId: z.string().uuid("Invalid request ID"),
  comment: z.string().min(1, "Comment is required").max(2000, "Comment too long"),
});

export const castVoteSchema = z.object({
  ballotId: z.string().uuid("Invalid ballot ID"),
  optionId: z.string().uuid("Invalid option ID"),
});

export const createUserSchema = z.object({
  email: z.string().email("Invalid email format").max(255),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  role: z.enum(["admin", "board", "homeowner"]).default("homeowner"),
  householdId: z.string().uuid().nullable().optional(),
  sendWelcome: z.boolean().default(false),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phoneNumber: z.string().max(20).optional(),
});

export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export const bylawsAskSchema = z.object({
  question: z.string().min(1, "Question is required").max(1000, "Question too long"),
});

export function formatPosition(position: UserPosition): string {
  if (!position) return "";
  return { president: "President", vice_president: "Vice President", secretary: "Secretary", treasurer: "Treasurer", member: "Board Member" }[position] || "";
}

export const standardAccountCategories = [
  { code: "1000", name: "Cash - Operating Account", type: "asset" },
  { code: "1100", name: "Cash - Reserve Account", type: "asset" },
  { code: "1200", name: "Accounts Receivable - Dues", type: "asset" },
  { code: "1300", name: "Prepaid Insurance", type: "asset" },
  { code: "1400", name: "Equipment", type: "asset" },
  { code: "2000", name: "Accounts Payable", type: "liability" },
  { code: "2100", name: "Deferred Revenue", type: "liability" },
  { code: "2200", name: "Loans Payable", type: "liability" },
  { code: "3000", name: "Retained Earnings", type: "equity" },
  { code: "3100", name: "Current Year Surplus/Deficit", type: "equity" },
  { code: "4000", name: "Monthly Dues", type: "revenue" },
  { code: "4100", name: "Special Assessments", type: "revenue" },
  { code: "4200", name: "Late Fees", type: "revenue" },
  { code: "4300", name: "Interest Income", type: "revenue" },
  { code: "4400", name: "Other Income", type: "revenue" },
  { code: "5000", name: "Landscaping", type: "expense" },
  { code: "5100", name: "Pool Maintenance", type: "expense" },
  { code: "5200", name: "Building Maintenance", type: "expense" },
  { code: "5300", name: "Common Area Utilities", type: "expense" },
  { code: "5400", name: "Pest Control", type: "expense" },
  { code: "6000", name: "Insurance - Property", type: "expense" },
  { code: "6100", name: "Insurance - Liability", type: "expense" },
  { code: "7000", name: "Management Fees", type: "expense" },
  { code: "7100", name: "Legal Fees", type: "expense" },
  { code: "7200", name: "Accounting Fees", type: "expense" },
  { code: "8000", name: "Reserve Fund Contribution", type: "expense" },
  { code: "9000", name: "Office Supplies", type: "expense" },
  { code: "9100", name: "Bank Fees", type: "expense" },
];
