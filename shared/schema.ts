import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  timestamp, 
  index,
  uniqueIndex,
  jsonb,
  boolean,
  decimal,
  integer,
  uuid
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles for HOA management
export type UserRole = "admin" | "board" | "homeowner";

// HOA officer positions
export type UserPosition = 
  | "president" 
  | "vice_president" 
  | "secretary" 
  | "treasurer" 
  | "member" 
  | null;

// Moving status for households and members
export type MovingStatus = "active" | "moving_out" | "moved" | null;

// Member status for lifecycle management
export type MemberStatus = "active" | "inactive" | "archived" | "deceased";

// Departure reason when member leaves
export type DepartureReason = "moved_out" | "deceased" | "evicted" | "other" | null;

// Households table - represents a single property/residence for voting purposes
// Multiple users (family members) can belong to the same household
export const households = pgTable("households", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  address: text("address").notNull(), // Full street address (e.g., "667 Market Street")
  unitNumber: text("unit_number"), // Optional unit identifier (e.g., "A", "B", "101")
  primaryContactId: varchar("primary_contact_id"), // Optional designated primary contact (set after users exist)
  notes: text("notes"), // Admin notes about the household
  isActive: boolean("is_active").default(true), // Whether household is active
  movingStatus: text("moving_status"), // active, moving_out, moved - tracks if property is being vacated/sold
  movingDate: timestamp("moving_date"), // Expected or actual move-out date
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  // Composite unique constraint: one household per address+unit combination
  // Handles both single-family homes (no unit) and multi-unit properties
  uniqueIndex("households_address_unit_idx").on(table.address, table.unitNumber),
]);

// Users table with Replit Auth compatibility and role-based access
export const users = pgTable("users", {
  // Primary key - stable user ID from Replit Auth OpenID Connect 'sub' claim
  id: varchar("id").primaryKey(),
  
  // Replit Auth fields (from OpenID Connect)
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  
  // HOA-specific fields
  role: text("role").notNull().default("homeowner"), // admin, board, homeowner
  position: text("position"), // president, vice_president, secretary, treasurer, member
  unitNumber: text("unit_number"), // Property/unit identifier
  address: text("address"), // Full street address
  phoneNumber: text("phone_number"),
  emergencyContact: text("emergency_contact"), // Legacy: Emergency contact name and phone (deprecated, use split fields)
  spousePartnerName: text("spouse_partner_name"), // Spouse or partner's name
  spousePartnerPhone: text("spouse_partner_phone"), // Spouse or partner's phone
  spousePartnerEmail: text("spouse_partner_email"), // Spouse or partner's email
  emergencyContactName: text("emergency_contact_name"), // Emergency contact's name
  emergencyContactPhone: text("emergency_contact_phone"), // Emergency contact's phone number
  emergencyContactIsSpouse: boolean("emergency_contact_is_spouse").default(false), // True if spouse/partner is emergency contact
  kids: text("kids").array(), // Names of children
  pets: text("pets").array(), // Names of pets
  
  // Optional local password (for users without Replit accounts)
  localPasswordHash: text("local_password_hash"),
  
  // Notification preferences
  emailNotifications: boolean("email_notifications").default(true),
  announcementNotifications: boolean("announcement_notifications").default(true),
  eventNotifications: boolean("event_notifications").default(true),
  
  // Autopay settings for recurring monthly dues
  autopayEnabled: boolean("autopay_enabled").default(false),
  autopayMethod: text("autopay_method"), // 'card' or 'ach' - which payment method to use for autopay
  autopayCardToken: text("autopay_card_token"), // Encrypted Helcim card token
  autopayCardLast4: varchar("autopay_card_last4", { length: 4 }), // Last 4 digits for display
  autopayCardType: varchar("autopay_card_type", { length: 20 }), // Card brand (Visa, MC, etc.)
  autopayCardExpiry: varchar("autopay_card_expiry", { length: 7 }), // MM/YYYY for display
  
  // ACH/Bank account autopay settings
  autopayBankToken: text("autopay_bank_token"), // Helcim bank token for ACH payments
  autopayBankLast4: varchar("autopay_bank_last4", { length: 4 }), // Last 4 digits of account number
  autopayBankName: varchar("autopay_bank_name", { length: 100 }), // Bank name or institution
  autopayBankType: varchar("autopay_bank_type", { length: 20 }), // checking or savings
  
  // Household relationship (for voting and dues management)
  householdId: varchar("household_id").references(() => households.id, { onDelete: "set null" }),
  
  // Moving status for individual members
  movingStatus: text("moving_status"), // active, moving_out, moved - tracks if member is leaving
  movingDate: timestamp("moving_date"), // Expected or actual move-out date
  
  // Member lifecycle status
  memberStatus: text("member_status").notNull().default("active"), // active, inactive, archived, deceased
  departedAt: timestamp("departed_at"), // When the member left/was archived
  departureNotes: text("departure_notes"), // Admin notes about departure
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Password reset tokens table
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(), // Store hashed token for security
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Invitations table for onboarding new homeowners
export const invitations = pgTable("invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull(),
  token: varchar("token").notNull().unique(), // Secure random token for registration link
  invitedBy: varchar("invited_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"), // pending, completed, expired, failed
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Schemas for operations
// upsertUserSchema includes id (from Replit Auth OIDC 'sub' claim)
export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
}).partial({ id: true }); // id is optional for manual user creation

export const updateUserRoleSchema = z.object({
  role: z.enum(["admin", "board", "homeowner"]),
});

export const updateUserPositionSchema = z.object({
  position: z.enum(["president", "vice_president", "secretary", "treasurer", "member"]).nullable(),
});

export const updateUserProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  unitNumber: z.string().optional(),
  emergencyContact: z.string().optional(),
  spousePartnerName: z.string().optional(),
  spousePartnerPhone: z.string().optional(),
  spousePartnerEmail: z.string().email().optional().or(z.literal("")),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactIsSpouse: z.boolean().optional(),
  kids: z.array(z.string()).optional(),
  pets: z.array(z.string()).optional(),
});

