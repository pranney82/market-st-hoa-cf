// CSRF protection via double-submit cookie pattern.
// On every page load, a signed token is set as a cookie AND embedded in forms.
// On POST, we verify the form token matches the cookie token.
// This works because an attacker on another domain can't read our cookies.

const COOKIE_NAME = "_csrf";
const FIELD_NAME = "_csrf";

async function sign(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return `${value}.${btoa(String.fromCharCode(...new Uint8Array(sig)))}`;
}

async function verify(signed: string, secret: string): Promise<boolean> {
  const dot = signed.lastIndexOf(".");
  if (dot === -1) return false;
  const value = signed.slice(0, dot);
  return (await sign(value, secret)) === signed;
}

export async function generateCsrfToken(secret: string): Promise<{ token: string; cookie: string }> {
  const raw = crypto.randomUUID();
  const signed = await sign(raw, secret);
  const cookie = `${COOKIE_NAME}=${signed}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`;
  return { token: signed, cookie };
}

export async function validateCsrf(request: Request, secret: string): Promise<boolean> {
  // Get token from form body
  const contentType = request.headers.get("Content-Type") || "";
  let formToken: string | null = null;

  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const clone = request.clone();
    const form = await clone.formData();
    formToken = form.get(FIELD_NAME) as string;
  } else if (contentType.includes("application/json")) {
    const clone = request.clone();
    const json = await clone.json();
    formToken = json[FIELD_NAME];
  }

  if (!formToken) return false;

  // Get token from cookie
  const cookies = request.headers.get("Cookie") || "";
  const match = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  const cookieToken = match?.[1];

  if (!cookieToken) return false;

  // Both must match AND be validly signed
  return formToken === cookieToken && await verify(formToken, secret);
}

export const CSRF_FIELD_NAME = FIELD_NAME;
