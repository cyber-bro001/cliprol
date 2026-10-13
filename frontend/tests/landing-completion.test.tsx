import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { MemoryRouter, useLocation } from 'react-router-dom';
import type { CliprolContextType } from '../src/types';
import FinalCTA from '../src/components/FinalCTA';
import InputSection from '../src/components/InputSection';
import FAQ from '../src/components/FAQ';
import Footer from '../src/components/Footer';
import { landingLinks } from '../src/components/landing/landingNavigation';

const { context } = vi.hoisted(() => ({ context: {} as CliprolContextType }));
vi.mock('../src/context/CliprolContext', () => ({ useCliprolContext: () => context }));
function Location() { return <span data-testid="path">{useLocation().pathname}</span>; }
beforeEach(() => {
  Object.assign(context, { inputMode: 'url', videoUrl: 'https://youtu.be/example', videoFile: null,
    session: null, authLoading: false, processing: false, error: null, setError: vi.fn(),
    setVideoUrl: vi.fn(), setInputMode: vi.fn(), setVideoFile: vi.fn(), setProcessing: vi.fn() });
  Element.prototype.scrollIntoView = vi.fn();
});

it.each([false, true])('Get Clips focuses the shared input and keeps signed-in=%s routing', signedIn => {
  context.session = signedIn ? { access_token: 'token' } as CliprolContextType['session'] : null;
  render(<MemoryRouter><InputSection /><FinalCTA /><Location /></MemoryRouter>);
  fireEvent.click(screen.getByRole('link', { name: 'Get Clips' }));
  expect(document.activeElement).toBe(screen.getByLabelText('YouTube video URL'));
  expect(screen.getByTestId('path').textContent).toBe('/');
  fireEvent.submit(screen.getByRole('form'));
  expect(screen.getByTestId('path').textContent).toBe(signedIn ? '/dashboard/new-project' : '/login');
  expect(sessionStorage.getItem('cliprol.pendingVideoUrl')).toBe(context.videoUrl);
});
it('keeps FAQ disclosure state and answer associations accessible', () => {
  render(<FAQ />);
  const first = screen.getByRole('button', { name: 'Do I need an account?' });
  expect(first.getAttribute('aria-expanded')).toBe('true');
  const upload = screen.getByRole('button', { name: 'Can I upload my own videos?' });
  fireEvent.click(upload);
  expect(first.getAttribute('aria-expanded')).toBe('false');
  expect(upload.getAttribute('aria-expanded')).toBe('true');
  expect(document.getElementById(upload.getAttribute('aria-controls')!)?.hidden).toBe(false);
  fireEvent.click(upload);
  expect(upload.getAttribute('aria-expanded')).toBe('false');
});
it('footer shares current anchors and preserves cross-route destinations', () => {
  render(<MemoryRouter initialEntries={['/login']}><Footer /></MemoryRouter>);
  landingLinks.forEach(link => expect(screen.getByRole('link', { name: link.label }).getAttribute('href')).toBe(`/${link.href}`));
  expect(screen.queryByRole('link', { name: 'How it works' })).toBeNull();
});
