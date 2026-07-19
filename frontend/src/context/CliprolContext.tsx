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
