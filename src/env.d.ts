/// <reference types="astro/client" />

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

interface Env {
  DB: D1Database;
  R2: R2Bucket;
  SESSIONS: KVNamespace;
  EMAIL_QUEUE: Queue;
  PAYMENT_QUEUE: Queue;
  ASSETS: Fetcher;
  BASE_URL: string;
  CF_ACCESS_TEAM_DOMAIN: string;
  CF_ACCESS_AUD: string;
  HELCIM_API_TOKEN: string;
  MERCURY_API_TOKEN: string;
  RESEND_API_KEY: string;
  RESEND_FROM_EMAIL: string;
  RESEND_ADMIN_EMAIL: string;
  RESEND_BILLING_EMAIL: string;
  RESEND_NOTIFICATIONS_EMAIL: string;
  RESEND_REQUESTS_EMAIL: string;
  AI_INTEGRATIONS_ANTHROPIC_API_KEY: string;
  AI_INTEGRATIONS_ANTHROPIC_BASE_URL: string;
  VAPID_PUBLIC_KEY: string;
  VAPID_PRIVATE_KEY: string;
  WEBSHARE_PROXY_HOST: string;
  WEBSHARE_PROXY_PORT: string;
  WEBSHARE_PROXY_USER: string;
  WEBSHARE_PROXY_PASS: string;
}

declare namespace App {
  interface Locals extends Runtime {
    user: import("../shared/schema").User | null;
    nonce: string;
  }
}
