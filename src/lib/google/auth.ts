import { google } from "googleapis";
import { JWT } from "google-auth-library";

let cachedAuth: JWT | null = null;

export function getServiceAccountAuth(): JWT {
  if (cachedAuth) return cachedAuth;

  const keyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!keyRaw) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set");
  }

  let credentials: Record<string, string>;
  try {
    credentials = JSON.parse(keyRaw);
  } catch {
    // Try base64 decode
    try {
      const decoded = Buffer.from(keyRaw, "base64").toString("utf-8");
      credentials = JSON.parse(decoded);
    } catch {
      throw new Error("Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY as JSON or base64");
    }
  }

  cachedAuth = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });

  return cachedAuth;
}

export function getDriveClient() {
  const auth = getServiceAccountAuth();
  return google.drive({ version: "v3", auth });
}

export function getSheetsClient() {
  const auth = getServiceAccountAuth();
  return google.sheets({ version: "v4", auth });
}