export const updateNotificationPreferencesSchema = z.object({
  emailNotifications: z.boolean(),
  announcementNotifications: z.boolean(),
  eventNotifications: z.boolean(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const updateMemberStatusSchema = z.object({
  memberStatus: z.enum(["active", "inactive", "archived", "deceased"]),
  departureNotes: z.string().optional(),
});

export type UpdateMemberStatus = z.infer<typeof updateMemberStatusSchema>;

export const requestPasswordResetSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UpdateUserRole = z.infer<typeof updateUserRoleSchema>;
export type UpdateUserPosition = z.infer<typeof updateUserPositionSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type UpdateNotificationPreferences = z.infer<typeof updateNotificationPreferencesSchema>;
export type ChangePassword = z.infer<typeof changePasswordSchema>;
export type RequestPasswordReset = z.infer<typeof requestPasswordResetSchema>;
export type ResetPassword = z.infer<typeof resetPasswordSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

// Invitation schemas
export const createInvitationSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const completeProfileSchema = z.object({
  token: z.string(),
  address: z.string().min(1, "Address is required"),
  phoneNumber: z.string().regex(/^\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/, "Invalid phone number format"),
  emergencyContact: z.string().optional(),
  kids: z.string().optional(),
  pets: z.string().optional(),
});

export type CreateInvitation = z.infer<typeof createInvitationSchema>;
export type CompleteProfile = z.infer<typeof completeProfileSchema>;
export type Invitation = typeof invitations.$inferSelect;

// Household schemas
export const insertHouseholdSchema = createInsertSchema(households).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateHouseholdSchema = z.object({
  address: z.string().min(1).optional(),
  unitNumber: z.string().optional(),
  primaryContactId: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
  movingStatus: z.enum(["active", "moving_out", "moved"]).nullable().optional(),
  movingDate: z.string().datetime().nullable().optional(),
});

export type Household = typeof households.$inferSelect;
export type InsertHousehold = z.infer<typeof insertHouseholdSchema>;
export type UpdateHousehold = z.infer<typeof updateHouseholdSchema>;

// Announcements table
export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: varchar("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  priority: text("priority").notNull().default("normal"), // urgent, normal, low
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;

// Documents table
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fileName: text("file_name").notNull(),
  fileSize: text("file_size").notNull(), // Store as text for large files
  mimeType: varchar("mime_type").notNull(),
  storagePath: text("storage_path").notNull(), // Path in object storage
  category: text("category").notNull(), // Bylaws, Financial, Minutes, etc.
  tags: text("tags").array().default(sql`ARRAY[]::text[]`), // Additional tags for filtering
  description: text("description"),
  uploadedBy: varchar("uploaded_by").references(() => users.id, { onDelete: "set null" }),
  isPublic: boolean("is_public").default(false), // Role-based access
  version: text("version").default("1"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document categories (predefined list)
export const documentCategories = [
  "Bylaws",
  "Financial",
  "Minutes",
  "Insurance",
  "Contracts",
  "Rules",
  "Forms",
  "Notices",
  "Other",
] as const;

export type DocumentCategory = typeof documentCategories[number];

// Zod schemas for documents
export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  category: z.enum(documentCategories),
  tags: z.array(z.string()).optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export const updateDocumentSchema = insertDocumentSchema.partial().omit({
  fileSize: true,
  mimeType: true,
  storagePath: true,
  uploadedBy: true,
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type UpdateDocument = z.infer<typeof updateDocumentSchema>;

// Events table
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  startDateTime: timestamp("start_date_time").notNull(),
  endDateTime: timestamp("end_date_time"),
  location: text("location").notNull(),
  maxCapacity: text("max_capacity"), // Optional capacity limit (stored as text for flexibility)
  createdBy: varchar("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event RSVPs junction table
export const eventRsvps = pgTable("event_rsvps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status").notNull().default("attending"), // attending, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod schemas for events
export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  title: z.string().min(1, "Event title is required"),
  description: z.string().optional(),
  startDateTime: z.coerce.date(),
  endDateTime: z.coerce.date().optional(),
  location: z.string().min(1, "Location is required"),
  maxCapacity: z.string().optional(),
});

export const updateEventSchema = insertEventSchema.partial().omit({
  createdBy: true,
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type UpdateEvent = z.infer<typeof updateEventSchema>;

// Zod schemas for event RSVPs
export const insertEventRsvpSchema = createInsertSchema(eventRsvps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  status: z.enum(["attending", "cancelled"]).default("attending"),
});

export type EventRsvp = typeof eventRsvps.$inferSelect;
export type InsertEventRsvp = z.infer<typeof insertEventRsvpSchema>;

// Requests table (architectural, contract changes, bylaw updates, general)
// Tracked by household to support 1-vote-per-household principle
// householdId is nullable for backward compatibility with legacy data (use backfill script to migrate)
export const architecturalRequests = pgTable("architectural_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestType: varchar("request_type").notNull().default("architectural"), // architectural, contract_change, bylaw_update, general
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: varchar("status").notNull().default("pending"), // pending, approved, denied
  householdId: varchar("household_id").references(() => households.id, { onDelete: "cascade" }), // Nullable for legacy data; run backfill script to populate
  submittedBy: varchar("submitted_by").notNull().references(() => users.id, { onDelete: "cascade" }), // Which household member submitted
  reviewedBy: varchar("reviewed_by").references(() => users.id, { onDelete: "set null" }),
  reviewNotes: text("review_notes"),
  attachmentUrls: text("attachment_urls").array(), // Array of object storage URLs
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});

// Zod schemas for requests
export const insertArchitecturalRequestSchema = createInsertSchema(architecturalRequests).omit({
  id: true,
  status: true, // Server-controlled
  householdId: true, // Server-controlled (derived from submittedBy user's household)
  submittedBy: true, // Server-controlled (derived from authenticated user)
  reviewedBy: true, // Server-controlled
  reviewNotes: true, // Server-controlled
  reviewedAt: true, // Server-controlled
  createdAt: true,
  updatedAt: true,
}).extend({
  requestType: z.enum(["architectural", "contract_change", "bylaw_update", "general"]).default("architectural"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  attachmentUrls: z.array(z.string()).optional(),
});

export const updateArchitecturalRequestSchema = z.object({
  status: z.enum(["pending", "approved", "denied"]),
  reviewNotes: z.string().optional(),
});

export const editArchitecturalRequestSchema = z.object({
  requestType: z.enum(["architectural", "contract_change", "bylaw_update", "general"]).optional(),
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().min(10, "Description must be at least 10 characters").optional(),
});

export type ArchitecturalRequest = typeof architecturalRequests.$inferSelect;
export type InsertArchitecturalRequest = z.infer<typeof insertArchitecturalRequestSchema>;
export type UpdateArchitecturalRequest = z.infer<typeof updateArchitecturalRequestSchema>;

// Request Comments - Discussion thread for architectural requests
export const requestComments = pgTable("request_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestId: varchar("request_id").notNull().references(() => architecturalRequests.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod schemas for request comments
export const insertRequestCommentSchema = createInsertSchema(requestComments).omit({
  id: true,
  userId: true, // Server-controlled (from authenticated user)
  createdAt: true,
  updatedAt: true,
}).extend({
  requestId: z.string().uuid(),
  comment: z.string().min(1, "Comment cannot be empty").max(2000, "Comment is too long"),
});

export type RequestComment = typeof requestComments.$inferSelect;
export type InsertRequestComment = z.infer<typeof insertRequestCommentSchema>;

// Request Votes - Household voting on architectural requests (one vote per household)
// 3 out of 5 votes required to approve/deny a request
export const requestVotes = pgTable("request_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestId: varchar("request_id").notNull().references(() => architecturalRequests.id, { onDelete: "cascade" }),
  householdId: varchar("household_id").notNull().references(() => households.id, { onDelete: "cascade" }),
  voterId: varchar("voter_id").notNull().references(() => users.id, { onDelete: "cascade" }), // Who cast the vote on behalf of household
  vote: text("vote").notNull(), // "approve" or "deny"
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  // Ensure one vote per household per request
  uniqueIndex("request_votes_household_request_idx").on(table.requestId, table.householdId),
]);

export const insertRequestVoteSchema = createInsertSchema(requestVotes).omit({
  id: true,
  createdAt: true,
}).extend({
  requestId: z.string().uuid(),
  vote: z.enum(["approve", "deny"]),
});

export type RequestVote = typeof requestVotes.$inferSelect;
export type InsertRequestVote = z.infer<typeof insertRequestVoteSchema>;

// Dues Payments - Track monthly/annual dues for each member
export const duesPayments = pgTable("dues_payments", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Payment details
  paymentType: text("payment_type").notNull(), // "monthly" or "annual"
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  
  // Period covered by this payment
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  
  // Payment status
  status: text("status").notNull().default("pending"), // "pending", "paid", "overdue"
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  
  // Payment transaction reference
  helcimTransactionId: text("helcim_transaction_id"),
  
  // Autopay tracking (nullable - only populated for autopay attempts)
  autopayAttemptedAt: timestamp("autopay_attempted_at"),
  autopayStatus: text("autopay_status"), // "pending", "success", "failed" - validated in Zod
  autopayFailureReason: text("autopay_failure_reason"), // Details when autopay fails
  
  // Metadata
  notes: text("notes"),
  imageUrl: text("image_url"), // Optional image attachment (for fines/violations)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  // Partial index for querying autopay failures in overdue dues
  statusAutopayIdx: index("idx_status_autopay").on(table.status, table.autopayStatus),
}));

export const insertDuesPaymentSchema = createInsertSchema(duesPayments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  amount: z.string().or(z.number()),
  autopayStatus: z.enum(["pending", "success", "failed"]).optional(),
  imageUrl: z.string().optional().nullable(),
  // Accept ISO strings or Date objects for date fields
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  dueDate: z.coerce.date(),
  paidDate: z.coerce.date().optional().nullable(),
});
export type InsertDuesPayment = z.infer<typeof insertDuesPaymentSchema>;
export type DuesPayment = typeof duesPayments.$inferSelect;

// Payments table - Track individual Helcim transactions independently
// This allows tracking payments that may not yet be applied to specific dues (prepayments)
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  // User who made the payment
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  householdId: varchar("household_id").references(() => households.id, { onDelete: "set null" }),
  
  // Payment amount and method
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(), // "card" or "ach"
  
  // Helcim transaction details
  helcimTransactionId: text("helcim_transaction_id").notNull().unique(),
  
  // Payment method display info
  last4: varchar("last4", { length: 4 }), // Last 4 digits of card/account
  cardType: varchar("card_type", { length: 20 }), // Visa, MC, etc. (null for ACH)
  bankName: varchar("bank_name", { length: 100 }), // Bank name (null for card)
  
  // Settlement status - tracks Helcim confirmation
  status: text("status").notNull().default("pending"), // "pending", "settled", "failed", "refunded"
  settledAt: timestamp("settled_at"), // When Helcim confirmed settlement
  failureReason: text("failure_reason"), // If payment failed
  
  // How much has been applied to dues
  appliedAmount: decimal("applied_amount", { precision: 10, scale: 2 }).default("0"),
  unappliedAmount: decimal("unapplied_amount", { precision: 10, scale: 2 }), // Credit balance
  
  // Source of payment
  source: text("source").notNull().default("online"), // "online", "autopay", "admin"
  
  // Metadata
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("idx_payments_user").on(table.userId),
  statusIdx: index("idx_payments_status").on(table.status),
  transactionIdx: index("idx_payments_transaction").on(table.helcimTransactionId),
}));

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  amount: z.string().or(z.number()),
  appliedAmount: z.string().or(z.number()).optional(),
  unappliedAmount: z.string().or(z.number()).optional(),
});
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

