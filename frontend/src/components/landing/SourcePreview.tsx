import ScenarioMedia from "./ScenarioMedia";
import MomentTimeline from "./MomentTimeline";
import type { HeroScenario } from "./heroScenarios";

export default function SourcePreview({ scenario }: { scenario: HeroScenario }) {
  return (
    <figure className="source-preview" data-source={scenario.id}>
      <div className="source-media"><ScenarioMedia media={scenario.source} eager /></div>
      <MomentTimeline scenario={scenario} />
    </figure>
  );
}
