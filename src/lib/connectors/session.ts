import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import {
  getHostOAuthApp,
  getConnectorSecret,
  type OAuthAppCredentials,
} from "./config";
import type { ConnectorProvider, ConnectorSession } from "./types";

export const CONNECTOR_COOKIE = "orbit_connectors";
export const OAUTH_APPS_COOKIE = "orbit_oauth_apps";
export const OAUTH_STATE_COOKIE = "orbit_oauth_state";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const OAUTH_APPS_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

export type OAuthAppsStash = Partial<
  Record<ConnectorProvider, OAuthAppCredentials>
>;

export interface ResolvedOAuthApp extends OAuthAppCredentials {
  source: "env" | "cookie";
}

function deriveKey(secret: string): Buffer {
  return createHash("sha256").update(secret).digest();
}

function encryptJson(value: unknown): string {
  const key = deriveKey(getConnectorSecret());
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const plaintext = Buffer.from(JSON.stringify(value), "utf8");
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

function decryptJson<T>(payload: string): T | null {
  try {
    const buf = Buffer.from(payload, "base64url");
    if (buf.length < 28) return null;
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const encrypted = buf.subarray(28);
    const key = deriveKey(getConnectorSecret());
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return JSON.parse(decrypted.toString("utf8")) as T;
  } catch {
    return null;
  }
}

export function encryptSession(session: ConnectorSession): string {
  return encryptJson(session);
}

export function decryptSession(payload: string): ConnectorSession | null {
  return decryptJson<ConnectorSession>(payload);
}

export function readConnectorSession(): ConnectorSession {
  const jar = cookies();
  const raw = jar.get(CONNECTOR_COOKIE)?.value;
  if (!raw) return {};
  return decryptSession(raw) || {};
}

export function writeConnectorSession(session: ConnectorSession): void {
  const jar = cookies();
  const value = encryptSession(session);
  jar.set(CONNECTOR_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export function clearConnectorSession(): void {
  const jar = cookies();
  jar.set(CONNECTOR_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function updateConnectorSession(patch: Partial<ConnectorSession>): ConnectorSession {
  const current = readConnectorSession();
  const next: ConnectorSession = { ...current, ...patch };
  for (const key of Object.keys(patch) as Array<keyof ConnectorSession>) {
    if (patch[key] === undefined) {
      delete next[key];
    }
  }
  writeConnectorSession(next);
  return next;
}

/** Encrypted OAuth app client ID/secret stash (Advanced fallback when host env is empty). */
export function readOAuthApps(): OAuthAppsStash {
  const jar = cookies();
  const raw = jar.get(OAUTH_APPS_COOKIE)?.value;
  if (!raw) return {};
  return decryptJson<OAuthAppsStash>(raw) || {};
}

export function writeOAuthApps(stash: OAuthAppsStash): void {
  const jar = cookies();
  jar.set(OAUTH_APPS_COOKIE, encryptJson(stash), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: OAUTH_APPS_MAX_AGE,
  });
}

export function upsertOAuthApp(
  provider: ConnectorProvider,
  creds: OAuthAppCredentials
): OAuthAppsStash {
  const next: OAuthAppsStash = {
    ...readOAuthApps(),
    [provider]: {
      clientId: creds.clientId.trim(),
      clientSecret: creds.clientSecret.trim(),
    },
  };
  writeOAuthApps(next);
  return next;
}

/** Serialize stash for setting on a NextResponse (start/callback redirects). */
export function encryptOAuthApps(stash: OAuthAppsStash): string {
  return encryptJson(stash);
}

/**
 * Resolve OAuth app credentials: host env first, else encrypted orbit_oauth_apps cookie.
 */
export function resolveOAuthApp(provider: ConnectorProvider): ResolvedOAuthApp | null {
  const host = getHostOAuthApp(provider);
  if (host) {
    return { ...host, source: "env" };
  }
  const fromCookie = readOAuthApps()[provider];
  const clientId = fromCookie?.clientId?.trim();
  const clientSecret = fromCookie?.clientSecret?.trim();
  if (clientId && clientSecret) {
    return { clientId, clientSecret, source: "cookie" };
  }
  return null;
}

export function isGoogleConfigured(): boolean {
  return Boolean(resolveOAuthApp("google"));
}

export function isNotionConfigured(): boolean {
  return Boolean(resolveOAuthApp("notion"));
}

export function isSlackConfigured(): boolean {
  return Boolean(resolveOAuthApp("slack"));
}

export function isProviderConfigured(provider: ConnectorProvider): boolean {
  return Boolean(resolveOAuthApp(provider));
}

/** Short-lived OAuth CSRF state (separate cookie). */
export function setOAuthState(state: string, provider: string): void {
  const jar = cookies();
  jar.set(OAUTH_STATE_COOKIE, `${provider}:${state}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
}

export function consumeOAuthState(expectedProvider: string, state: string): boolean {
  const jar = cookies();
  const raw = jar.get(OAUTH_STATE_COOKIE)?.value;
  jar.set(OAUTH_STATE_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  if (!raw) return false;
  const [provider, value] = raw.split(":");
  return provider === expectedProvider && value === state && Boolean(state);
}
