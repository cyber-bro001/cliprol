import { useState } from "react";
import type { ScenarioMediaAsset } from "./heroScenarios";

export default function ScenarioMedia({ media, eager = false }: { media: ScenarioMediaAsset; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className="media-fallback" role="img" aria-label={`${media.description}. Preview unavailable.`}>Preview unavailable</div>;
  return (
    <img src={media.poster} alt={media.description} width={media.width} height={media.height}
      loading={eager ? "eager" : "lazy"} decoding="async" fetchPriority={eager ? "high" : "auto"}
      onError={() => setFailed(true)} />
  );
}
