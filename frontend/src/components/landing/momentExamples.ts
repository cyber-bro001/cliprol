import type { ScenarioMediaAsset } from "./heroScenarios";

export const momentExamples: readonly { id: string; media: ScenarioMediaAsset; reason: string }[] = [
  {
    id: "gaming",
    media: { poster: "/media/landing/gaming/clip-1.webp", description: "Call of Duty: Mobile Double Kill highlight with a creator inset", width: 941, height: 1672 },
    reason: "A Double Kill delivers a clear payoff in the middle of the action.",
  },
  {
    id: "podcast",
    media: { poster: "/media/landing/showcase/lady-podcast.webp", description: "Female podcaster speaking into a microphone with an expressive hand gesture", width: 941, height: 1672 },
    reason: "An expressive gesture draws attention to the speaker’s point.",
  },
  {
    id: "reaction",
    media: { poster: "/media/landing/showcase/guy-react.webp", description: "Male podcast speaker reacting with widened eyes and an open hand", width: 941, height: 1672 },
    reason: "A wide-eyed reaction creates a compelling beat in the conversation.",
  },
];
