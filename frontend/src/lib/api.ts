import { API_BASE_URL } from "./constants";
import type { AccessibleClip } from "../types";

export type ThumbnailAccess = { url: string; expiresAt: string };

export async function getThumbnailAccess(projectIds: string[], token: string, signal?: AbortSignal): Promise<Record<string, ThumbnailAccess | null>> {
  const thumbnails: Record<string, ThumbnailAccess | null> = {};
  for (let offset = 0; offset < projectIds.length; offset += 100) {
    const response = await fetch(`${API_BASE_URL}/projects/thumbnail-access`, {
      method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ project_ids: projectIds.slice(offset, offset + 100) }), cache: "no-store", signal,
    });
    if (!response.ok) throw new Error("Unable to load thumbnails.");
    Object.assign(thumbnails, (await response.json()).thumbnails);
  }
  return thumbnails;
}

export async function deleteProject(projectId: string, token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/projects/${encodeURIComponent(projectId)}`, {
    method: "DELETE", headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
  });
  if (!response.ok) throw new Error(response.status === 404
    ? "Project not found or unavailable. Refresh your project history."
    : "Deletion could not be completed. Some files may already have been removed. Refresh before trying again.");
}

export async function getAccessibleClips(projectId: string, accessToken: string, signal?: AbortSignal): Promise<AccessibleClip[]> {
  const response = await fetch(`${API_BASE_URL}/projects/${encodeURIComponent(projectId)}/clips`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
    signal,
  });
  if (!response.ok) {
    throw new Error(response.status === 403
      ? "You do not have access to this project."
      : "Unable to load private clips. Please reload the page.");
  }
  return (await response.json()).clips;
}

export const processVideoUrl = async (
  url: string,
  projectId: string,
  accessToken: string,
) => {
  return fetch(`${API_BASE_URL}/process-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      url,
      project_id: projectId,
    }),
  });
};

export const processVideoFile = async (file: File, projectId: string, accessToken: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("project_id", projectId);

  return fetch(`${API_BASE_URL}/upload-video`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });
};
