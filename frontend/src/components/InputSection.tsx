//import { processVideoUrl, processVideoFile } from "../lib/api";

import { useCliprolContext } from "../context/CliprolContext";

const InputSection = () => {
  const { setPage, setClips, setError, error, inputMode, setInputMode, videoUrl, setVideoUrl, videoFile, setVideoFile, processing, setProcessing} = useCliprolContext();

  const validateInputAndNavigate = async () => {
    // Validate first before navigating
    if (inputMode === "url" && !videoUrl.trim()) {
      setError("Please enter a valid YouTube link");
      return {
        /*setPage("results")*/
      }; //REMEMBER TO REMOVE THIS!
      setProcessing(false);
    }

    if (inputMode === "upload" && !videoFile) {
      setError("Please upload a video file");
      return;
      setProcessing(false);
    }

    // Only navigate after validation passes
    setProcessing(true);
    setPage("processing");
    setError(null);
  };

  return (
    <section className="max-w-3xl mx-auto px-6 pb-16">
      {/* Tabs */}
      <div className="flex items-center justify-center border-b border-[var(--color-border)] mb-6">
        <button
          onClick={() => setInputMode("url")}
          className={`px-0 py-3 mr-8 text-sm font-medium border-b-2 transition-colors duration-150 cursor-pointer ${
            inputMode === "url"
              ? "border-[var(--color-accent)] text-[var(--color-text)] font-semibold"
              : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          }`}
        >
          YouTube link
        </button>
        <button
          onClick={() => setInputMode("upload")}
          className={`px-0 py-3 text-sm font-medium border-b-2 transition-colors duration-150 cursor-pointer ${
            inputMode === "upload"
              ? "border-[var(--color-accent)] text-[var(--color-text)] font-semibold"
              : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          }`}
        >
          Upload video
        </button>
      </div>

      {/* URL Input */}
      {inputMode === "url" && (
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
      {inputMode === "upload" && (
        <div className="mb-4 w-full">
          {videoFile ? (
            <div className="border border-[var(--color-border)] rounded-[var(--radius-sm)] p-4 overflow-hidden relative">
              <video
                src={URL.createObjectURL(videoFile)}
                className="w-4/5 h-48 mx-auto object-cover"
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
                  className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-150 cursor-pointer"
                >
                  Change file
                </button>
              </div>
            </div>
          ) : (
            <div
              className="border border-dashed border-[var(--color-border)] rounded-[var(--radius-sm)] p-12 text-center cursor-pointer hover:border-[var(--color-text-muted)] hover:bg-[var(--color-surface2)] transition-colors duration-150 mb-4 relative cursor-pointer"
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
                <span className="text-[var(--color-text)]">
                  choose one from your device
                </span>
              </p>
              <p className="text-xs text-[var(--color-text-dim)] mt-2 tracking-wide">
                MP4 · MOV · AVI — up to 2GB
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface2)] px-4 py-3">
          <p className="text-sm text-[var(--color-text)]">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        disabled={processing}
        onClick={validateInputAndNavigate}
        className={`w-full bg-[var(--color-accent)] text-[var(--color-bg)] text-sm font-semibold py-3 rounded-[var(--radius-sm)] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-white ${processing ? "cursor-wait" : "cursor-pointer"}`}
      >
        {processing ? "Preparing..." : "Create clips"}
      </button>

      {/* Trust signals 
      <div className="w-full flex items-center gap-6 mt-4 justify-center text-[var(--color-text-muted)]">
        <span className="text-xs">No Sign up required</span>
        <span className="text-xs">YouTube or upload</span>
        <span className="text-xs">Ready in minutes</span>
      </div>
      */}
    </section>
  );
};

export default InputSection;
