import { apiHandler } from "../../../lib/api";
import { getDb } from "../../../lib/db";
import { audit } from "../../../lib/audit";
import { rateLimit } from "../../../lib/rate-limit";
import { documents, documentCategories } from "../../../../shared/schema";
import { z } from "zod";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
  "image/webp",
  "text/plain",
  "text/csv",
]);

const uploadMetaSchema = z.object({
  category: z.enum(documentCategories),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(false),
});

export const POST = apiHandler(async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return Response.json({ message: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin" && user.role !== "board") {
    return Response.json({ message: "Forbidden" }, { status: 403 });
  }

  const env = locals.runtime.env;

  // Rate limit: 20 uploads per hour
  const rl = await rateLimit(env.SESSIONS, `doc-upload:${user.id}`, 20, 3600);
  if (!rl.allowed) return Response.json({ message: "Too many requests" }, { status: 429 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file || !(file instanceof File) || file.size === 0) {
    return Response.json({ message: "File is required" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return Response.json({ message: "File too large (max 25MB)" }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return Response.json({ message: `File type not allowed: ${file.type}` }, { status: 400 });
  }

  const parsed = uploadMetaSchema.safeParse({
    category: formData.get("category"),
    description: (formData.get("description") as string)?.trim() || undefined,
    isPublic: formData.get("isPublic") === "true",
  });

  if (!parsed.success) {
    return Response.json({ message: parsed.error.errors[0].message }, { status: 400 });
  }

  const { category, description, isPublic } = parsed.data;

  // Upload to R2
  const fileId = crypto.randomUUID();
  const ext = file.name.split(".").pop() || "";
  const storagePath = `documents/${fileId}${ext ? `.${ext}` : ""}`;

  const arrayBuffer = await file.arrayBuffer();
  await env.R2.put(storagePath, arrayBuffer, {
    httpMetadata: { contentType: file.type },
  });

  // Create DB record
  const db = getDb(env);
  const [doc] = await db.insert(documents).values({
    fileName: file.name,
    fileSize: String(file.size),
    mimeType: file.type,
    storagePath,
    category,
    description: description || null,
    isPublic,
    uploadedBy: user.id,
  }).returning();

  await audit(env, request, user, {
    action: "document.upload",
    resourceType: "document",
    resourceId: doc.id,
    details: { fileName: file.name, category, fileSize: file.size },
  });

  return Response.json({ id: doc.id, fileName: doc.fileName }, { status: 201 });
});
