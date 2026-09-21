import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ClipCard from "../components/ClipCard";
import { useCliprolContext } from "../context/CliprolContext";
import { getProjectClips } from "../lib/supabase/clips";
import { supabaseStorage } from "../lib/supabase/supabaseClient";
import type { ClipType } from "../types";

const toPlayableUrl = (value: string) => value.startsWith("http") ? value : supabaseStorage.getPublicUrl(value).data.publicUrl;

const ResultsPage = () => {
  const { projectId } = useParams();
  const { clips, setClips } = useCliprolContext();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!projectId) return;
    let active = true;
    const loadClips = async () => {
      try {
        const projectClips = await getProjectClips(projectId);
        if (!active || projectClips.length === 0) return;
        setClips(projectClips.map((clip): ClipType => ({ video: toPlayableUrl(clip.clip_url), start: clip.start_time, end: clip.end_time, reason: clip.reason ?? "" })));
      } catch (error) {
        console.error("Unable to load project clips", error);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadClips();
    return () => { active = false; };
  }, [projectId, setClips]);

  const displayClips = clips.map((clip) => ({ ...clip, video: toPlayableUrl(clip.video) }));
  return <section className="min-h-screen px-4 py-8 sm:px-6 sm:py-12 lg:py-16"><div className="mx-auto max-w-5xl">
    <header className="text-center"><p className="text-sm text-[var(--color-text-muted)]">Cliprol</p><h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)] sm:text-4xl">Your clips are ready.</h1><p className="mt-4 text-[var(--color-text-muted)]">We found <span className="text-[var(--color-text)] font-medium">{displayClips.length}</span> {displayClips.length === 1 ? "moment worth sharing." : "moments worth sharing."}</p></header>
    {loading ? <p className="mt-12 text-center text-sm text-[var(--color-text-muted)] sm:mt-16">Loading project clips…</p> : displayClips.length === 0 ? <div className="mt-12 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center sm:mt-20 sm:p-12"><h2 className="text-xl font-medium text-[var(--color-text)]">No clips found</h2><p className="mt-3 text-[var(--color-text-muted)]">We couldn't find any moments worth clipping from this video. Try another video or adjust your input.</p><button onClick={() => navigate("/dashboard/new-project")} className="mt-8 w-full rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-[var(--color-bg)] transition-colors duration-150 hover:bg-white sm:w-auto">Process another video</button></div> : <><div className="mt-10 grid gap-5 sm:mt-16 sm:gap-8 md:grid-cols-2">{displayClips.map((clip, index) => <ClipCard key={`${clip.start}-${clip.end}-${index}`} index={index + 1} clip={clip} />)}</div><div className="mt-10 flex justify-center sm:mt-16"><button onClick={() => navigate("/dashboard/new-project")} className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-6 py-3 text-sm font-medium text-[var(--color-text)] transition-colors duration-150 hover:bg-[var(--color-surface2)] sm:w-auto">Process another video</button></div></>}
  </div></section>;
};

export default ResultsPage;
