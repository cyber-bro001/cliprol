import { useLocation, useNavigate } from "react-router-dom";
import { useCliprolContext } from "../context/CliprolContext";
import { validateVideoUrl } from "../lib/platforms";

type InputSectionProps = { onProcess?: () => Promise<void> | void };

const InputSection = ({ onProcess }: InputSectionProps) => {
  const navigate = useNavigate();
  const isLandingPage = useLocation().pathname === "/";
  const { setError, error, inputMode, setInputMode, videoUrl, setVideoUrl, videoFile, setVideoFile, processing, setProcessing, session } = useCliprolContext();

  const validateInput = () => {
    if (inputMode === "url") {
      const result = validateVideoUrl(videoUrl);
      if (!result.valid) { setError(result.reason); return false; }
    } else if (!videoFile) { setError("Please upload a video."); return false; }
    setError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validateInput()) return;
    if (isLandingPage) {
      if (inputMode === "url") sessionStorage.setItem("cliprol.pendingVideoUrl", videoUrl);
      navigate(session ? "/dashboard/new-project" : "/login");
      return;
    }
    if (!onProcess) return;
    setProcessing(true);
    try { await onProcess(); }
    catch (error) {
      setError(error instanceof Error ? error.message : "Unable to create project. Please try again.");
      setProcessing(false);
    }
  };

  return <section className="mx-auto max-w-3xl px-0 pb-8 sm:pb-16">
    <div className="mb-6 flex items-center justify-center border-b border-[var(--color-border)]">
      <button onClick={() => setInputMode("url")} className={`mr-6 px-0 py-3 text-sm font-medium border-b-2 transition-colors duration-150 cursor-pointer sm:mr-8 ${inputMode === "url" ? "border-[var(--color-accent)] text-[var(--color-text)] font-semibold" : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"}`}>YouTube link</button>
      <button onClick={() => setInputMode("upload")} className={`px-0 py-3 text-sm font-medium border-b-2 transition-colors duration-150 cursor-pointer ${inputMode === "upload" ? "border-[var(--color-accent)] text-[var(--color-text)] font-semibold" : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"}`}>Upload video</button>
    </div>
    {inputMode === "url" && <div className="mb-4 flex min-w-0 items-center gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 focus-within:border-[var(--color-text-muted)]"><input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Paste your video link here" className="min-w-0 flex-1 bg-transparent border-none outline-none text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] font-light" /></div>}
    {inputMode === "upload" && <div className="mb-4 w-full">
      {videoFile ? <div className="relative overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3 sm:p-4"><video src={URL.createObjectURL(videoFile)} className="mx-auto h-auto max-h-64 w-full object-cover sm:w-4/5" controls /><div className="flex min-w-0 items-center justify-between gap-3 px-1 py-3 sm:px-4"><div className="min-w-0"><p className="truncate text-xs font-medium text-[var(--color-text)]">{videoFile.name}</p><p className="mt-0.5 text-xs text-[var(--color-text-dim)]">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p></div><button onClick={() => setVideoFile(null)} className="shrink-0 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]">Change file</button></div></div> : <div className="mb-4 cursor-pointer rounded-[var(--radius-sm)] border border-dashed border-[var(--color-border)] p-8 text-center transition-colors duration-150 hover:border-[var(--color-text-muted)] hover:bg-[var(--color-surface2)] sm:p-12" onClick={() => document.getElementById("video-upload")?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) setVideoFile(file); }}><input id="video-upload" type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files ? e.target.files[0] : null)} className="hidden" /><p className="text-sm text-[var(--color-text-muted)] font-light">Drop your video here or <span className="text-[var(--color-text)]">choose one from your device</span></p><p className="mt-2 text-xs tracking-wide text-[var(--color-text-dim)]">MP4 · MOV · AVI — up to 2GB</p></div>}
    </div>}
    {error && <div className="mb-5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface2)] px-4 py-3"><p className="text-sm text-[var(--color-text)]">{error}</p></div>}
    <button disabled={processing} onClick={handleSubmit} className="w-full bg-[var(--color-accent)] text-[var(--color-bg)] text-sm font-semibold py-3 rounded-[var(--radius-sm)] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-white">{processing ? "Preparing..." : isLandingPage ? "Continue" : "Process"}</button>
    <div className="mt-4 flex w-full flex-wrap justify-center gap-x-4 gap-y-1 text-[var(--color-text-muted)] sm:gap-6"><span className="text-xs">No credit card required</span><span className="text-xs">Video URL or upload</span><span className="text-xs">Ready in minutes</span></div>
  </section>;
};

export default InputSection;
