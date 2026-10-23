import { isGoogleConfigured, isNotionConfigured, isSlackConfigured } from "./session";
import {
  getValidGoogleTokens,
  searchCalendarEvents,
  searchDrive,
  searchGmail,
} from "./google";
import { fetchNotionPageExcerpt, searchNotion } from "./notion";
import { searchSlack } from "./slack";
import {
  ConnectorCitation,
  ConnectorSearchResult,
  ConnectorSession,
  ConnectorSource,
} from "./types";
import { formatSearchResultsForPrompt } from "./format";

const PER_SOURCE_LIMIT = 6;

export async function searchConnectors(options: {
  session: ConnectorSession;
  query: string;
  sources: ConnectorSource[];
  fetchNotionExcerpt?: boolean;
}): Promise<ConnectorSearchResult> {
  const { session, query, sources } = options;
  const citations: ConnectorCitation[] = [];
  const notes: string[] = [];
  const searched: ConnectorSource[] = [];

  const tasks: Array<Promise<void>> = [];

  if (sources.includes("calendar") || sources.includes("gmail") || sources.includes("drive")) {
    const google = await getValidGoogleTokens(session);
    if (!google) {
      if (sources.some((s) => s === "calendar" || s === "gmail" || s === "drive")) {
        notes.push("Google is not connected; skipped Calendar/Gmail/Drive search.");
      }
    } else if (!isGoogleConfigured()) {
      notes.push("Google OAuth is not configured on the server.");
    } else {
      if (sources.includes("calendar")) {
        searched.push("calendar");
        tasks.push(
          searchCalendarEvents(google, query, PER_SOURCE_LIMIT)
            .then((items) => {
              for (const evt of items) {
                citations.push({
                  title: evt.title,
                  url: evt.htmlLink,
                  id: evt.id,
                  source: "calendar",
                  snippet: `${evt.start} to ${evt.end}`,
                });
              }
            })
            .catch(() => {
              notes.push("Calendar search failed.");
            })
        );
      }
      if (sources.includes("gmail")) {
        searched.push("gmail");
        tasks.push(
          searchGmail(google, query, PER_SOURCE_LIMIT)
            .then((items) => {
              for (const mail of items) {
                citations.push({
                  title: mail.subject,
                  url: mail.permalink,
                  id: mail.id,
                  source: "gmail",
                  snippet: `${mail.from}: ${mail.snippet}`,
                });
              }
            })
            .catch(() => {
              notes.push("Gmail search failed.");
            })
        );
      }
      if (sources.includes("drive")) {
        searched.push("drive");
        tasks.push(
          searchDrive(google, query, PER_SOURCE_LIMIT)
            .then((items) => {
              for (const file of items) {
                citations.push({
                  title: file.name,
                  url: file.webViewLink,
                  id: file.id,
                  source: "drive",
                  snippet: file.mimeType,
                });
              }
            })
            .catch(() => {
              notes.push("Drive search failed.");
            })
        );
      }
    }
  }

  if (sources.includes("notion")) {
    if (!session.notion?.accessToken) {
      notes.push("Notion is not connected; skipped Notion search.");
    } else if (!isNotionConfigured()) {
      notes.push("Notion OAuth is not configured on the server.");
    } else {
      searched.push("notion");
      tasks.push(
        (async () => {
          const pages = await searchNotion(session.notion!, query, PER_SOURCE_LIMIT);
          let firstExcerpt = false;
          for (const page of pages) {
            let excerpt = page.excerpt;
            if (
              options.fetchNotionExcerpt !== false &&
              !firstExcerpt &&
              pages.length > 0
            ) {
              excerpt = await fetchNotionPageExcerpt(session.notion!, page.id, 600);
              firstExcerpt = true;
            }
            citations.push({
              title: page.title,
              url: page.url,
              id: page.id,
              source: "notion",
              snippet: excerpt || page.lastEdited,
            });
          }
        })().catch(() => {
          notes.push("Notion search failed.");
        })
      );
    }
  }

  if (sources.includes("slack")) {
    if (!session.slack?.accessToken) {
      notes.push("Slack is not connected; skipped Slack search.");
    } else if (!isSlackConfigured()) {
      notes.push("Slack OAuth is not configured on the server.");
    } else {
      searched.push("slack");
      tasks.push(
        searchSlack(session.slack, query, PER_SOURCE_LIMIT)
          .then((items) => {
            for (const msg of items) {
              citations.push({
                title: msg.channel ? `#${msg.channel}` : "Slack message",
                url: msg.permalink,
                id: msg.id,
                source: "slack",
                snippet: msg.text,
              });
            }
          })
          .catch(() => {
            notes.push("Slack search failed.");
          })
      );
    }
  }

  await Promise.all(tasks);

  const result: ConnectorSearchResult = {
    sources: searched,
    query,
    citations: citations.slice(0, 24),
    notes,
    formatted: "",
  };
  result.formatted = formatSearchResultsForPrompt(result);
  return result;
}
