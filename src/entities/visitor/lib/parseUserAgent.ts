import type { DeviceInfo, DeviceType } from "../model/types";

interface NamedMatch {
  name: string;
  pattern: RegExp;
}

// Order matters: in-app browsers and Chromium forks also say "Chrome"/"Safari".
const BROWSERS: readonly NamedMatch[] = [
  { name: "Instagram", pattern: /Instagram[ /]([\d.]+)?/ },
  { name: "Facebook", pattern: /\b(?:FBAN|FBAV|FB_IAB)\/?([\d.]+)?/ },
  { name: "Telegram", pattern: /Telegram(?:-Android|Bot)?\/?([\d.]+)?/i },
  {
    name: "TikTok",
    pattern: /(?:musical_ly|BytedanceWebview|TikTok)[_/ ]?([\d.]+)?/i,
  },
  { name: "Samsung Internet", pattern: /SamsungBrowser\/([\d.]+)/ },
  { name: "Yandex", pattern: /YaBrowser\/([\d.]+)/ },
  { name: "Opera", pattern: /(?:OPR|OPiOS|Opera)\/([\d.]+)/ },
  { name: "Edge", pattern: /(?:Edg|EdgA|EdgiOS)\/([\d.]+)/ },
  { name: "Firefox", pattern: /(?:Firefox|FxiOS)\/([\d.]+)/ },
  { name: "Chrome", pattern: /(?:Chrome|CriOS)\/([\d.]+)/ },
  { name: "Safari", pattern: /Version\/([\d.]+).*Safari\// },
];

function majorMinor(version: string | undefined): string | undefined {
  if (!version) return undefined;
  return version.split(".").slice(0, 2).join(".");
}

function parseBrowser(
  ua: string,
): Pick<DeviceInfo, "browser" | "browserVersion"> {
  for (const { name, pattern } of BROWSERS) {
    const match = pattern.exec(ua);
    if (match) return { browser: name, browserVersion: majorMinor(match[1]) };
  }
  if (/Safari\//.test(ua)) return { browser: "Safari" };
  return { browser: "Noma’lum brauzer" };
}

function parseOs(ua: string): Pick<DeviceInfo, "os" | "osVersion"> {
  const ios = /(?:iPhone|iPad|iPod).*? OS (\d+(?:_\d+)*)/.exec(ua);
  if (ios)
    return { os: "iOS", osVersion: majorMinor(ios[1]?.replace(/_/g, ".")) };
  const android = /Android (\d+(?:\.\d+)*)/.exec(ua);
  if (android) return { os: "Android", osVersion: majorMinor(android[1]) };
  if (/Android/.test(ua)) return { os: "Android" };
  if (/Windows Phone/.test(ua)) return { os: "Windows Phone" };
  // "Windows NT 10.0" covers both Windows 10 and 11.
  const windows = /Windows NT (\d+\.\d+)/.exec(ua);
  if (windows)
    return {
      os: "Windows",
      osVersion: windows[1] === "10.0" ? "10/11" : windows[1],
    };
  if (/CrOS/.test(ua)) return { os: "ChromeOS" };
  const mac = /Mac OS X (\d+(?:[_.]\d+)*)/.exec(ua);
  if (mac)
    return { os: "macOS", osVersion: majorMinor(mac[1]?.replace(/_/g, ".")) };
  if (/Linux/.test(ua)) return { os: "Linux" };
  return { os: "Noma’lum tizim" };
}

function parseModel(ua: string): string | undefined {
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/iPod/.test(ua)) return "iPod";
  // "Android 14; SM-S918B Build/..." or "Android 14; Pixel 8)"
  const android =
    /Android [\d.]+;\s*(?:[a-z]{2}[-_][a-z]{2};\s*)?([^;)]+?)(?:\s+Build\/|\))/i.exec(
      ua,
    );
  const model = android?.[1]?.trim();
  // Chrome's reduced user agent hides the model as "K".
  if (model && model !== "K" && !/^wv$/i.test(model)) return model.slice(0, 40);
  return undefined;
}

function parseType(ua: string): DeviceType {
  if (/iPad|Tablet|PlayBook|Silk|Kindle/i.test(ua)) return "tablet";
  if (/Android/.test(ua) && !/Mobile/.test(ua)) return "tablet";
  if (/Mobi|iPhone|iPod|Android|Windows Phone/i.test(ua)) return "mobile";
  return "desktop";
}

/** Small hand-written user-agent parser. Good enough for a report, not for feature detection. */
export function parseUserAgent(
  userAgent: string | null | undefined,
): DeviceInfo {
  const ua = (userAgent ?? "").slice(0, 512);
  if (!ua)
    return {
      type: "desktop",
      os: "Noma’lum tizim",
      browser: "Noma’lum brauzer",
    };
  const model = parseModel(ua);
  return {
    type: parseType(ua),
    ...parseOs(ua),
    ...parseBrowser(ua),
    ...(model ? { model } : {}),
  };
}
