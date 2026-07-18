import { createContext, useContext, useState, type ReactNode } from "react";
import { PageType, ClipType, type ClipsType } from "../types";

type CliprolContextType = {
  page: PageType;
  setPage: React.Dispatch<React.SetStateAction<PageType>>;

  processing: boolean;
  setProcessing: React.Dispatch<React.SetStateAction<boolean>>;

  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;

  clips: ClipsType;
  setClips: React.Dispatch<React.SetStateAction<ClipType>>;
};

const CliprolContext = createContext<CliprolContextType | null>(null);

type CliprolProviderProps = {
  children: ReactNode;
};

export const CliprolProvider = ({cildren}: CliprolProv)
const [page, setPage] = useState<"landing" | "processing" | "results">(
  "landing",
);

const [processing, setProcessing] = useState(false);
const [error, setError] = useState<string | null>(null);
const [clips, setClips] = useState<string[]>([]);
