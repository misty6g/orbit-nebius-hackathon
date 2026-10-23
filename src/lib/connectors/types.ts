export type ConnectorProvider = "google" | "notion" | "slack";

export type ConnectorSource =
  | "calendar"
  | "gmail"
  | "drive"
  | "notion"
  | "slack";

export interface GoogleTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  email?: string;
}

export interface NotionTokens {
  accessToken: string;
  workspaceId?: string;
  workspaceName?: string;
}

export interface SlackTokens {
  accessToken: string;
  teamId?: string;
  teamName?: string;
  userId?: string;
}

export interface ConnectorSession {
  google?: GoogleTokens;
  notion?: NotionTokens;
  slack?: SlackTokens;
}

export interface ConnectorProviderStatus {
  /** True when host env or Advanced cookie stash has client ID + secret. */
  configured: boolean;
  /** True when Vercel/host env has the OAuth app (judges only need Connect). */
  hostConfigured: boolean;
  connected: boolean;
  email?: string;
  workspaceName?: string;
  teamName?: string;
  redirectUri: string;
  credentialSource?: "env" | "cookie";
}

export interface ConnectorStatus {
  google: ConnectorProviderStatus;
  notion: ConnectorProviderStatus;
  slack: ConnectorProviderStatus;
}

export interface CalendarEventItem {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
  htmlLink?: string;
}

export interface GmailThreadItem {
  id: string;
  from: string;
  subject: string;
  date: string;
  snippet: string;
  permalink?: string;
}

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  webViewLink?: string;
}

export interface NotionPageItem {
  id: string;
  title: string;
  url?: string;
  lastEdited?: string;
  excerpt?: string;
}

export interface SlackMessageItem {
  id: string;
  channel?: string;
  user?: string;
  text: string;
  permalink?: string;
  timestamp?: string;
}

export interface ConnectorSnapshot {
  calendar: CalendarEventItem[];
  gmail: GmailThreadItem[];
  drive: DriveFileItem[];
  notion: NotionPageItem[];
  notes: string[];
}

export interface ConnectorCitation {
  title: string;
  url?: string;
  id?: string;
  source: ConnectorSource;
  snippet?: string;
}

export interface ConnectorSearchResult {
  sources: ConnectorSource[];
  query: string;
  citations: ConnectorCitation[];
  notes: string[];
  formatted: string;
}

export interface SearchIntent {
  shouldSearch: boolean;
  query: string;
  sources: ConnectorSource[];
  searchAllConnected: boolean;
}
