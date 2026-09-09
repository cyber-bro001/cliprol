import type { ReactNode } from "react";

export type ClipType = {
  video: string;
  start: number;
  end: number;
  reason: string;
};

export type ClipsType = ClipType[];

export type CliprolProviderProps = {
  children: ReactNode;
};

export type CliprolContextType = {
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

  session: any | null;
  setSession: React.Dispatch<React.SetStateAction<any | null>>;
};

export type userCrediantailsType = {
  email: string;
  password: string;
  name?: string;
};

export type loadingStateType = {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};