import type { Size } from "@/shared/types";

/** Browser-side details, collected after mount. */
export interface ClientInfo {
  screen: Size;
  viewport: Size;
  pixelRatio: number;
  language: string;
  timezone: string;
  touch: boolean;
}

export type DeviceType = "mobile" | "tablet" | "desktop";

/** Parsed from the user-agent header on the server. */
export interface DeviceInfo {
  type: DeviceType;
  os: string;
  osVersion?: string;
  browser: string;
  browserVersion?: string;
  model?: string;
}
