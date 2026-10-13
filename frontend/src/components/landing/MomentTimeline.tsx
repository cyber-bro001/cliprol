import type { CSSProperties } from "react";
import type { HeroScenario } from "./heroScenarios";

export default function MomentTimeline({ scenario }: { scenario: HeroScenario }) {
  return (
    <div className="moment-timeline" aria-hidden="true">
      <div className="timeline-track" />
      <span className="timeline-scan" />
      {scenario.moments.map((moment, index) => (
        <span key={moment.id} className={`detected-moment detected-moment-${index + 1}`} data-moment={moment.id}
          style={{ "--moment-position": `${moment.position * 100}%` } as CSSProperties} />
      ))}
    </div>
  );
}
