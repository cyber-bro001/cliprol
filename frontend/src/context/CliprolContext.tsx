import { createContext, useContext, useState } from "react";
import type {CliprolContextType } from "../types";
import type {CliprolProviderProps } from "../types";
import {signUpWithEmail, signInWithEmail, signOut} from "../lib/supabase/auth";


const CliprolContext = createContext<CliprolContextType | null>(null);

export const CliprolProvider = ({ children }: CliprolProviderProps) => {
  const [processing, setProcessing] = useState<CliprolContextType["processing"]>(false);
  const [error, setError] = useState<CliprolContextType["error"]>(null);
  const [clips, setClips] = useState<CliprolContextType["clips"]>([]);

  const [inputMode, setInputMode] = useState<CliprolContextType["inputMode"]>("url");
  const [videoUrl, setVideoUrl] = useState<CliprolContextType["videoUrl"]>(null);
  const [videoFile, setVideoFile] = useState<CliprolContextType["videoFile"]>(null);

  //Auth states
  const [session, setSession] = useState<CliprolContextType["session"]>(null);

  return (
    <CliprolContext.Provider
      value={{
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
        session,
        setSession,
        signUpWithEmail,
        signInWithEmail,
        signOut
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
