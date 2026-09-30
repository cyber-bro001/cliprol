import InputSection from "../../components/InputSection";
import { useNavigate } from "react-router-dom";
import { useCliprolContext } from "../../context/CliprolContext";
import { validateVideoUrl } from "../../lib/platforms";
import { createProject } from "../../lib/supabase/project";

const NewProject = () => {
  const navigate = useNavigate();
  const { inputMode, videoUrl, videoFile, setError } = useCliprolContext();

  const createAndProcessProject = async () => {
    if (inputMode === "url") {
      const result = validateVideoUrl(videoUrl);
      if (!result.valid) throw new Error(result.reason);
    } else if (!videoFile) {
      throw new Error("Please upload a video.");
    }
    setError(null);
    const project = await createProject({ title: inputMode === "url" ? "Untitled project" : videoFile?.name || "Untitled project", inputType: inputMode, inputUrl: inputMode === "url" ? videoUrl : undefined });
    sessionStorage.removeItem("cliprol.pendingVideoUrl");
    navigate(`/dashboard/process/${project.id}`);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-0">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text)] sm:text-3xl">
          New project
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] font-light">
          Paste a YouTube link or upload a video to find your best moments.
        </p>
      </div>
      <InputSection onProcess={createAndProcessProject} />
    </div>
  );
};

export default NewProject;
