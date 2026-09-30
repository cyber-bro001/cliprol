import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Project } from "../types";
import type { ThumbnailAccess } from "../lib/api";

type Props = {
  project: Project;
  thumbnail?: ThumbnailAccess | null;
  onDelete: () => Promise<void>;
};

export default function ProjectCard({ project, thumbnail, onDelete }: Props) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const menu = useRef<HTMLDetailsElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const title = project.title && !/^https?:\/\//i.test(project.title.trim()) ? project.title : "Untitled project";
  const href = `/dashboard/projects/${project.id}`;

  useEffect(() => {
    if (confirming) {
      dialog.current?.showModal();
      cancelButton.current?.focus();
    }
  }, [confirming]);

  const remove = async () => {
    if (deleting) return;
    setDeleting(true);
    setError(null);
    try { await onDelete(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Deletion could not be completed."); }
    finally { setDeleting(false); }
  };

  return <li className="min-w-0 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]">
    <Link to={href} aria-label={`Open ${title}`} className="flex aspect-video items-center justify-center bg-[var(--color-surface2)]">
      {thumbnail?.url && thumbnail.url !== failedImage
        ? <img src={thumbnail.url} alt={`Thumbnail for ${title}`} loading="lazy" className="h-full w-full object-contain" onError={() => setFailedImage(thumbnail.url)} />
        : <span className="text-xs text-[var(--color-text-muted)]">{thumbnail === undefined && project.thumbnail_path ? "Loading thumbnail…" : "Thumbnail unavailable"}</span>}
    </Link>
    <div className="p-4">
      <div className="flex items-start justify-between gap-2">
        <Link to={href} title={title} className="min-w-0 truncate text-sm font-medium hover:underline">{title}</Link>
        <details ref={menu} className="relative shrink-0">
          <summary aria-label={`Project menu for ${title}`} className="cursor-pointer list-none px-2 leading-5">⋮</summary>
          <button className="absolute right-0 z-10 mt-1 w-36 rounded border border-[var(--color-border)] bg-[var(--color-surface2)] p-3 text-left text-sm text-red-400"
            onClick={() => { if (menu.current) menu.current.open = false; setConfirming(true); }}>Delete Project</button>
        </details>
      </div>
      <p className="mt-2 text-xs text-[var(--color-text-muted)]">{project.clip_count ?? 0} {(project.clip_count ?? 0) === 1 ? "clip" : "clips"}</p>
      <time dateTime={project.created_at} className="mt-1 block text-xs text-[var(--color-text-muted)]">{new Date(project.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</time>
    </div>
    {confirming && <dialog ref={dialog} aria-labelledby={`delete-title-${project.id}`} onCancel={(event) => { if (deleting) event.preventDefault(); else setConfirming(false); }}
      className="m-auto max-w-md rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-[var(--color-text)] backdrop:bg-black/60">
      <h2 id={`delete-title-${project.id}`} className="text-lg font-semibold">Delete Project?</h2>
      <p className="mt-3 break-words text-sm">“{title}”, its clips, and its thumbnail will be permanently removed. This cannot be undone.</p>
      {error && <p role="alert" className="mt-4 text-sm text-red-400">{error}</p>}
      <div className="mt-6 flex justify-end gap-3">
        <button ref={cancelButton} disabled={deleting} className="rounded border border-[var(--color-border)] px-4 py-2 text-sm disabled:opacity-50" onClick={() => setConfirming(false)}>Cancel</button>
        <button disabled={deleting} className="rounded bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-50" onClick={() => void remove()}>{deleting ? "Deleting…" : "Delete permanently"}</button>
      </div>
    </dialog>}
  </li>;
}
