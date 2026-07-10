import { useState, useEffect } from "react";
import type {PageType} from "../types";
import type {ClipsType} from "../types";

type InputSectionProps = {
  setPage: (page: PageType) => void;
  setClips: (clips: ClipsType) => void;
};

const InputSection = ({ setPage, setClips})  => {
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"url" | "upload">("url");
  
  useEffect(() => {
    const processVideo = async () => {
      const response = fetch("")
    }
  }, []);

  return (
    <section className="max-w-3xl mx-auto px-6 pb-16">
      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border)] mb-6">
        <button
          onClick={() => setMode("url")}
          className={`px-0 py-3 mr-8 text-sm font-medium border-b-2 transition-colors duration-150 ${
            mode === "url"
              ? "border-[var(--color-accent)] text-[var(--color-text)]"
              : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          }`}
        >
          YouTube link
        </button>
        <button
          onClick={() => setMode("upload")}
          className={`px-0 py-3 text-sm font-medium border-b-2 transition-colors duration-150 ${
            mode === "upload"
              ? "border-[var(--color-accent)] text-[var(--color-text)]"
              : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          }`}
        >
          Upload video
        </button>
      </div>

      {/* URL Input */}
      {mode === "url" && (
        <div className="flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-sm)] px-4 py-3 mb-4 focus-within:border-[var(--color-text-muted)] transition-colors duration-150">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-text-dim)"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Paste your YouTube link here"
            className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] font-light"
          />
        </div>
      )}

      {/* Upload Zone */}
      {mode === "upload" && (
        <div className="mb-4 w-full">
          {videoFile ? (
            <div className="border border-[var(--color-border)] rounded-[var(--radius-sm)] p-4 overflow-hidden relative">
              <video
                src={URL.createObjectURL(videoFile)}
                className="w-full h-64 object-cover"
                controls
              />

              <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-surface)]">
                <div>
                  <p className="text-xs text-[var(--color-text)] font-medium truncate max-w-xs">
                    {videoFile.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-dim)] mt-0.5">
                    {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => setVideoFile(null)}
                  className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-150"
                >
                  Change file
                </button>
              </div>
            </div>
          ) : (
            <div
              className="border border-dashed border-[var(--color-border)] rounded-[var(--radius-sm)] p-12 text-center cursor-pointer hover:border-[var(--color-text-muted)] transition-colors duration-150 mb-4 relative"
              onClick={() => document.getElementById("video-upload")?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) setVideoFile(file);
              }}
            >
              <input
                id="video-upload"
                type="file"
                accept="video/*"
                onChange={(e) =>
                  setVideoFile(e.target.files ? e.target.files[0] : null)
                }
                className="hidden"
              />

              <p className="text-sm text-[var(--color-text-muted)] font-light">
                Drop your video here or{" "}
                <span className="text-[var(--color-text)]">browse files</span>
              </p>
              <p className="text-xs text-[var(--color-text-dim)] mt-2 tracking-wide">
                MP4 · MOV · AVI — up to 2GB
              </p>
            </div>
          )}
        </div>
      )}

      {/* Submit */}
      <button className="w-full bg-[var(--color-accent)] hover:text-[var(--color-bg)] text-[var(--color-text)] text-sm font-semibold py-3 rounded-[var(--radius-sm)] hover:bg-white transition-colors duration-150" onClick={() => setPage("processing")}>
        Find the moments
      </button>

      {/* Trust signals */}
      <div className="w-full flex items-center gap-6 mt-4 justify-center">
        <span className="text-xs text-[var(--color-text-dim)]">
          No credit card required
        </span>
        <span className="text-xs text-[var(--color-text-dim)]">
          Works with any video
        </span>
        <span className="text-xs text-[var(--color-text-dim)]">
          Results in minutes
        </span>
      </div>
    </section>
  );
};

export default InputSection;
