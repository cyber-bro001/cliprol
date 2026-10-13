import type { CSSProperties } from "react";
import { Pause, Play } from "lucide-react";
import { heroScenarios } from "./heroScenarios";
import { heroTiming, useHeroSequence } from "./useHeroSequence";
import SourcePreview from "./SourcePreview";
import OutputFan from "./OutputFan";

export default function HeroTransformation() {
  const { stageRef, index, phase, running, reduced, paused, toggle } = useHeroSequence(heroScenarios);
  const scenario = heroScenarios[index];
  return (
    <div id="usecases" ref={stageRef} className="hero-transformation page-width" data-phase={phase}
      data-running={running} data-reduced={reduced} data-scenario={scenario.id} style={heroTiming as CSSProperties}>
      <p className="sr-only">Cliprol finds moments in existing videos and turns them into clips. This visual example shows {scenario.label.toLowerCase()} content becoming two portrait clips and a landscape result.</p>
      <div className="transformation-scene" key={scenario.id}>
        <SourcePreview scenario={scenario} />
        <OutputFan scenario={scenario} />
      </div>
      {!reduced && (
        <button className="motion-control" onClick={toggle} aria-label={paused ? "Resume animation" : "Pause animation"}>
          {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
        </button>
      )}
    </div>
  );
}
