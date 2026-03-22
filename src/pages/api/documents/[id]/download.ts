import { apiHandler } from "../../../../lib/api";
import { getDb } from "../../../../lib/db";
import { documents } from "../../../../../shared/schema";
import { eq } from "drizzle-orm";

export const GET = apiHandler(async ({ params, locals }) => {
  const user = locals.user!;
  const db = getDb(locals.runtime.env);
  const r2 = locals.runtime.env.R2;

  const [doc] = await db.select().from(documents).where(eq(documents.id, params.id!));
  if (!doc) return Response.json({ message: "Not found" }, { status: 404 });
  if (user.role !== "admin" && user.role !== "board" && !doc.isPublic) return Response.json({ message: "Forbidden" }, { status: 403 });

  const key = doc.storagePath.replace(/^\/objects\//, "");
  const object = await r2.get(key);
  if (!object) return Response.json({ message: "File not found in storage" }, { status: 404 });

  return new Response(object.body, {
    headers: { "Content-Type": doc.mimeType, "Content-Disposition": `attachment; filename="${doc.fileName}"` },
  });
});
