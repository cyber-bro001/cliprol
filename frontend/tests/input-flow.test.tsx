import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import InputSection from '../src/components/InputSection';
import type { CliprolContextType } from '../src/types';
const { context } = vi.hoisted(() => ({ context: {} as CliprolContextType }));
vi.mock('../src/context/CliprolContext', () => ({ useCliprolContext: () => context }));
function Location() { return <span data-testid="path">{useLocation().pathname}</span>; }
function mount(path = '/', onProcess?: () => Promise<void> | void) {
  return render(<MemoryRouter initialEntries={[path]}><InputSection onProcess={onProcess} /><Location /></MemoryRouter>);
}
beforeEach(() => {
  Object.assign(context, { inputMode: 'url', videoUrl: 'https://youtu.be/example', videoFile: null, processing: false, authLoading: false, session: null, error: null,
    setError: vi.fn(), setInputMode: vi.fn(), setVideoUrl: vi.fn(), setVideoFile: vi.fn(), setProcessing: vi.fn() });
  URL.createObjectURL = vi.fn(() => 'blob:preview');
  URL.revokeObjectURL = vi.fn();
});
describe('shared video input', () => {
  it('validates unsupported URLs before navigation', () => {
    context.videoUrl = 'https://example.com/video'; mount();
    fireEvent.click(screen.getByRole('button', { name: 'Find my clips' }));
    expect(context.setError).toHaveBeenCalledWith('Unsupported video platform.');
    expect(screen.getByTestId('path').textContent).toBe('/');
  });
  it.each([false, true])('routes valid URL with signed-in=%s', signedIn => {
    context.session = signedIn ? { access_token: 'token' } as CliprolContextType['session'] : null;
    mount(); fireEvent.submit(screen.getByRole('form'));
    expect(screen.getByTestId('path').textContent).toBe(signedIn ? '/dashboard/new-project' : '/login');
    expect(sessionStorage.getItem('cliprol.pendingVideoUrl')).toBe(context.videoUrl);
  });
  it('carries upload intent to login and releases preview URLs on unmount', () => {
    context.inputMode = 'upload'; context.videoFile = new File(['video'], 'recording.mp4', { type: 'video/mp4' });
    const view = mount(); fireEvent.submit(screen.getByRole('form'));
    expect(screen.getByTestId('path').textContent).toBe('/login');
    expect(sessionStorage.getItem('cliprol.pendingUpload')).toBe('true');
    view.unmount(); expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview');
  });
  it('honestly requests reselection when upload intent survives but the file does not', () => {
    context.inputMode = 'upload'; sessionStorage.setItem('cliprol.pendingUpload', 'true'); mount('/dashboard/new-project');
    expect(screen.getByRole('status').textContent).toContain('Please select it again');
    fireEvent.submit(screen.getByRole('form'));
    expect(context.setError).toHaveBeenCalledWith('Choose a video from your device to continue.');
    const file = new File(['x'], 'new.mp4', { type: 'video/mp4' });
    fireEvent.change(screen.getByLabelText('Drop a video here, or choose a file'), { target: { files: [file] } });
    expect(context.setVideoFile).toHaveBeenCalledWith(file);
  });
  it('delegates project creation and reports failure without owning persistence', async () => {
    const onProcess = vi.fn().mockRejectedValue(new Error('Project unavailable'));
    mount('/dashboard/new-project', onProcess); fireEvent.submit(screen.getByRole('form'));
    expect(context.setProcessing).toHaveBeenCalledWith(true);
    await waitFor(() => expect(context.setError).toHaveBeenCalledWith('Project unavailable'));
    expect(context.setProcessing).toHaveBeenLastCalledWith(false);
    expect(onProcess).toHaveBeenCalledOnce();
  });
  it('does not submit while session loading or processing', () => {
    context.authLoading = true; mount(); fireEvent.submit(screen.getByRole('form'));
    expect(sessionStorage.length).toBe(0);
    expect(screen.getByTestId('path').textContent).toBe('/');
  });
});

