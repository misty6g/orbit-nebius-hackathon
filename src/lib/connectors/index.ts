export * from "./types";
export * from "./config";
export * from "./session";
export * from "./google";
export * from "./notion";
export * from "./slack";
export * from "./assemble";
export * from "./search";
export * from "./searchIntent";
export * from "./format";
export * from "./startOAuth";

import {
  getRedirectUri,
  isHostOAuthConfigured,
} from "./config";
import {
  resolveOAuthApp,
  readConnectorSession,
} from "./session";
import { ConnectorStatus } from "./types";

export function getConnectorStatus(): ConnectorStatus {
  const session = readConnectorSession();
  const googleApp = resolveOAuthApp("google");
  const notionApp = resolveOAuthApp("notion");
  const slackApp = resolveOAuthApp("slack");

  return {
    google: {
      configured: Boolean(googleApp),
      hostConfigured: isHostOAuthConfigured("google"),
      connected: Boolean(session.google?.accessToken),
      email: session.google?.email,
      redirectUri: getRedirectUri("google"),
      credentialSource: googleApp?.source,
    },
    notion: {
      configured: Boolean(notionApp),
      hostConfigured: isHostOAuthConfigured("notion"),
      connected: Boolean(session.notion?.accessToken),
      workspaceName: session.notion?.workspaceName,
      redirectUri: getRedirectUri("notion"),
      credentialSource: notionApp?.source,
    },
    slack: {
      configured: Boolean(slackApp),
      hostConfigured: isHostOAuthConfigured("slack"),
      connected: Boolean(session.slack?.accessToken),
      teamName: session.slack?.teamName,
      redirectUri: getRedirectUri("slack"),
      credentialSource: slackApp?.source,
    },
  };
}
