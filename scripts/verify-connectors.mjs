/**
 * Lightweight verification for connector formatters and search intent router.
 * Run: node scripts/verify-connectors.mjs
 */

import assert from "node:assert/strict";

// --- Intent router (mirrors src/lib/connectors/searchIntent.ts logic) ---
const ALL_SOURCES = ["calendar", "gmail", "drive", "notion", "slack"];

function detectExplicitSources(lower) {
  const found = [];
  if (/\b(gmail|inbox|email|e-mail|mail)\b/.test(lower)) found.push("gmail");
  if (/\b(calendar|schedule|free time|free block|conflict)\b/.test(lower)) {
    found.push("calendar");
  }
  if (/\b(drive|slides?|pdf|doc(ument)?s?|spreadsheet|google drive)\b/.test(lower)) {
    found.push("drive");
  }
  if (/\b(notion|wiki|notes? page)\b/.test(lower)) found.push("notion");
  if (/\b(slack|channel|dm|teammate said)\b/.test(lower)) found.push("slack");
  return [...new Set(found)];
}

function specialistPreferredSources(specialistId) {
  switch (specialistId) {
    case "schedule":
    case "travel":
      return ["calendar"];
    case "study":
      return ["drive", "notion"];
    case "career":
      return ["gmail", "notion"];
    case "explore":
    case "build":
      return ["slack", "notion"];
    case "core":
      return ["gmail", "calendar"];
    default:
      return ["gmail", "calendar"];
  }
}

function specialistImpliesSearch(specialistId, lower) {
  if (specialistId === "schedule") {
    return (
      lower.includes("today") ||
      lower.includes("tonight") ||
      lower.includes("free") ||
      lower.includes("class") ||
      lower.includes("when")
    );
  }
  return false;
}

function detectSearchIntent(message, specialistId = "core") {
  const lower = (message || "").toLowerCase().trim();
  const explicit = detectExplicitSources(lower);
  const searchAll =
    lower.includes("across my tools") ||
    lower.includes("search everything") ||
    lower.includes("all connected");
  const lookupVerbs =
    /\b(find|search|look up|lookup|check|show me)\b/.test(lower) ||
    lower.includes("in gmail") ||
    lower.includes("in drive") ||
    lower.includes("in notion") ||
    lower.includes("in slack");

  let sources = [];
  if (searchAll) sources = [...ALL_SOURCES];
  else if (explicit.length) sources = explicit;
  else if (lookupVerbs || specialistImpliesSearch(specialistId, lower)) {
    sources = specialistPreferredSources(specialistId);
  }

  return {
    shouldSearch:
      sources.length > 0 &&
      (lookupVerbs || searchAll || explicit.length > 0 || specialistImpliesSearch(specialistId, lower)),
    sources,
    searchAllConnected: searchAll,
  };
}

function formatSnapshotForPrompt(snapshot) {
  const lines = ["[Connected account snapshot]"];
  if (snapshot.calendar?.length) {
    lines.push("Calendar (next 7 days):");
    for (const evt of snapshot.calendar) {
      lines.push(`- ${evt.title}: ${evt.start} → ${evt.end}`);
    }
  }
  if (snapshot.gmail?.length) {
    lines.push("Gmail (recent inbox):");
    for (const mail of snapshot.gmail) {
      lines.push(`- From ${mail.from}: "${mail.subject}" (${mail.date}) - ${mail.snippet}`);
    }
  }
  return lines.join("\n");
}

function formatSearchResultsForPrompt(result) {
  const lines = [
    `[Connected source search results for "${result.query}"]`,
    `Sources searched: ${result.sources.join(", ") || "none"}`,
  ];
  for (const c of result.citations) {
    lines.push(`- [${c.source}] ${c.title}`);
  }
  return lines.join("\n");
}

// Intent tests
const gmailIntent = detectSearchIntent("find the email from Professor Mohan about the project", "core");
assert.equal(gmailIntent.shouldSearch, true);
assert.ok(gmailIntent.sources.includes("gmail"));

const driveIntent = detectSearchIntent("find my CSCI 320 slides in Drive", "study");
assert.equal(driveIntent.shouldSearch, true);
assert.ok(driveIntent.sources.includes("drive"));

const notionIntent = detectSearchIntent("search Notion for volleyball", "study");
assert.equal(notionIntent.shouldSearch, true);
assert.ok(notionIntent.sources.includes("notion"));

const slackIntent = detectSearchIntent("any Slack about the hackathon", "explore");
assert.equal(slackIntent.shouldSearch, true);
assert.ok(slackIntent.sources.includes("slack"));

const allIntent = detectSearchIntent("search everything across my tools for internship", "core");
assert.equal(allIntent.searchAllConnected, true);
assert.deepEqual(allIntent.sources, ALL_SOURCES);

const scheduleIntent = detectSearchIntent("what classes do I have today?", "schedule");
assert.equal(scheduleIntent.shouldSearch, true);
assert.ok(scheduleIntent.sources.includes("calendar"));

// Formatter fixtures
const snapText = formatSnapshotForPrompt({
  calendar: [
    {
      title: "CSCI 320",
      start: "2026-10-21T10:00:00Z",
      end: "2026-10-21T11:00:00Z",
    },
  ],
  gmail: [
    {
      from: "prof@rit.edu",
      subject: "Project guidelines",
      date: "Mon",
      snippet: "Please read",
    },
  ],
});
assert.match(snapText, /Connected account snapshot/);
assert.match(snapText, /CSCI 320/);
assert.match(snapText, /Project guidelines/);
assert.equal(snapText.includes("\u2014"), false);

const searchText = formatSearchResultsForPrompt({
  query: "volleyball",
  sources: ["notion", "slack"],
  citations: [
    { source: "notion", title: "Club notes" },
    { source: "slack", title: "#sports" },
  ],
});
assert.match(searchText, /volleyball/);
assert.match(searchText, /\[notion\] Club notes/);

console.log("verify-connectors: all checks passed");
