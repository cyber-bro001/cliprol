import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import HeroTransformation from '../src/components/landing/HeroTransformation';
import { heroScenarios } from '../src/components/landing/heroScenarios';
import { phaseDurations } from '../src/components/landing/useHeroSequence';

let intersect: (entries: { isIntersecting: boolean }[]) => void;
let reduced = false;
let requested: string[];
let disconnect: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.useFakeTimers();
  reduced = false;
  requested = [];
  vi.spyOn(performance, 'now').mockImplementation(() => Date.now());
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: reduced, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  vi.stubGlobal('Image', class {
    onload?: () => void;
    onerror?: () => void;
    set src(url: string) { requested.push(url); void Promise.resolve().then(() => this.onload?.()); }
    decode() { return Promise.resolve(); }
  });
  disconnect = vi.fn();
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: typeof intersect) { intersect = callback; }
    observe() {}
    disconnect = disconnect;
  });
});
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

async function mount() {
  const view = render(<HeroTransformation />);
  await act(async () => { intersect([{ isIntersecting: true }]); });
  return { ...view, stage: view.container.querySelector('.hero-transformation')! };
}
const advance = async (duration: number) => { await act(async () => { vi.advanceTimersByTime(duration); }); };

describe('hero transformation', () => {
  it('reaches the completed result in 2.4 seconds while keeping the same source element', async () => {
    const { stage } = await mount();
    const source = stage.querySelector('.source-media img');
    await advance(300);
    expect(stage.getAttribute('data-phase')).toBe('detect');
    await advance(700);
    expect(stage.getAttribute('data-phase')).toBe('emerge');
    await advance(1400);
    expect(stage.getAttribute('data-phase')).toBe('hold');
    expect(stage.querySelector('.source-media img')).toBe(source);
    expect(stage.querySelectorAll('.source-preview')).toHaveLength(1);
    expect(stage.querySelectorAll('.emerging-clip')).toHaveLength(2);
  });

  it('automatically cycles Gaming to Podcast to Coaching and back', async () => {
    const { stage } = await mount();
    for (const expected of ['podcast', 'coaching', 'gaming']) {
      for (const duration of phaseDurations) await advance(duration);
      expect(stage.getAttribute('data-scenario')).toBe(expected);
      expect(stage.getAttribute('data-phase')).toBe('enter');
    }
  });

  it('pauses and resumes the remaining time instead of restarting a phase', async () => {
    const { stage } = await mount();
    await advance(100);
    fireEvent.click(screen.getByRole('button', { name: 'Pause animation' }));
    await advance(10000);
    expect(stage.getAttribute('data-phase')).toBe('enter');
    fireEvent.click(screen.getByRole('button', { name: 'Resume animation' }));
    await advance(199);
    expect(stage.getAttribute('data-phase')).toBe('enter');
    await advance(1);
    expect(stage.getAttribute('data-phase')).toBe('detect');
  });

  it('preserves manual pause when the stage leaves and reenters the viewport', async () => {
    const { stage } = await mount();
    fireEvent.click(screen.getByRole('button', { name: 'Pause animation' }));
    act(() => intersect([{ isIntersecting: false }]));
    await advance(20000);
    act(() => intersect([{ isIntersecting: true }]));
    expect(stage.getAttribute('data-running')).toBe('false');
    expect(stage.getAttribute('data-phase')).toBe('enter');
  });

  it('pauses in a hidden tab and cleans up timers and observation', async () => {
    const { stage, unmount } = await mount();
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    await advance(20000);
    expect(stage.getAttribute('data-running')).toBe('false');
    expect(stage.getAttribute('data-phase')).toBe('enter');
    unmount();
    expect(disconnect).toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('shows a static full result for reduced motion without scenario controls or a note', async () => {
    reduced = true;
    const { stage } = await mount();
    await advance(20000);
    expect(stage.getAttribute('data-phase')).toBe('hold');
    expect(stage.getAttribute('data-scenario')).toBe('gaming');
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.queryByText(/illustrative example|format adaptation/i)).toBeNull();
    expect(stage.querySelectorAll('img')).toHaveLength(3);
  });

  it('loads only the first scenario, then prepares the next during the result hold', async () => {
    await mount();
    expect(requested).toHaveLength(3);
    expect(requested.every(url => url.includes('/gaming/'))).toBe(true);
    for (const duration of phaseDurations.slice(0, 3)) await advance(duration);
    expect(requested).toHaveLength(6);
    expect(requested.slice(3).every(url => url.includes('/podcast/'))).toBe(true);
    expect(requested.some(url => url.includes('/coaching/'))).toBe(false);
  });

  it('links the two portrait clips to the two detection markers without a duplicate landscape', async () => {
    const { stage } = await mount();
    for (const clip of heroScenarios[0].clips) {
      expect(stage.querySelectorAll(`[data-moment="${clip.momentId}"]`)).toHaveLength(2);
    }
    expect(heroScenarios.map(scenario => scenario.id)).toEqual(['gaming', 'podcast', 'coaching']);
    expect(stage.querySelectorAll('img')).toHaveLength(3);
  });
});
