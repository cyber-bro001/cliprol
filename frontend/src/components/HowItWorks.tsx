import { Pause, Play } from "lucide-react";
import type { CSSProperties } from "react";
import ScenarioMedia from "./landing/ScenarioMedia";
import { momentExamples } from "./landing/momentExamples";
import { rotationTransition, useClipRotation } from "./landing/useClipRotation";

export default function HowItWorks() {
  const { sectionRef, step, paused, setPaused, running, reduced } = useClipRotation(momentExamples.length);
  return (
    <section ref={sectionRef} id="ready-to-share" className="ready-section page-width" aria-labelledby="ready-heading">
      <h2 id="ready-heading">Your content, ready to share.</h2>
      <div className="ready-stage" data-running={running} data-reduced={reduced} data-transitioning={step.transitioning}
        style={{ "--rotation-duration": `${rotationTransition}ms` } as CSSProperties}>
        {momentExamples.map((example, index) => {
          const position = (index - step.index + momentExamples.length) % momentExamples.length;
          return <figure key={example.id} className="ready-viewer" data-position={position}
            aria-label={`${example.media.description}. ${position === 0 ? "Center clip" : "Side clip"}`}>
            <div className="ready-phone-chrome" aria-hidden="true"><span /></div>
            <div className="ready-clip"><ScenarioMedia media={example.media} /></div>
            <div className="ready-phone-base" aria-hidden="true"><span /></div>
          </figure>;
        })}
      </div>
      {!reduced && <button type="button" className="moment-pause ready-pause" onClick={() => setPaused(value => !value)}
        aria-label={paused ? "Resume ready-to-share rotation" : "Pause ready-to-share rotation"}>
        {paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
      </button>}
    </section>
  );
}
