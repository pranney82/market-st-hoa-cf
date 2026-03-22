import { pgTable, varchar, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Documents table
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(), // Size in bytes
  mimeType: varchar("mime_type").notNull(),
  storagePath: text("storage_path").notNull(), // Path in object storage
  category: text("category").notNull(), // Bylaws, Financial, Minutes, etc.
  tags: text("tags").array().default(sql`ARRAY[]::text[]`), // Additional tags for filtering
  description: text("description"),
  uploadedBy: varchar("uploaded_by").notNull(), // User ID
  isPublic: boolean("is_public").default(false), // Role-based access
  version: integer("version").default(1),
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

// Zod schemas
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
  fileName: true,
  fileSize: true,
  mimeType: true,
  storagePath: true,
  uploadedBy: true,
});

// TypeScript types
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type UpdateDocument = z.infer<typeof updateDocumentSchema>;
