import { ConnectorSource, SearchIntent } from "./types";
import type { SpecialistId } from "@/types/orbit";

const ALL_SOURCES: ConnectorSource[] = [
  "calendar",
  "gmail",
  "drive",
  "notion",
  "slack",
];

/** Detect whether the user asked to look something up in connected sources. */
export function detectSearchIntent(
  message: string,
  specialistId: SpecialistId = "core"
): SearchIntent {
  const lower = (message || "").toLowerCase().trim();
  const query = stripSourcePhrases(message || "").trim() || message || "";

  const explicit = detectExplicitSources(lower);
  const searchAll =
    lower.includes("across my tools") ||
    lower.includes("across my accounts") ||
    lower.includes("search everything") ||
    lower.includes("all connected") ||
    lower.includes("across connected");

  const lookupVerbs =
    /\b(find|search|look up|lookup|check|show me|what did|any (email|mail|slack|notes?)|where is|do i have)\b/.test(
      lower
    ) ||
    lower.includes("in my inbox") ||
    lower.includes("in gmail") ||
    lower.includes("in drive") ||
    lower.includes("in notion") ||
    lower.includes("in slack") ||
    lower.includes("on notion") ||
    lower.includes("from drive") ||
    lower.includes("from gmail");

  const domainHints = detectDomainHints(lower);

  let sources: ConnectorSource[] = [];
  if (searchAll) {
    sources = [...ALL_SOURCES];
  } else if (explicit.length > 0) {
    sources = explicit;
  } else if (lookupVerbs || domainHints.length > 0) {
    sources = mergeUnique(domainHints, specialistPreferredSources(specialistId));
  }

  // Specialist-implied search without explicit "find" for schedule-heavy asks
  if (sources.length === 0 && specialistImpliesSearch(specialistId, lower)) {
    sources = specialistPreferredSources(specialistId);
  }

  const shouldSearch = sources.length > 0 && (lookupVerbs || searchAll || domainHints.length > 0 || specialistImpliesSearch(specialistId, lower));

  return {
    shouldSearch,
    query,
    sources: searchAll ? [...ALL_SOURCES] : sources,
    searchAllConnected: searchAll,
  };
}

function detectExplicitSources(lower: string): ConnectorSource[] {
  const found: ConnectorSource[] = [];
  if (/\b(gmail|inbox|email|e-mail|mail)\b/.test(lower)) found.push("gmail");
  if (/\b(calendar|schedule|free time|free block|conflict)\b/.test(lower)) {
    found.push("calendar");
  }
  if (/\b(drive|slides?|pdf|doc(ument)?s?|spreadsheet|google drive)\b/.test(lower)) {
    found.push("drive");
  }
  if (/\b(notion|wiki|notes? page)\b/.test(lower)) found.push("notion");
  if (/\b(slack|channel|dm|teammate said)\b/.test(lower)) found.push("slack");
  return mergeUnique(found);
}

function detectDomainHints(lower: string): ConnectorSource[] {
  const found: ConnectorSource[] = [];
  if (
    lower.includes("professor") ||
    lower.includes("unread") ||
    lower.includes("emailed") ||
    lower.includes("email about")
  ) {
    found.push("gmail");
  }
  if (
    lower.includes("when is") ||
    lower.includes("free time") ||
    lower.includes("tonight") ||
    lower.includes("this week") ||
    lower.includes("conflict")
  ) {
    found.push("calendar");
  }
  if (lower.includes("slides") || lower.includes("lecture notes") || lower.includes("pdf")) {
    found.push("drive");
  }
  if (lower.includes("hackathon") && lower.includes("slack")) {
    found.push("slack");
  }
  return found;
}

function specialistPreferredSources(specialistId: SpecialistId): ConnectorSource[] {
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

function specialistImpliesSearch(specialistId: SpecialistId, lower: string): boolean {
  if (specialistId === "schedule") {
    return (
      lower.includes("today") ||
      lower.includes("tonight") ||
      lower.includes("free") ||
      lower.includes("class") ||
      lower.includes("when")
    );
  }
  if (specialistId === "study") {
    return lower.includes("find") || lower.includes("slides") || lower.includes("notes");
  }
  if (specialistId === "career" || specialistId === "core") {
    return lower.includes("email") || lower.includes("inbox") || lower.includes("professor");
  }
  return false;
}

function stripSourcePhrases(message: string): string {
  return message
    .replace(/\b(in|on|from|across)\s+(my\s+)?(gmail|inbox|google\s*drive|drive|notion|slack|calendar|tools|accounts)\b/gi, " ")
    .replace(/\b(search|find|look up|lookup)\b/gi, " ")
    .replace(/\s+/g, " ");
}

function mergeUnique(...lists: ConnectorSource[][]): ConnectorSource[] {
  const out: ConnectorSource[] = [];
  for (const list of lists) {
    for (const item of list) {
      if (!out.includes(item)) out.push(item);
    }
  }
  return out;
}

/** Parse optional model follow-up search marker. */
export function parseOrbitSearchMarker(
  content: string
): { sources: ConnectorSource[]; query: string } | null {
  const match = content.match(/<!--orbit-search:([\s\S]*?)-->/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[1]);
    const sources = (parsed.sources || []).filter((s: string) =>
      ALL_SOURCES.includes(s as ConnectorSource)
    ) as ConnectorSource[];
    if (!sources.length || !parsed.query) return null;
    return { sources, query: String(parsed.query) };
  } catch {
    return null;
  }
}

export function stripOrbitSearchMarker(content: string): string {
  return content.replace(/<!--orbit-search:[\s\S]*?-->/g, "").trim();
}
