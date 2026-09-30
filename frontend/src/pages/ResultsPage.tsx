import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ClipCard from "../components/ClipCard";
import { useCliprolContext } from "../context/CliprolContext";
import { getAccessibleClips } from "../lib/api";
import { getProject } from "../lib/supabase/project";
import type { AccessibleClip, Project } from "../types";

type Result = { key: string; project: Project | null; clips: AccessibleClip[]; error: string | null };
const actionClass = "rounded-[var(--radius-sm)] border border-[var(--color-border)] px-4 py-2 text-sm hover:bg-[var(--color-surface2)]";

const ResultsPage = () => {
  const { projectId } = useParams();
  const { session } = useCliprolContext();
  const userId = session?.user.id;
  const accessToken = session?.access_token;
  const [refresh, setRefresh] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const requestKey = `${userId}:${projectId}:${accessToken}:${refresh}`;

  useEffect(() => {
    if (!projectId || !userId || !accessToken) return;
    const controller = new AbortController();
    async function load() {
      let project: Project | null = null;
      try {
        project = await getProject(projectId!, userId!, controller.signal);
        if (controller.signal.aborted) return;
        const clips = project?.status === "done"
          ? await getAccessibleClips(project.id, accessToken!, controller.signal)
          : [];
        if (!controller.signal.aborted) setResult({ key: requestKey, project, clips, error: null });
      } catch {
        if (!controller.signal.aborted) setResult({
          key: requestKey, project, clips: [],
          error: project ? "Unable to load private clips. Please try again." : "Unable to load this project. Please try again.",
        });
      }
    }
    void load();
    return () => controller.abort();
  }, [projectId, userId, accessToken, requestKey]);

  const current = result?.key === requestKey ? result : null;
  const project = current?.project;
  const loading = !current && !!projectId;
  let heading = "Loading project…";
  let message = "Retrieving your saved project and clips.";
  if (current?.error) {
    heading = "Unable to load results";
    message = current.error;
  } else if (!loading && !project) {
    heading = "Project not found or unavailable";
    message = "This project may not exist or may not belong to your account.";
  } else if (project?.status === "processing") {
    heading = "Processing";
    message = "Completion has not been confirmed. Refresh status to check for updates. This does not restart processing.";
  } else if (project?.status === "error") {
    heading = "Failed";
    message = "Processing did not complete successfully. You can start a new project.";
  } else if (project?.status === "done") {
    heading = current!.clips.length ? "Your clips are ready." : "No saved clips";
    message = current!.clips.length
      ? `Processing completed. ${current!.clips.length} saved ${current!.clips.length === 1 ? "clip" : "clips"}.`
      : "Processing is marked completed, but no saved clips are available for this project.";
  } else if (project) {
    heading = "Status unavailable";
    message = "This project's completion could not be confirmed.";
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link to="/dashboard/projects" className="text-sm underline">Back to projects</Link>
      <header className="mt-8 text-center">
        {project && <p title={project.title} className="truncate text-sm text-[var(--color-text-muted)]">{project.title || "Untitled project"}</p>}
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{heading}</h1>
        <p role={current?.error ? "alert" : loading ? "status" : undefined} className="mt-4 text-[var(--color-text-muted)]">{message}</p>
      </header>
      {!current?.error && project?.status === "done" && (
        <div className="mt-10 grid gap-5 sm:gap-8 md:grid-cols-2">
          {current!.clips.map((clip, index) => <ClipCard key={clip.id} index={index + 1} clip={clip} />)}
        </div>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {!loading && (current?.error || project?.status === "processing") && (
          <button className={actionClass} onClick={() => setRefresh((value) => value + 1)}>{current?.error ? "Try again" : "Refresh status"}</button>
        )}
        <Link className={actionClass} to="/dashboard/new-project">New Project</Link>
      </div>
    </section>
  );
};

export default ResultsPage;
