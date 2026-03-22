import type { APIRoute, APIContext } from "astro";

type Handler = (context: APIContext) => Promise<Response>;

// Wraps an API handler with try/catch + consistent error responses
export function apiHandler(handler: Handler): APIRoute {
  return async (context) => {
    try {
      return await handler(context);
    } catch (error) {
      console.error(`[API Error] ${context.url.pathname}:`, error);

      // D1 unique constraint violation
      if ((error as any)?.message?.includes("UNIQUE constraint failed")) {
        return Response.json({ message: "A record with that value already exists" }, { status: 409 });
      }

      return Response.json(
        { message: "An unexpected error occurred" },
        { status: 500 }
      );
    }
  };
}

// For form POST routes that redirect (not JSON APIs)
export function formHandler(handler: (context: APIContext) => Promise<Response>, fallbackRedirect: string): APIRoute {
  return async (context) => {
    try {
      return await handler(context);
    } catch (error) {
      console.error(`[Form Error] ${context.url.pathname}:`, error);
      return context.redirect(`${fallbackRedirect}?error=Something went wrong. Please try again.`);
    }
  };
}
