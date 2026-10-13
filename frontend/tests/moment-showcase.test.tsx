import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import WhyCliprol from '../src/components/WhyCliprol';
import { momentExamples } from '../src/components/landing/momentExamples';
import HowItWorks from '../src/components/HowItWorks';
import { rotationTransition } from '../src/components/landing/useClipRotation';

let observer: IntersectionObserverCallback;
let reduced = false;
beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(performance, 'now').mockImplementation(() => Date.now());
  vi.stubGlobal('matchMedia', () => ({ matches: reduced, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: IntersectionObserverCallback) { observer = callback; }
    observe() {} disconnect() {}
  });
});
afterEach(() => { reduced = false; vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
function visibility(visible: boolean) { act(() => observer([{ isIntersecting: visible } as IntersectionObserverEntry], {} as IntersectionObserver)); }
function advance(ms: number) { act(() => vi.advanceTimersByTime(ms)); }

it('shows the first pair immediately and switches image and reason together through the loop', () => {
  render(<WhyCliprol />); visibility(true);
  for (let index = 0; index < 4; index++) {
    const example = momentExamples[index % 3];
    expect(screen.getByRole('img').getAttribute('alt')).toBe(example.media.description);
    expect(screen.getByText(example.reason)).toBeTruthy();
    advance(5000);
    expect(screen.getByText(example.reason)).toBeTruthy();
    advance(rotationTransition);
  }
});
it('preserves remaining time while manually paused or offscreen', () => {
  render(<WhyCliprol />); visibility(true); advance(3000);
  fireEvent.click(screen.getByRole('button', { name: 'Pause moment showcase' }));
  advance(10000); visibility(false); visibility(true);
  expect(screen.getByText(momentExamples[0].reason)).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Resume moment showcase' }));
  advance(1999); expect(screen.getByText(momentExamples[0].reason)).toBeTruthy();
  advance(1); advance(rotationTransition);
  expect(screen.getByText(momentExamples[1].reason)).toBeTruthy();
  visibility(false); advance(20000);
  expect(screen.getByText(momentExamples[1].reason)).toBeTruthy();
});
it('uses the actual upcoming asset and locks rapid next clicks without losing the reason pairing', () => {
  render(<WhyCliprol />); visibility(true);
  const preview = document.querySelector('.moment-next-preview img');
  expect(preview?.getAttribute('src')).toBe(momentExamples[1].media.poster);
  const next = screen.getByRole('button', { name: 'Next moment' });
  fireEvent.click(next); fireEvent.click(next); fireEvent.click(next);
  expect(screen.getByText(momentExamples[0].reason)).toBeTruthy();
  advance(rotationTransition);
  expect(screen.getByRole('img').getAttribute('alt')).toBe(momentExamples[1].media.description);
  expect(screen.getByText(momentExamples[1].reason)).toBeTruthy();
  expect(document.querySelector('.moment-next-preview img')?.getAttribute('src')).toBe(momentExamples[2].media.poster);
});
it('allows a manual next while paused and stays paused afterwards', () => {
  render(<WhyCliprol />); visibility(true);
  fireEvent.click(screen.getByRole('button', { name: 'Pause moment showcase' }));
  fireEvent.click(screen.getByRole('button', { name: 'Next moment' }));
  advance(rotationTransition); advance(10000);
  expect(screen.getByText(momentExamples[1].reason)).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Resume moment showcase' })).toBeTruthy();
});
it('rotates three persistent ready-to-share images and pauses offscreen', () => {
  render(<HowItWorks />); visibility(true);
  const images = [...document.querySelectorAll('.ready-viewer img')];
  expect(new Set(images.map(image => image.getAttribute('src'))).size).toBe(3);
  advance(5000); advance(rotationTransition);
  expect(document.querySelector('.ready-viewer[data-position="0"] img')?.getAttribute('src')).toBe(momentExamples[1].media.poster);
  images.forEach(image => expect(image.isConnected).toBe(true));
  visibility(false); advance(20000);
  expect(document.querySelector('.ready-viewer[data-position="0"] img')?.getAttribute('src')).toBe(momentExamples[1].media.poster);
});
it('shows every paired example statically for reduced motion', () => {
  reduced = true; render(<WhyCliprol />); visibility(true); advance(30000);
  expect(screen.getAllByRole('img')).toHaveLength(3);
  momentExamples.forEach(example => expect(screen.getByText(example.reason)).toBeTruthy());
  expect(screen.queryByRole('button')).toBeNull();
});
it('preserves an in-flight transition while paused and ignores next clicks until it finishes', () => {
  render(<WhyCliprol />); visibility(true); advance(5000); advance(200);
  fireEvent.click(screen.getByRole('button', { name: 'Pause moment showcase' }));
  advance(10000);
  fireEvent.click(screen.getByRole('button', { name: 'Next moment' }));
  expect(screen.getByText(momentExamples[0].reason)).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Resume moment showcase' }));
  advance(399); expect(screen.getByText(momentExamples[0].reason)).toBeTruthy();
  advance(1); expect(screen.getByText(momentExamples[1].reason)).toBeTruthy();
});
it('freezes ready-to-share rotation in a hidden tab and shows a static reduced-motion composition', () => {
  const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
  const view = render(<HowItWorks />); visibility(true); advance(3000);
  hidden.mockReturnValue(true); fireEvent(document, new Event('visibilitychange')); advance(10000);
  expect(document.querySelector('.ready-viewer[data-position="0"] img')?.getAttribute('src')).toBe(momentExamples[0].media.poster);
  hidden.mockReturnValue(false); fireEvent(document, new Event('visibilitychange'));
  advance(2000); advance(rotationTransition);
  expect(document.querySelector('.ready-viewer[data-position="0"] img')?.getAttribute('src')).toBe(momentExamples[1].media.poster);
  view.unmount(); reduced = true; render(<HowItWorks />); visibility(true); advance(20000);
  expect(screen.getAllByRole('img')).toHaveLength(3);
  expect(screen.queryByRole('button')).toBeNull();
  expect(document.querySelector('.ready-viewer[data-position="0"] img')?.getAttribute('src')).toBe(momentExamples[0].media.poster);
});