// Payment Applications - Links payments to specific dues periods
// Allows one payment to be split across multiple dues, or multiple payments to one dues
export const paymentApplications = pgTable("payment_applications", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  // Link to payment and dues
  paymentId: varchar("payment_id").notNull().references(() => payments.id, { onDelete: "cascade" }),
  duesPaymentId: varchar("dues_payment_id").notNull().references(() => duesPayments.id, { onDelete: "cascade" }),
  
  // Amount from this payment applied to this dues
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  
  appliedAt: timestamp("applied_at").defaultNow(),
}, (table) => ({
  paymentIdx: index("idx_payment_applications_payment").on(table.paymentId),
  duesIdx: index("idx_payment_applications_dues").on(table.duesPaymentId),
}));

export const insertPaymentApplicationSchema = createInsertSchema(paymentApplications).omit({
  id: true,
  appliedAt: true,
}).extend({
  amount: z.string().or(z.number()),
});
export type InsertPaymentApplication = z.infer<typeof insertPaymentApplicationSchema>;
export type PaymentApplication = typeof paymentApplications.$inferSelect;

// Bylaws table - stores HOA bylaws with versioning
export const bylaws = pgTable("bylaws", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(), // Full bylaws text content
  version: text("version").notNull().default("1.0"), // Version number (e.g., "1.0", "2.0")
  isCurrent: boolean("is_current").notNull().default(true), // Only one version should be current
  updatedBy: varchar("updated_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  notes: text("notes"), // Optional notes about this version
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBylawsSchema = createInsertSchema(bylaws).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertBylaws = z.infer<typeof insertBylawsSchema>;
export type Bylaws = typeof bylaws.$inferSelect;

// Helper function to format position for display
export function formatPosition(position: UserPosition): string {
  if (!position) return "";
  const positions: Record<string, string> = {
    president: "President",
    vice_president: "Vice President",
    secretary: "Secretary",
    treasurer: "Treasurer",
    member: "Board Member",
  };
  return positions[position] || "";
}

// Chart of Accounts - Categories for all financial transactions
export const accountCategories = pgTable("account_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'asset', 'liability', 'equity', 'revenue', 'expense'
  parentId: uuid("parent_id"),
  code: text("code"), // Account code like "1000", "2000", etc.
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAccountCategorySchema = createInsertSchema(accountCategories).omit({
  id: true,
  createdAt: true,
});
export type InsertAccountCategory = z.infer<typeof insertAccountCategorySchema>;
export type AccountCategory = typeof accountCategories.$inferSelect;

// Financial Transactions - All money movement
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: timestamp("date").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(), // 'income' or 'expense'
  categoryId: uuid("category_id").references(() => accountCategories.id),
  
  // Mercury integration
  mercuryTransactionId: text("mercury_transaction_id"),
  mercuryStatus: text("mercury_status"), // 'pending', 'posted', 'cleared'
  
  // Helcim integration (for payment receipts)
  helcimTransactionId: text("helcim_transaction_id"),
  
  // Reconciliation
  isReconciled: boolean("is_reconciled").default(false),
  reconciledAt: timestamp("reconciled_at"),
  reconciledBy: text("reconciled_by"),
  
  // Additional metadata
  checkNumber: text("check_number"),
  notes: text("notes"),
  attachmentUrl: text("attachment_url"), // Receipt/invoice
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Budget tracking
export const budgets = pgTable("budgets", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id").references(() => accountCategories.id),
  year: integer("year").notNull(),
  month: integer("month"), // null for annual budgets
  budgetedAmount: decimal("budgeted_amount", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBudgetSchema = createInsertSchema(budgets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type Budget = typeof budgets.$inferSelect;

// Reconciliation history
export const reconciliations = pgTable("reconciliations", {
  id: uuid("id").primaryKey().defaultRandom(),
  reconciliationDate: timestamp("reconciliation_date").notNull(),
  startingBalance: decimal("starting_balance", { precision: 10, scale: 2 }).notNull(),
  endingBalance: decimal("ending_balance", { precision: 10, scale: 2 }).notNull(),
  clearedBalance: decimal("cleared_balance", { precision: 10, scale: 2 }).notNull(),
  differenceAmount: decimal("difference_amount", { precision: 10, scale: 2 }),
  isBalanced: boolean("is_balanced").default(false),
  reconciledBy: text("reconciled_by").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReconciliationSchema = createInsertSchema(reconciliations).omit({
  id: true,
  createdAt: true,
});
export type InsertReconciliation = z.infer<typeof insertReconciliationSchema>;
export type Reconciliation = typeof reconciliations.$inferSelect;

// Transaction Codings - Maps Mercury transaction IDs to Chart of Accounts categories
// This is a lightweight table for Option 2: store coding only, fetch transactions live from Mercury
// Status: 'coded' = normal coded transaction, 'failed' = failed/declined transaction, 'void' = voided transaction
export const transactionCodings = pgTable("transaction_codings", {
  id: uuid("id").primaryKey().defaultRandom(),
  mercuryTransactionId: text("mercury_transaction_id").notNull().unique(),
  categoryId: uuid("category_id").references(() => accountCategories.id),
  status: text("status").default("coded"), // 'coded', 'failed', 'void' - failed/void excluded from reports
  notes: text("notes"),
  codedBy: varchar("coded_by").references(() => users.id),
  codedAt: timestamp("coded_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTransactionCodingSchema = createInsertSchema(transactionCodings).omit({
  id: true,
  codedAt: true,
  updatedAt: true,
});
export type InsertTransactionCoding = z.infer<typeof insertTransactionCodingSchema>;
export type TransactionCoding = typeof transactionCodings.$inferSelect;

// =============================================================================
// VOTING SYSTEM - One Vote Per Household
// =============================================================================

// Ballot types for different voting scenarios
export type BallotType = "yes_no" | "multiple_choice" | "election";
export type BallotStatus = "draft" | "active" | "closed" | "cancelled";

// Ballots - voting topics/proposals created by admin/board
export const ballots = pgTable("ballots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  ballotType: text("ballot_type").notNull().default("yes_no"), // yes_no, multiple_choice, election
  status: text("status").notNull().default("draft"), // draft, active, closed, cancelled
  createdBy: varchar("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at").notNull(),
  showResultsBeforeClose: boolean("show_results_before_close").default(false), // Show live results?
  requiresQuorum: boolean("requires_quorum").default(true), // Require minimum participation?
  quorumPercentage: integer("quorum_percentage").default(50), // Percentage of households required
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBallotSchema = createInsertSchema(ballots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertBallot = z.infer<typeof insertBallotSchema>;
export type Ballot = typeof ballots.$inferSelect;

// Ballot options - choices for each ballot
export const ballotOptions = pgTable("ballot_options", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ballotId: varchar("ballot_id").notNull().references(() => ballots.id, { onDelete: "cascade" }),
  optionText: text("option_text").notNull(), // e.g., "Yes", "No", "Candidate Name"
  optionDescription: text("option_description"), // Optional description for the option
  displayOrder: integer("display_order").notNull().default(0), // For ordering options
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBallotOptionSchema = createInsertSchema(ballotOptions).omit({
  id: true,
  createdAt: true,
});
export type InsertBallotOption = z.infer<typeof insertBallotOptionSchema>;
export type BallotOption = typeof ballotOptions.$inferSelect;

// Household votes - one vote per household per ballot (enforced by unique constraint)
export const householdVotes = pgTable("household_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ballotId: varchar("ballot_id").notNull().references(() => ballots.id, { onDelete: "cascade" }),
  householdId: varchar("household_id").notNull().references(() => households.id, { onDelete: "cascade" }),
  optionId: varchar("option_id").notNull().references(() => ballotOptions.id, { onDelete: "cascade" }),
  votedBy: varchar("voted_by").notNull().references(() => users.id, { onDelete: "cascade" }), // Audit: which user cast the vote
  votedAt: timestamp("voted_at").defaultNow(),
}, (table) => [
  // CRITICAL: Enforce one vote per household per ballot at the database level
  uniqueIndex("household_votes_ballot_household_idx").on(table.ballotId, table.householdId),
]);

export const insertHouseholdVoteSchema = createInsertSchema(householdVotes).omit({
  id: true,
  votedAt: true,
});
export type InsertHouseholdVote = z.infer<typeof insertHouseholdVoteSchema>;
export type HouseholdVote = typeof householdVotes.$inferSelect;

// System settings table for HOA configuration
export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key").notNull().unique(), // "monthly_dues_amount", etc.
  value: text("value").notNull(), // JSON-serialized value
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true,
});
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;

// Standard HOA chart of accounts
export const standardAccountCategories = [
  // Assets (1000-1999)
  { code: "1000", name: "Cash - Operating Account", type: "asset" },
  { code: "1100", name: "Cash - Reserve Account", type: "asset" },
  { code: "1200", name: "Accounts Receivable - Dues", type: "asset" },
  { code: "1300", name: "Prepaid Insurance", type: "asset" },
  { code: "1400", name: "Equipment", type: "asset" },
  
  // Liabilities (2000-2999)
  { code: "2000", name: "Accounts Payable", type: "liability" },
  { code: "2100", name: "Deferred Revenue", type: "liability" },
  { code: "2200", name: "Loans Payable", type: "liability" },
  
  // Equity (3000-3999)
  { code: "3000", name: "Retained Earnings", type: "equity" },
  { code: "3100", name: "Current Year Surplus/Deficit", type: "equity" },
  
  // Revenue (4000-4999)
  { code: "4000", name: "Monthly Dues", type: "revenue" },
  { code: "4100", name: "Special Assessments", type: "revenue" },
  { code: "4200", name: "Late Fees", type: "revenue" },
  { code: "4300", name: "Interest Income", type: "revenue" },
  { code: "4400", name: "Other Income", type: "revenue" },
  
  // Expenses (5000-9999)
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
