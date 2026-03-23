import { users } from "../../shared/schema";
import { eq } from "drizzle-orm";
import { jwtVerify, createRemoteJWKSet } from "jose";
import type { Db } from "./db";

// Cache JWKS for performance
let jwksCache: { jwks: ReturnType<typeof createRemoteJWKSet>; teamDomain: string } | null = null;

function getJWKS(teamDomain: string) {
  if (jwksCache && jwksCache.teamDomain === teamDomain) return jwksCache.jwks;
  const url = new URL(`https://${teamDomain}/cdn-cgi/access/certs`);
  const jwks = createRemoteJWKSet(url);
  jwksCache = { jwks, teamDomain };
  return jwks;
}

interface AccessIdentity {
  email: string;
}

export async function authenticateRequest(
  request: Request,
  env: Env
): Promise<AccessIdentity | null> {
  const token =
    request.headers.get("Cf-Access-Jwt-Assertion") ||
    getCookie(request, "CF_Authorization");

  if (!token) return null;

  try {
    const jwks = getJWKS(env.CF_ACCESS_TEAM_DOMAIN);
    const { payload } = await jwtVerify(token, jwks, {
      issuer: `https://${env.CF_ACCESS_TEAM_DOMAIN}`,
      audience: env.CF_ACCESS_AUD,
    });

    const email = payload.email as string | undefined;
    if (!email) return null;

    return { email };
  } catch {
    return null;
  }
}

export async function getUserByEmail(db: Db, email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return user ?? null;
}

function getCookie(request: Request, name: string): string | null {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(new RegExp(`${name}=([^;]+)`));
  return match?.[1] ?? null;
}
