import { createContext, useContext, useState, type ReactNode } from "react";

import type { PageType, ClipsType } from "../types";

type CliprolContextType = {
  page: PageType;
  setPage: React.Dispatch<React.SetStateAction<PageType>>;

  processing: boolean;
  setProcessing: React.Dispatch<React.SetStateAction<boolean>>;

  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;

  clips: ClipsType;
  setClips: React.Dispatch<React.SetStateAction<ClipsType>>;

  inputMode: "url" | "upload";
  setInputMode: React.Dispatch<React.SetStateAction<"url" | "upload">>;

  videoUrl: string | null;
  setVideoUrl: React.Dispatch<React.SetStateAction<string | null>>;

  videoFile: File | null;
  setVideoFile: React.Dispatch<React.SetStateAction<File | null>>;
};

const CliprolContext = createContext<CliprolContextType | null>(null);

type CliprolProviderProps = {
  children: ReactNode;
};

export const CliprolProvider = ({ children }: CliprolProviderProps) => {
  const [page, setPage] = useState<PageType>("landing");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clips, setClips] = useState<ClipsType>([]);

  const [inputMode, setInputMode] = useState<"url" | "upload">("url");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  // const [isProcessing, setIsProcessing] = useState(false);

  return (
    <CliprolContext.Provider
      value={{
        page,
        setPage,
        processing,
        setProcessing,
        error,
        setError,
        clips,
        setClips,
        inputMode,
        setInputMode,
        videoUrl,
        setVideoUrl,
        videoFile,
        setVideoFile,
      }}
    >
      {children}
    </CliprolContext.Provider>
  );
};

export const useCliprolContext = () => {
  const context = useContext(CliprolContext);

  if (!context) {
    throw new Error("useCliprol must be used inside CliprolProvider");
  }

  return context;
};
