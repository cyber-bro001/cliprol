import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProcessingState from "../components/ProcessingState";
import { useCliprolContext } from "../context/CliprolContext";
import { processVideoFile, processVideoUrl } from "../lib/api";

const ProcessingPage = () => {
  const [currentStage, setCurrentStage] = useState(0);
  const [stages, setStages] = useState<string[]>([]);
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { videoUrl, videoFile, inputMode, setClips, setError, setProcessing, session } = useCliprolContext();

  useEffect(() => {
    if (!projectId) { navigate("/dashboard/new-project", { replace: true }); return; }
    let cancelled = false;

    const processVideo = async () => {
      try {
        const response = inputMode === "url"
          ? await processVideoUrl(videoUrl, projectId, session?.access_token ?? "")
          : videoFile ? await processVideoFile(videoFile) : null;
        if (!response?.ok) throw new Error("Processing failed");
        const reader = response.body?.getReader();
        if (!reader) throw new Error("Processing stream was unavailable");
        const decoder = new TextDecoder();
        let buffer = "";
        while (!cancelled) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const blocks = buffer.split("\n\n");
          buffer = blocks.pop() || "";
          for (const block of blocks) {
            const eventLine = block.split("\n").find((line) => line.startsWith("event:"));
            const dataLine = block.split("\n").find((line) => line.startsWith("data:"));
            if (!eventLine || !dataLine) continue;
            const event = eventLine.replace("event: ", "").trim();
            const data = JSON.parse(dataLine.replace("data: ", "").trim());
            if (event === "progress") { setStages((previous) => [...previous, data.message]); setCurrentStage((previous) => previous + 1); }
            if (event === "success") { setClips(data.clips); setProcessing(false); navigate(`/dashboard/projects/${projectId}`, { replace: true }); return; }
            if (event === "error") throw new Error(data.message);
          }
        }
      } catch (error) {
        if (!cancelled) {
          setProcessing(false);
          setError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
          navigate("/dashboard/new-project", { replace: true });
        }
      }
    };
    processVideo();
    return () => { cancelled = true; };
  }, [inputMode, navigate, projectId, session?.access_token, setClips, setError, setProcessing, videoFile, videoUrl]);

  return <ProcessingState currentStage={currentStage} stages={stages} />;
};

export default ProcessingPage;
