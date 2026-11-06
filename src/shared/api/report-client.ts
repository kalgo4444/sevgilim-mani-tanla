const REPORT_ENDPOINT = "/api/report";
const REPORT_TIMEOUT_MS = 5000;

/**
 * POSTs a JSON report. Resolves to true on a 2xx answer, false on any
 * failure. Never throws, so a failed report cannot break the page.
 */
export async function postReport(body: unknown): Promise<boolean> {
  try {
    const response = await fetch(REPORT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
      signal: AbortSignal.timeout(REPORT_TIMEOUT_MS),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/** Sends a report with sendBeacon, for use while the page is closing. */
export function beaconReport(body: unknown): boolean {
  try {
    if (typeof navigator.sendBeacon !== "function") return false;
    const blob = new Blob([JSON.stringify(body)], { type: "application/json" });
    return navigator.sendBeacon(REPORT_ENDPOINT, blob);
  } catch {
    return false;
  }
}
