import { focusVideoInput } from "./landing/landingNavigation";

export default function FinalCTA() {
  return (
    <section className="final-cta" aria-labelledby="final-cta-heading">
      <div className="page-width">
        <h2 id="final-cta-heading">Your next clips are already in your video.</h2>
        <a href="#video-input" className="button-primary" onClick={focusVideoInput}>Get Clips</a>
      </div>
    </section>
  );
}
