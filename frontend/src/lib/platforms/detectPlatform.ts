import { platforms, type VideoPlatform } from "./platforms";

export function detectPlatform(url: URL): VideoPlatform | null {
  const host = url.hostname.toLowerCase();
  return (Object.entries(platforms).find(([, platform]) => platform.hosts.includes(host))?.[0] as VideoPlatform | undefined) ?? null;
}
