import {
  ConnectorCitation,
  ConnectorSnapshot,
  ConnectorSearchResult,
} from "./types";

export function formatSnapshotForPrompt(snapshot: ConnectorSnapshot): string {
  const lines: string[] = ["[Connected account snapshot]"];

  if (snapshot.notes.length) {
    for (const note of snapshot.notes) {
      lines.push(`- Note: ${note}`);
    }
  }

  if (snapshot.calendar.length) {
    lines.push("Calendar (next 7 days):");
    for (const evt of snapshot.calendar) {
      const loc = evt.location ? ` @ ${evt.location}` : "";
      lines.push(`- ${evt.title}: ${evt.start} → ${evt.end}${loc}`);
    }
  }

  if (snapshot.gmail.length) {
    lines.push("Gmail (recent inbox):");
    for (const mail of snapshot.gmail) {
      lines.push(
        `- From ${mail.from}: "${mail.subject}" (${mail.date}) - ${mail.snippet}`
      );
    }
  }

  if (snapshot.drive.length) {
    lines.push("Google Drive (recent files):");
    for (const file of snapshot.drive) {
      lines.push(`- ${file.name} [${file.mimeType}] modified ${file.modifiedTime}`);
    }
  }

  if (snapshot.notion.length) {
    lines.push("Notion (workspace pages):");
    for (const page of snapshot.notion) {
      lines.push(`- ${page.title}${page.url ? ` (${page.url})` : ""}`);
    }
  }

  if (lines.length === 1) {
    lines.push("- No live connector data available. Using Shared Brain profile.");
  }

  // Em-dash forbidden in Orbit copy; sanitize accidental ones from upstream snippets
  return lines.join("\n").replace(/\u2014/g, "-");
}

export function formatSearchResultsForPrompt(result: ConnectorSearchResult): string {
  if (!result.citations.length && !result.notes.length) {
    return "[Connected source search results]\n- No matching results in connected sources.";
  }
  const lines: string[] = [
    `[Connected source search results for "${result.query}"]`,
    `Sources searched: ${result.sources.join(", ") || "none"}`,
  ];
  for (const note of result.notes) {
    lines.push(`- Note: ${note}`);
  }
  for (const c of result.citations) {
    const link = c.url ? ` ${c.url}` : "";
    const snip = c.snippet ? ` - ${c.snippet}` : "";
    lines.push(`- [${c.source}] ${c.title}${link}${snip}`);
  }
  return lines.join("\n").replace(/\u2014/g, "-");
}

export function citationsFromSnapshot(snapshot: ConnectorSnapshot): ConnectorCitation[] {
  const out: ConnectorCitation[] = [];
  for (const evt of snapshot.calendar) {
    out.push({
      title: evt.title,
      url: evt.htmlLink,
      id: evt.id,
      source: "calendar",
      snippet: `${evt.start} → ${evt.end}`,
    });
  }
  for (const mail of snapshot.gmail) {
    out.push({
      title: mail.subject,
      url: mail.permalink,
      id: mail.id,
      source: "gmail",
      snippet: mail.snippet,
    });
  }
  for (const file of snapshot.drive) {
    out.push({
      title: file.name,
      url: file.webViewLink,
      id: file.id,
      source: "drive",
      snippet: file.modifiedTime,
    });
  }
  for (const page of snapshot.notion) {
    out.push({
      title: page.title,
      url: page.url,
      id: page.id,
      source: "notion",
      snippet: page.excerpt || page.lastEdited,
    });
  }
  return out;
}
