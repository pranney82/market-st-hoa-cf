import { formHandler } from "../../lib/api";
import { destroySession } from "../../lib/auth";

export const POST = formHandler(async ({ request, locals }) => {
  const cookie = await destroySession(request, locals.runtime.env);
  return new Response(null, { status: 302, headers: { Location: "/login", "Set-Cookie": cookie } });
}, "/login");
