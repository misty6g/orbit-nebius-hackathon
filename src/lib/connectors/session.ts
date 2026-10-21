import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { getConnectorSecret } from "./config";
import { ConnectorSession } from "./types";

export const CONNECTOR_COOKIE = "orbit_connectors";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function deriveKey(secret: string): Buffer {
  return createHash("sha256").update(secret).digest();
}

export function encryptSession(session: ConnectorSession): string {
  const key = deriveKey(getConnectorSecret());
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const plaintext = Buffer.from(JSON.stringify(session), "utf8");
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

export function decryptSession(payload: string): ConnectorSession | null {
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
    return JSON.parse(decrypted.toString("utf8")) as ConnectorSession;
  } catch {
    return null;
  }
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

/** Short-lived OAuth CSRF state (separate cookie). */
export const OAUTH_STATE_COOKIE = "orbit_oauth_state";

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
