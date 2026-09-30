import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCliprolContext } from "../../context/CliprolContext";
import { getUserProjects } from "../../lib/supabase/project";
import { deleteProject, getThumbnailAccess, type ThumbnailAccess } from "../../lib/api";
import ProjectCard from "../../components/ProjectCard";
import type { Project } from "../../types";

const actionClass = "rounded-[var(--radius-sm)] border border-[var(--color-border)] px-4 py-2 text-sm hover:bg-[var(--color-surface2)]";
type History = { key: string; projects: Project[]; failed: boolean; thumbnails: Record<string, ThumbnailAccess | null>; thumbnailsLoaded: boolean };

const DashboardProjects = () => {
  const { session } = useCliprolContext();
  const userId = session?.user.id;
  const token = session?.access_token;
  const [refresh, setRefresh] = useState(0);
  const key = `${userId}:${token}:${refresh}`;
  const [result, setResult] = useState<History | null>(null);
  const [deletions, setDeletions] = useState<{ key: string; ids: string[] } | null>(null);

  useEffect(() => {
    if (!userId || !token) return;
    const controller = new AbortController();
    async function load() {
      try {
        const projects = await getUserProjects(userId!, controller.signal);
        if (controller.signal.aborted) return;
        setResult({ key, projects, failed: false, thumbnails: {}, thumbnailsLoaded: false });
        let thumbnails = {};
        try { thumbnails = await getThumbnailAccess(projects.filter((p) => p.thumbnail_path).map((p) => p.id), token!, controller.signal); }
        catch { /* Images may be unavailable without making the library unusable. */ }
        if (!controller.signal.aborted) setResult((previous) => previous?.key === key ? { ...previous, thumbnails, thumbnailsLoaded: true } : previous);
      } catch {
        if (!controller.signal.aborted) setResult({ key, projects: [], failed: true, thumbnails: {}, thumbnailsLoaded: true });
      }
    }
    void load();
    return () => controller.abort();
  }, [userId, token, key]);

  const current = result?.key === key ? result : null;
  const deleting = deletions?.key === key && deletions.ids.length > 0;
  const remove = async (id: string) => {
    if (!token) throw new Error("Sign in to delete this project.");
    setDeletions((previous) => ({ key, ids: [...(previous?.key === key ? previous.ids : []), id] }));
    try {
      await deleteProject(id, token);
      setResult((previous) => previous?.key === key ? { ...previous, projects: previous.projects.filter((p) => p.id !== id) } : previous);
    } finally {
      setDeletions((previous) => previous?.key === key ? { ...previous, ids: previous.ids.filter((value) => value !== id) } : previous);
    }
  };

  return <div className="mx-auto max-w-5xl px-4 sm:px-0">
    <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div><h1 className="mb-1 text-2xl font-semibold tracking-tight">Projects</h1><p className="text-sm text-[var(--color-text-muted)]">Your completed video projects.</p></div>
      <div className="flex gap-3">
        <button className={actionClass} disabled={!current || deleting} onClick={() => setRefresh((value) => value + 1)}>Refresh</button>
        <Link className={actionClass} to="/dashboard/new-project">New Project</Link>
      </div>
    </header>
    {!current ? <p role="status">Loading projects…</p> : current.failed ? (
      <div role="alert" className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-6">
        <p>Unable to load your project history.</p>
        <button className={`${actionClass} mt-4`} onClick={() => setRefresh((value) => value + 1)}>Try again</button>
      </div>
    ) : current.projects.length === 0 ? (
      <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] p-8 text-center sm:p-16">
        <h2 className="font-medium">No completed projects yet</h2>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">Create a new project to process your first video.</p>
      </div>
    ) : <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {current.projects.map((project) => <ProjectCard key={`${key}:${project.id}`} project={project}
        thumbnail={current.thumbnails[project.id] ?? (current.thumbnailsLoaded ? null : undefined)} onDelete={() => remove(project.id)} />)}
    </ul>}
  </div>;
};

export default DashboardProjects;
