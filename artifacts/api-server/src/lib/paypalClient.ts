/**
 * PayPal REST credentials + access tokens.
 *
 * Credentials come from the Replit PayPal connector (preferred); if the
 * connector is unavailable, `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET`
 * environment secrets are used as a fallback. Nothing is cached — PayPal access
 * tokens are short-lived and connector tokens can rotate.
 */

export interface PayPalCredentials {
  clientId: string;
  clientSecret: string;
  /** "live" or "sandbox" — selects the API base URL. */
  environment: "live" | "sandbox";
}

function apiBaseFor(environment: "live" | "sandbox"): string {
  return environment === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";
}

async function fetchConnectorCredentials(): Promise<PayPalCredentials | null> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

  if (!hostname || !xReplitToken) return null;

  try {
    const resp = await fetch(
      `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=paypal`,
      {
        headers: { Accept: "application/json", X_REPLIT_TOKEN: xReplitToken },
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!resp.ok) return null;

    const data = (await resp.json()) as {
      items?: Array<{ settings?: Record<string, unknown> }>;
    };
    const settings = data.items?.[0]?.settings;
    if (!settings) return null;

    const get = (...keys: string[]): string | undefined => {
      for (const k of keys) {
        const v = settings[k];
        if (typeof v === "string" && v.length > 0) return v;
      }
      return undefined;
    };

    const clientId = get("client_id", "clientId", "client_id_live");
    const clientSecret = get(
      "client_secret",
      "clientSecret",
      "secret",
      "client_secret_live",
    );
    if (!clientId || !clientSecret) return null;

    const envRaw = (
      get("environment", "mode", "env") ?? ""
    ).toLowerCase();
    const environment: "live" | "sandbox" =
      envRaw === "sandbox" || envRaw === "test" ? "sandbox" : "live";

    return { clientId, clientSecret, environment };
  } catch {
    return null;
  }
}

function fetchEnvCredentials(): PayPalCredentials | null {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  const environment: "live" | "sandbox" =
    (process.env.PAYPAL_ENV ?? "").toLowerCase() === "sandbox"
      ? "sandbox"
      : "live";
  return { clientId, clientSecret, environment };
}

export async function getPayPalCredentials(): Promise<PayPalCredentials> {
  const creds = (await fetchConnectorCredentials()) ?? fetchEnvCredentials();
  if (!creds) {
    throw new Error(
      "PayPal is not connected. Connect the PayPal integration (or set " +
        "PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET) to enable PayPal payments.",
    );
  }
  return creds;
}

export interface PayPalContext {
  accessToken: string;
  apiBase: string;
  environment: "live" | "sandbox";
}

/** Obtain a fresh OAuth2 access token for the PayPal REST API. */
export async function getPayPalContext(): Promise<PayPalContext> {
  const { clientId, clientSecret, environment } = await getPayPalCredentials();
  const apiBase = apiBaseFor(environment);

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const resp = await fetch(`${apiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    signal: AbortSignal.timeout(10_000),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`PayPal auth failed: ${resp.status} ${text}`);
  }

  const json = (await resp.json()) as { access_token?: string };
  if (!json.access_token) {
    throw new Error("PayPal auth returned no access token");
  }
  return { accessToken: json.access_token, apiBase, environment };
}

/** Public client id for loading the PayPal JS SDK in the browser. */
export async function getPayPalPublicConfig(): Promise<{
  clientId: string;
  environment: "live" | "sandbox";
}> {
  const { clientId, environment } = await getPayPalCredentials();
  return { clientId, environment };
}
