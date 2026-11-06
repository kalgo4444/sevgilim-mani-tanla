import type { ClientInfo } from "../model/types";

/** Browser only: call after mount. */
export function collectClientInfo(): ClientInfo {
  let timezone = "";
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  } catch {
    timezone = "";
  }
  return {
    screen: { width: window.screen.width, height: window.screen.height },
    viewport: { width: window.innerWidth, height: window.innerHeight },
    pixelRatio: Math.round((window.devicePixelRatio || 1) * 100) / 100,
    language: navigator.language || "",
    timezone,
    touch: navigator.maxTouchPoints > 0 || "ontouchstart" in window,
  };
}
