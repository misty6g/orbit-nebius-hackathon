import {
  isGoogleConfigured,
  isNotionConfigured,
} from "./config";
import {
  getValidGoogleTokens,
  listRecentDrive,
  listRecentGmail,
  listUpcomingEvents,
} from "./google";
import { searchNotion } from "./notion";
import { ConnectorSession, ConnectorSnapshot } from "./types";

/** Build a bounded default snapshot from connected accounts (Slack is search-only). */
export async function assembleConnectorContext(
  session: ConnectorSession
): Promise<ConnectorSnapshot> {
  const snapshot: ConnectorSnapshot = {
    calendar: [],
    gmail: [],
    drive: [],
    notion: [],
    notes: [],
  };

  const googleTokens = await getValidGoogleTokens(session);
  if (googleTokens && isGoogleConfigured()) {
    const [calendar, gmail, drive] = await Promise.all([
      listUpcomingEvents(googleTokens, 12).catch(() => []),
      listRecentGmail(googleTokens, 8).catch(() => []),
      listRecentDrive(googleTokens, 8).catch(() => []),
    ]);
    snapshot.calendar = calendar;
    snapshot.gmail = gmail;
    snapshot.drive = drive;
  } else if (session.google) {
    snapshot.notes.push("Google connected but credentials are not configured on the server.");
  } else if (!isGoogleConfigured()) {
    snapshot.notes.push("Google connector is not configured.");
  }

  if (session.notion?.accessToken && isNotionConfigured()) {
    snapshot.notion = await searchNotion(session.notion, "", 6).catch(() => []);
  } else if (session.notion && !isNotionConfigured()) {
    snapshot.notes.push("Notion connected but credentials are not configured on the server.");
  }

  if (!session.google && !session.notion && !session.slack) {
    snapshot.notes.push("No connectors connected. Using demo Shared Brain.");
  }

  return snapshot;
}
