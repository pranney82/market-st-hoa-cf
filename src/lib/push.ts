// Push notification sender using Web Push protocol
// Requires VAPID keys configured in environment

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

export async function sendPushNotification(
  env: Env,
  userId: string,
  payload: PushPayload
): Promise<boolean> {
  try {
    const raw = await env.SESSIONS.get(`push:${userId}`);
    if (!raw) return false;

    const subscription = JSON.parse(raw);
    const { endpoint, keys } = subscription;

    if (!endpoint || !keys?.p256dh || !keys?.auth) return false;

    // Build JWT for VAPID authentication
    const vapidPublicKey = env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = env.VAPID_PRIVATE_KEY;

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.warn("[Push] VAPID keys not configured");
      return false;
    }

    const audience = new URL(endpoint).origin;
    const jwt = await createVapidJwt(audience, env.RESEND_FROM_EMAIL || "noreply@marketstreethoa.com", vapidPrivateKey);

    // Encrypt payload
    const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));
    const encrypted = await encryptPayload(payloadBytes, keys.p256dh, keys.auth);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Encoding": "aes128gcm",
        Authorization: `vapid t=${jwt}, k=${vapidPublicKey}`,
        TTL: "86400",
        Urgency: "normal",
      },
      body: encrypted,
    });

    if (res.status === 410 || res.status === 404) {
      // Subscription expired - clean up
      await env.SESSIONS.delete(`push:${userId}`);
      return false;
    }

    return res.ok;
  } catch (err) {
    console.error("[Push] Failed to send:", err);
    return false;
  }
}

export async function sendPushToAllUsers(
  env: Env,
  userIds: string[],
  payload: PushPayload
): Promise<number> {
  let sent = 0;
  for (const userId of userIds) {
    const ok = await sendPushNotification(env, userId, payload);
    if (ok) sent++;
  }
  return sent;
}

// VAPID JWT creation using Web Crypto (Workers-compatible)
async function createVapidJwt(audience: string, subject: string, privateKeyBase64: string): Promise<string> {
  const header = { typ: "JWT", alg: "ES256" };
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
    sub: `mailto:${subject}`,
  };

  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const unsigned = `${headerB64}.${payloadB64}`;

  // Import private key
  const keyData = base64UrlToArrayBuffer(privateKeyBase64);
  const key = await crypto.subtle.importKey(
    "pkcs8", keyData, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]
  );

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" }, key, new TextEncoder().encode(unsigned)
  );

  const sigB64 = arrayBufferToBase64Url(signature);
  return `${unsigned}.${sigB64}`;
}

// Encrypt push payload using aes128gcm (RFC 8291)
async function encryptPayload(payload: Uint8Array, p256dhKey: string, authSecret: string): Promise<ArrayBuffer> {
  // Generate ephemeral ECDH key pair
  const localKey = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);

  // Import subscriber's public key
  const subscriberKey = await crypto.subtle.importKey(
    "raw", base64UrlToArrayBuffer(p256dhKey),
    { name: "ECDH", namedCurve: "P-256" }, false, []
  );

  // Derive shared secret
  const sharedSecret = await crypto.subtle.deriveBits(
    { name: "ECDH", public: subscriberKey },
    localKey.privateKey, 256
  );

  const auth = base64UrlToArrayBuffer(authSecret);
  const localPublicKey = await crypto.subtle.exportKey("raw", localKey.publicKey);

  // Derive content encryption key using HKDF
  const ikm = await hkdf(new Uint8Array(sharedSecret), new Uint8Array(auth),
    buildInfo("WebPush: info\0", new Uint8Array(base64UrlToArrayBuffer(p256dhKey)), new Uint8Array(localPublicKey)), 32);

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const prk = await hkdf(ikm, salt, new TextEncoder().encode("Content-Encoding: aes128gcm\0\x01"), 16);
  const nonce = await hkdf(ikm, salt, new TextEncoder().encode("Content-Encoding: nonce\0\x01"), 12);

  // Encrypt with AES-128-GCM
  const key = await crypto.subtle.importKey("raw", prk, "AES-GCM", false, ["encrypt"]);
  const padded = new Uint8Array(payload.length + 2);
  padded.set(payload);
  padded[payload.length] = 2; // Delimiter

  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, key, padded);

  // Build aes128gcm header
  const recordSize = new ArrayBuffer(4);
  new DataView(recordSize).setUint32(0, padded.length + 16);

  const header = new Uint8Array(86 + new Uint8Array(ciphertext).length);
  header.set(salt, 0);
  header.set(new Uint8Array(recordSize), 16);
  header[20] = 65; // Key length
  header.set(new Uint8Array(localPublicKey), 21);
  header.set(new Uint8Array(ciphertext), 86);

  return header.buffer;
}

async function hkdf(ikm: Uint8Array, salt: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", salt.length ? salt : new Uint8Array(32), "HKDF", false, ["deriveBits"]);
  const prk = await crypto.subtle.importKey("raw",
    new Uint8Array(await crypto.subtle.sign("HMAC",
      await crypto.subtle.importKey("raw", salt.length ? salt : new Uint8Array(32), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]),
      ikm)),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);

  const signed = await crypto.subtle.sign("HMAC", prk, new Uint8Array([...info, 1]));
  return new Uint8Array(signed).slice(0, length);
}

function buildInfo(type: string, clientPublicKey: Uint8Array, serverPublicKey: Uint8Array): Uint8Array {
  const encoder = new TextEncoder();
  const typeBytes = encoder.encode(type);
  const result = new Uint8Array(typeBytes.length + clientPublicKey.length + 2 + serverPublicKey.length + 2);
  let offset = 0;
  result.set(typeBytes, offset); offset += typeBytes.length;
  result[offset++] = 0; result[offset++] = clientPublicKey.length;
  result.set(clientPublicKey, offset); offset += clientPublicKey.length;
  result[offset++] = 0; result[offset++] = serverPublicKey.length;
  result.set(serverPublicKey, offset);
  return result;
}

function base64UrlToArrayBuffer(base64: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob(base64.replace(/-/g, "+").replace(/_/g, "/") + padding);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0))).buffer;
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
