import type { CSSProperties } from "react";
import ScenarioMedia from "./ScenarioMedia";
import type { HeroScenario } from "./heroScenarios";

export default function OutputFan({ scenario }: { scenario: HeroScenario }) {
  return (
    <div className="output-fan">
      {scenario.clips.map((clip, index) => {
        const moment = scenario.moments.find(item => item.id === clip.momentId);
        if (!moment) return null;
        return (
          <figure className={`emerging-clip emerging-clip-${index + 1}`} key={clip.id} data-moment={clip.momentId}
            style={{ "--moment-origin": moment.position - .5 } as CSSProperties}>
            <ScenarioMedia media={clip.media} eager />
            <span className="clip-moment-line" aria-hidden="true" />
          </figure>
        );
      })}
    </div>
  );
}
