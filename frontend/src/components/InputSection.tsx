import { useEffect, useId, useRef } from "react";
import { ArrowUpRight, Link2, Upload } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCliprolContext } from "../context/CliprolContext";
import { validateVideoUrl } from "../lib/platforms";
import { hasPendingUpload, rememberInput } from "../lib/authHelpers/pendingInput";

function FilePreview({ file }: { file: File }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    if (videoRef.current) videoRef.current.src = objectUrl;
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  return <video ref={videoRef} controls preload="metadata" className="input-video" aria-label="Selected video preview" />;
}

export default function InputSection({ onProcess }: { onProcess?: () => Promise<void> | void }) {
  const navigate = useNavigate();
  const isLanding = useLocation().pathname === "/";
  const id = useId();
  const { setError, error, inputMode, setInputMode, videoUrl, setVideoUrl, videoFile, setVideoFile, processing, setProcessing, session, authLoading } = useCliprolContext();
  const selectMode = (mode: "url" | "upload") => { setInputMode(mode); setError(null); };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (processing || authLoading) return;
    if (inputMode === "url") {
      const result = validateVideoUrl(videoUrl);
      if (!result.valid) { setError(result.reason); return; }
    } else if (!videoFile) { setError("Choose a video from your device to continue."); return; }
    setError(null);
    if (isLanding) {
      rememberInput(inputMode, videoUrl);
      navigate(session ? "/dashboard/new-project" : "/login");
      return;
    }
    if (!onProcess) return;
    setProcessing(true);
    try { await onProcess(); }
    catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to create project. Please try again.");
      setProcessing(false);
    }
  };
  return <form id="video-input" className="video-input" onSubmit={submit} noValidate aria-label="Add your video">
    <fieldset disabled={processing || authLoading}>
      <legend className="sr-only">Choose your video source</legend>
      <div className="input-modes">
        <button type="button" aria-pressed={inputMode === "url"} onClick={() => selectMode("url")}><Link2 size={16} aria-hidden="true" /> YouTube link</button>
        <button type="button" aria-pressed={inputMode === "upload"} onClick={() => selectMode("upload")}><Upload size={16} aria-hidden="true" /> Upload video</button>
      </div>
      {inputMode === "url" ? <div className="input-row">
        <label htmlFor={`${id}-url`} className="sr-only">YouTube video URL</label>
        <input id={`${id}-url`} type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="Paste your YouTube video link" aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} />
        <button className="button-primary" type="submit">{processing ? "Preparing…" : "Find my clips"}<ArrowUpRight size={18} aria-hidden="true" /></button>
      </div> : <div className="upload-area" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (!processing && !authLoading) setVideoFile(e.dataTransfer.files[0] ?? null); }}>
        {videoFile && <><FilePreview file={videoFile} /><p className="file-name">{videoFile.name}</p></>}
        {!videoFile && hasPendingUpload() && <p role="status">Your local video isn’t available here. Please select it again to continue.</p>}
        <label htmlFor={`${id}-file`}>{videoFile ? "Choose a different video" : "Drop a video here, or choose a file"}</label>
        <input id={`${id}-file`} type="file" accept="video/*" onChange={e => setVideoFile(e.target.files?.[0] ?? null)} aria-describedby={error ? `${id}-error` : undefined} />
        <button className="button-primary" type="submit">{processing ? "Preparing…" : "Find my clips"}<ArrowUpRight size={18} aria-hidden="true" /></button>
      </div>}
    </fieldset>
    {error && <p id={`${id}-error`} role="alert" className="input-error">{error}</p>}
    <p className="input-note">{isLanding && !session ? "Sign in to create a project and review your clips." : "Your video. Your choice of what to use."}{inputMode === "upload" && " If you reload or leave this browser session, you’ll need to select your file again."}</p>
  </form>;
}
