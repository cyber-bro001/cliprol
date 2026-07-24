import ClipCard from "../components/ClipCard";
import { useCliprolContext } from "../context/CliprolContext";

const ResultsPage = () => {
  const { clips, setPage } = useCliprolContext();

  return (
    <section className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="text-center">
          <p className="text-sm text-[var(--color-text-muted)]">Cliprol</p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--color-text)]">
            Your clips are ready.
          </h1>

          <p className="mt-4 text-[var(--color-text-muted)]">
            We found{" "}
            <span className="text-[var(--color-text)] font-medium">
              {clips.length}
            </span>{" "}
            {clips.length === 1
              ? "moment worth sharing."
              : "moments worth sharing."}
          </p>
        </header>

        {/* Empty state */}
        {clips.length === 0 ? (
          <div className="mt-20 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center">
            <h2 className="text-xl font-medium text-[var(--color-text)]">
              No clips found
            </h2>

            <p className="mt-3 text-[var(--color-text-muted)]">
              We couldn't find any moments worth clipping from this video. Try
              another video or adjust your input.
            </p>

            <button
              onClick={() => setPage("landing")}
              className="mt-8 rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-[var(--color-bg)] transition-colors duration-150 hover:bg-white"
            >
              Process another video
            </button>
          </div>
        ) : (
          <>
            {/* Clips */}
            <div className="mt-16 grid gap-8 md:grid-cols-2">
              {clips.map((clip, index) => (
                <ClipCard
                  key={`${clip.start}-${clip.end}-${index}`}
                  index={index}
                  clip={clip}
                />
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-16 flex justify-center">
              <button
                onClick={() => setPage("landing")}
                className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-6 py-3 text-sm font-medium text-[var(--color-text)] transition-colors duration-150 hover:bg-[var(--color-surface2)]"
              >
                Process another video
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default ResultsPage;
