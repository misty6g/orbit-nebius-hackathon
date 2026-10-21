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

import {
  isGoogleConfigured,
  isNotionConfigured,
  isSlackConfigured,
} from "./config";
import { readConnectorSession } from "./session";
import { ConnectorStatus } from "./types";

export function getConnectorStatus(): ConnectorStatus {
  const session = readConnectorSession();
  return {
    google: {
      configured: isGoogleConfigured(),
      connected: Boolean(session.google?.accessToken),
      email: session.google?.email,
    },
    notion: {
      configured: isNotionConfigured(),
      connected: Boolean(session.notion?.accessToken),
      workspaceName: session.notion?.workspaceName,
    },
    slack: {
      configured: isSlackConfigured(),
      connected: Boolean(session.slack?.accessToken),
      teamName: session.slack?.teamName,
    },
  };
}
