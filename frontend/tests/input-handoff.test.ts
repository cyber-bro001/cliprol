import { describe, it, expect } from 'vitest';
import { loginDestination } from '../src/lib/authHelpers/destination';
import { rememberInput, hasPendingUpload, clearPendingInput } from '../src/lib/authHelpers/pendingInput';
describe('input authentication handoff', () => {
  it('restores upload intent without persisting a local file', () => {
    rememberInput('url', 'https://youtu.be/example');
    rememberInput('upload', '');
    expect(hasPendingUpload()).toBe(true);
    expect(sessionStorage.getItem('cliprol.pendingVideoUrl')).toBeNull();
    expect(sessionStorage.length).toBe(1);
    expect(loginDestination(null, null, hasPendingUpload())).toBe('/dashboard/new-project');
  });
  it('replaces upload intent with URL intent and clears both after project creation', () => {
    rememberInput('upload', '');
    rememberInput('url', 'https://youtu.be/example');
    expect(hasPendingUpload()).toBe(false);
    expect(loginDestination(null, sessionStorage.getItem('cliprol.pendingVideoUrl'))).toBe('/dashboard/new-project');
    clearPendingInput();
    expect(sessionStorage.length).toBe(0);
  });
  it.each(['https://evil.example', '/dashboard/process/abc', '//evil.example', '/dashboard/%2fexample'])('does not resume unsafe or processing destination %s', from => {
    expect(loginDestination({ from }, null)).toBe('/dashboard/projects');
  });
  it('preserves allowed dashboard return destinations', () => {
    expect(loginDestination({ from: '/dashboard/settings' }, null)).toBe('/dashboard/settings');
  });
});
