import { API_BASE_URL } from "./constants";

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

export const processVideoFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return fetch(`${API_BASE_URL}/upload-video`, {
    method: "POST",
    body: formData,
  });
};
