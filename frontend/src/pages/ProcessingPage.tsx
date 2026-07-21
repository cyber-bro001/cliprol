import { useEffect, useState } from "react";
import ProcessingState from "../components/ProcessingState";
import { useCliprolContext } from "../context/CliprolContext";

import {API_BASE_URL} from '../lib/constants';

const ProcessingPage = () => {
  const [currentStage, setCurrentStage] = useState<number>(0);
const { videoUrl, videoFile, inputMode, setClips, setPage } = useCliprolContext();

useEffect(() => {
  const processVideo = async () => {
    try {
      let url = "";
      let body: BodyInit;
      let headers: HeadersInit = {};

      if (inputMode === "url") {
        url = `${import.meta.env.VITE_API_BASE_URL}/process-url`;
        body = JSON.stringify({ url: videoUrl });
        headers = { "Content-Type": "application/json" };
      } else {
        url = `${import.meta.env.VITE_API_BASE_URL}/upload-video`;
        const formData = new FormData();
        formData.append("file", videoFile!);
        body = formData;
      }

      const response = await fetch(url, { method: "POST", headers, body });
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return;

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() || "";

        for (const block of blocks) {
          const eventLine = block.split("\n").find(l => l.startsWith("event:"));
          const dataLine = block.split("\n").find(l => l.startsWith("data:"));

          if (!eventLine || !dataLine) continue;

          const event = eventLine.replace("event: ", "").trim();
          const data = JSON.parse(dataLine.replace("data: ", "").trim());

          if (event === "progress") {
            setCurrentStage(prev => prev + 1);
          }

          if (event === "success") {
            setClips(data.clips);
            setPage("results");
          }

          if (event === "error") {
            setPage("landing");
          }
        }
      }

    } catch (error) {
      setPage("landing");
    }
  };

  processVideo();
}, []);

  return (
    <div className="">
      <ProcessingState currentStage={currentStage} />
    </div>
  );
};

export default ProcessingPage;
