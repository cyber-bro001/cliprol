import { ArrowRight, Pause, Play } from "lucide-react";
import type { CSSProperties } from "react";
import ScenarioMedia from "./landing/ScenarioMedia";
import { momentExamples } from "./landing/momentExamples";
import { rotationTransition, useClipRotation } from "./landing/useClipRotation";

export default function WhyCliprol() {
  const { sectionRef, step, paused, setPaused, running, reduced, next } = useClipRotation(momentExamples.length);
  const examples = reduced ? momentExamples : [momentExamples[step.index]];
  const upcoming = momentExamples[(step.index + 1) % momentExamples.length];
  return (
    <section id="whycliprol" ref={sectionRef} className="moment-showcase page-width"
      aria-label="Illustrative clip selection examples" data-running={running} data-reduced={reduced}
      style={{ "--rotation-duration": `${rotationTransition}ms` } as CSSProperties}>
      {examples.map(example => (
        <figure key={example.id} className="moment-example" data-transitioning={!reduced && step.transitioning}>
          <div className="moment-media-stack">
            {!reduced && <div className="moment-next-preview" aria-hidden="true"><ScenarioMedia media={upcoming.media} /></div>}
            <div className="moment-clip"><ScenarioMedia media={example.media} /></div>
          </div>
          <figcaption className="moment-reason">
            <span className="moment-reason-label">Illustrative selection reason</span>
            <p>{example.reason}</p>
          </figcaption>
        </figure>
      ))}
      {!reduced && <div className="moment-controls">
        <div className="moment-progress" aria-label={`Example ${step.index + 1} of ${momentExamples.length}`}>
          {momentExamples.map((example, index) => <span key={example.id} data-active={index === step.index} />)}
        </div>
        <button type="button" className="moment-pause" onClick={() => setPaused(value => !value)}
          aria-label={paused ? "Resume moment showcase" : "Pause moment showcase"}>
          {paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
        </button>
        <button type="button" className="moment-pause" onClick={next} disabled={step.transitioning} aria-label="Next moment">
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>}
    </section>
  );
}
