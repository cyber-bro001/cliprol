/** Only restore known dashboard views. Never resume the processing POST route. */
export function loginDestination(state: unknown, pendingVideoUrl: string | null, pendingUpload = false): string {
  if (pendingUpload || pendingVideoUrl?.trim()) return "/dashboard/new-project";
  const from = state && typeof state === "object" && "from" in state ? state.from : null;
  if (typeof from !== "string" || /[\\\s%]/.test(from)) return "/dashboard/projects";
  if (/^\/dashboard(?:\/(?:projects(?:\/[0-9a-f-]+)?|new-project|settings))?(?:[?#].*)?$/i.test(from)) {
    return from;
  }
  return "/dashboard/projects";
}
