import { useEffect, useRef, useState } from "react";

export const rotationHold = 5000;
export const rotationTransition = 600;

// One phase timer owns both media and text. A synchronous lock absorbs rapid clicks.
export function useClipRotation(count: number) {
  const sectionRef = useRef<HTMLElement>(null);
  const remaining = useRef(rotationHold);
  const version = useRef(0);
  const locked = useRef(false);
  const [step, setStep] = useState({ index: 0, transitioning: false, manual: false });
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const running = visible && pageVisible && !reduced && (!paused || step.manual);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => setReduced(motion.matches);
    const onVisibility = () => setPageVisible(!document.hidden);
    const observer = new IntersectionObserver(entries => setVisible(entries[0]?.isIntersecting ?? false), { threshold: .15 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    motion.addEventListener("change", onMotion);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", onMotion);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    if (!running) return;
    const started = performance.now();
    const currentVersion = version.current;
    const timer = window.setTimeout(() => {
      version.current++;
      locked.current = !step.transitioning;
      remaining.current = step.transitioning ? rotationHold : rotationTransition;
      setStep(current => current.transitioning
        ? { index: (current.index + 1) % count, transitioning: false, manual: false }
        : { ...current, transitioning: true });
    }, remaining.current);
    return () => {
      window.clearTimeout(timer);
      // Read the live generation: manual Next may already have replaced this timer.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (version.current === currentVersion) remaining.current = Math.max(0, remaining.current - (performance.now() - started));
    };
  }, [count, running, step]);

  const next = () => {
    if (locked.current) return;
    locked.current = true;
    version.current++;
    remaining.current = rotationTransition;
    setStep(current => ({ ...current, transitioning: true, manual: true }));
  };
  return { sectionRef, step, paused, setPaused, running, reduced, next };
}
