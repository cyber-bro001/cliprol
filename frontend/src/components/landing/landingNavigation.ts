import type { MouseEvent } from "react";

export const landingLinks = [
  { label: "Moments", href: "#whycliprol" },
  { label: "Ready to share", href: "#ready-to-share" },
  { label: "FAQ", href: "#faq" },
] as const;

// Focus the existing form; validation, authentication and creation remain there.
export function focusVideoInput(event: MouseEvent<HTMLAnchorElement>) {
  const form = document.getElementById("video-input");
  const input = form?.querySelector<HTMLInputElement>("input");
  if (!input || input.matches(":disabled")) return;
  event.preventDefault();
  input.focus({ preventScroll: true });
  form?.scrollIntoView({ block: "center" });
}
