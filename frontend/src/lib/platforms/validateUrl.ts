import { detectPlatform } from "./detectPlatform";
import type { VideoPlatform } from "./platforms";

export type VideoUrlValidation =
  | { valid: true; platform: VideoPlatform }
  | { valid: false; reason: string };

/** Validates URL syntax and platform support only, never video availability. */
export function validateVideoUrl(input: string): VideoUrlValidation {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return { valid: false, reason: "Please enter a valid video URL." };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { valid: false, reason: "Please enter a valid video URL." };
  }
  const platform = detectPlatform(url);
  return platform
    ? { valid: true, platform }
    : { valid: false, reason: "Unsupported video platform." };
}
