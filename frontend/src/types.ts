export type PageType = "landing" | "processing" | "results";

export type ClipType = {
  video: string;
  start: number;
  end: number;
  reason: string;
};

export type ClipsType = ClipType[];
