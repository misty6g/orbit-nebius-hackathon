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

export interface ConnectorStatus {
  google: {
    configured: boolean;
    connected: boolean;
    email?: string;
  };
  notion: {
    configured: boolean;
    connected: boolean;
    workspaceName?: string;
  };
  slack: {
    configured: boolean;
    connected: boolean;
    teamName?: string;
  };
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
