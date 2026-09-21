import { createContext, useContext, useState, useEffect } from "react";
import type { CliprolContextType } from "../types";
import type { CliprolProviderProps } from "../types";
import {
  signUpWithEmail,
  signInWithEmail,
  signOut,
} from "../lib/supabase/auth";
import { supabase } from "../lib/supabase/supabaseClient";

const CliprolContext = createContext<CliprolContextType | null>(null);

export const CliprolProvider = ({ children }: CliprolProviderProps) => {
  const [processing, setProcessing] =
    useState<CliprolContextType["processing"]>(false);
  const [error, setError] = useState<CliprolContextType["error"]>(null);
  const [clips, setClips] = useState<CliprolContextType["clips"]>([]);

  const [inputMode, setInputMode] =
    useState<CliprolContextType["inputMode"]>("url");
  const [videoUrl, setVideoUrl] = useState<CliprolContextType["videoUrl"]>(
    () => sessionStorage.getItem("cliprol.pendingVideoUrl") ?? "",
  );
  const [videoFile, setVideoFile] =
    useState<CliprolContextType["videoFile"]>(null);

  //Auth states
  const [session, setSession] = useState<CliprolContextType["session"]>(null);

  useEffect(() => {
    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
        signOut,
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
