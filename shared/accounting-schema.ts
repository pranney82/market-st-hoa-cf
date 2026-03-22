import { pgTable, text, integer, decimal, timestamp, boolean, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
