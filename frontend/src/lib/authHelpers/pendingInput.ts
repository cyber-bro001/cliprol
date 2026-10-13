const uploadKey = "cliprol.pendingUpload";
export const hasPendingUpload = () => sessionStorage.getItem(uploadKey) === "true";
export function rememberInput(mode: "url" | "upload", url: string) {
  if (mode === "upload") {
    sessionStorage.setItem(uploadKey, "true");
    sessionStorage.removeItem("cliprol.pendingVideoUrl");
  } else {
    sessionStorage.removeItem(uploadKey);
    sessionStorage.setItem("cliprol.pendingVideoUrl", url);
  }
}
export function clearPendingInput() {
  sessionStorage.removeItem(uploadKey);
  sessionStorage.removeItem("cliprol.pendingVideoUrl");
}
