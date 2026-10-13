export type ScenarioMediaAsset = {
  poster: string;
  description: string;
  width: number;
  height: number;
};
export type DetectedMoment = { id: string; position: number };
export type HeroScenario = {
  id: string;
  label: string;
  source: ScenarioMediaAsset;
  moments: readonly [DetectedMoment, DetectedMoment];
  clips: readonly [
    { id: string; momentId: string; media: ScenarioMediaAsset },
    { id: string; momentId: string; media: ScenarioMediaAsset },
  ];
};

function scenario(id: string, label: string, sourceDescription: string, clipDescriptions: [string, string], sourceWidth = 1672): HeroScenario {
  const path = `/media/landing/${id}`;
  const moments = [{ id: `${id}-moment-1`, position: .34 }, { id: `${id}-moment-2`, position: .7 }] as const;
  const clip = (index: 0 | 1) => ({
    id: `${id}-clip-${index + 1}`,
    momentId: moments[index].id,
    media: { poster: `${path}/clip-${index + 1}.webp`, description: clipDescriptions[index], width: 941, height: 1672 },
  });
  return {
    id, label,
    source: { poster: `${path}/source.webp`, description: sourceDescription, width: sourceWidth, height: 941 },
    // These are illustrative positions, not timestamps or live analysis results.
    moments,
    clips: [clip(0), clip(1)],
  };
}

export const heroScenarios: readonly HeroScenario[] = [
  scenario("gaming", "Gaming", "Original gameplay with the creator visible in an inset", ["Gaming highlight: Double Kill", "Gaming highlight: Triple Kill"], 1671),
  scenario("podcast", "Podcast", "Original podcast conversation with two speakers", ["Podcast moment featuring the speaker in a black shirt", "Podcast moment featuring the speaker in a light hoodie"]),
  scenario("coaching", "Coaching", "Original coaching session with a coach and attendees", ["Coaching moment: From Skills to Income", "Coaching moment: Turn Skills into Income"]),
];
