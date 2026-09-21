export type VideoPlatform = "youtube";

export const platforms: Record<VideoPlatform, { hosts: string[] }> = {
  youtube: {
    hosts: ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"],
  },
};
