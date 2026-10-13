import { useEffect } from "react";

export function useSectionEntrances() {
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("#main > section:not(.hero)");
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const section = entry.target as HTMLElement;
        section.dataset.entranceRunning = String(entry.isIntersecting && !document.hidden);
        if (entry.isIntersecting) section.dataset.entered = "true";
      }
    }, { threshold: .08 });
    sections.forEach(section => observer.observe(section));
    const visibility = () => {
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        section.dataset.entranceRunning = String(!document.hidden && rect.bottom > 0 && rect.top < window.innerHeight);
      });
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      sections.forEach(section => { delete section.dataset.entered; delete section.dataset.entranceRunning; });
    };
  }, []);
}
