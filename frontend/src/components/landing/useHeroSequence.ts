import { useEffect, useRef, useState } from "react";
import type { HeroScenario } from "./heroScenarios";

export const phases = ["enter", "detect", "emerge", "hold", "exit"] as const;
export const phaseDurations = [300, 700, 1400, 3000, 700] as const;
export const heroTiming = {
  "--enter-duration": `${phaseDurations[0]}ms`,
  "--detect-start": `${phaseDurations[0]}ms`,
  "--detect-duration": `${phaseDurations[1]}ms`,
  "--emerge-start": `${phaseDurations[0] + phaseDurations[1]}ms`,
  "--emerge-duration": `${phaseDurations[2]}ms`,
  "--second-clip-start": `${phaseDurations[0] + phaseDurations[1] + 200}ms`,
  "--exit-start": `${phaseDurations.slice(0, 4).reduce((sum, duration) => sum + duration, 0)}ms`,
  "--exit-duration": `${phaseDurations[4]}ms`,
};

export function useHeroSequence(scenarios: readonly HeroScenario[]) {
  const stageRef = useRef<HTMLDivElement>(null);
  const remaining = useRef<number>(phaseDurations[0]);
  const mediaCache = useRef(new Map<string, Promise<void>>());
  const [scene, setScene] = useState({ index: 0, phase: 0 });
  const [readyIndex, setReadyIndex] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => setReduced(motion.matches);
    const onVisibility = () => setPageVisible(!document.hidden);
    motion.addEventListener("change", onMotion);
    document.addEventListener("visibilitychange", onVisibility);
    const observer = new IntersectionObserver(entries => setVisible(entries[0]?.isIntersecting ?? false), { threshold: .15 });
    if (stageRef.current) observer.observe(stageRef.current);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", onMotion);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    const scenario = scenarios[scene.index];
    let active = true;
    const prepare = (url: string) => {
      let pending = mediaCache.current.get(url);
      if (!pending) {
        pending = new Promise<void>(resolve => {
          const image = new Image();
          image.onload = () => { void image.decode().catch(() => {}).then(resolve); };
          image.onerror = () => resolve();
          image.src = url;
        });
        mediaCache.current.set(url, pending);
      }
      return pending;
    };
    const urls = (item: HeroScenario) => [item.source.poster, ...item.clips.map(clip => clip.media.poster)];
    void Promise.all(urls(scenario).map(prepare)).then(() => { if (active) setReadyIndex(scene.index); });
    // Prepare only the next scene after the current result is visible.
    if (phases[scene.phase] === "hold" && visible && pageVisible && !reduced) {
      void Promise.all(urls(scenarios[(scene.index + 1) % scenarios.length]).map(prepare));
    }
    return () => { active = false; };
  }, [scenarios, scene.index, scene.phase, visible, pageVisible, reduced]);

  const running = readyIndex === scene.index && visible && pageVisible && !paused && !reduced;
  useEffect(() => {
    if (!running) return;
    const started = performance.now();
    let advanced = false;
    const timer = window.setTimeout(() => {
      advanced = true;
      const nextPhase = (scene.phase + 1) % phases.length;
      remaining.current = phaseDurations[nextPhase];
      setScene(current => ({ index: nextPhase === 0 ? (current.index + 1) % scenarios.length : current.index, phase: nextPhase }));
    }, remaining.current);
    return () => {
      window.clearTimeout(timer);
      // Keep the timer aligned with paused CSS animations rather than restarting a phase.
      if (!advanced) remaining.current = Math.max(0, remaining.current - (performance.now() - started));
    };
  }, [running, scene, scenarios.length]);

  return { stageRef, index: scene.index, phase: reduced ? "hold" : phases[scene.phase], running, reduced, paused,
    toggle: () => setPaused(value => !value) };
}
