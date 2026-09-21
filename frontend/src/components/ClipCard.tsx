import type { ClipType } from "../types";

type ClipCardProps = {
  clip: ClipType;
  index: number;
};

const ClipCard = ({ clip, index }: ClipCardProps) => {
  return (
    <article className="min-w-0 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
      {/* Video */}
      <video
        src={clip.video}
        controls
        preload="metadata"
        className="aspect-video w-full bg-black"
      />

      {/* Content */}
      <div className="p-4 sm:p-6">
        {/* Clip Number */}
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-dim)]">
          Clip {index}
        </p>

        {/* Timestamp */}
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          {clip.start} — {clip.end}
        </p>

        {/* Reason */}
        <div className="mt-6">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-dim)]">
            Why this clip
          </p>

          <p className="mt-2 break-words leading-7 text-[var(--color-text)]">
            {clip.reason}
          </p>
        </div>

        {/* Action */}
        <div className="mt-6 flex sm:mt-8 sm:justify-end">
          <a
            href={clip.video}
            download
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-4 py-2 text-center text-sm font-medium text-[var(--color-text)] transition-colors duration-150 hover:bg-[var(--color-surface2)] sm:w-auto"
          >
            Download
          </a>
        </div>
      </div>
    </article>
  );
};

export default ClipCard;
