import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ScenarioMedia from '../src/components/landing/ScenarioMedia';

const media = { poster: '/supplied-source.webp', description: 'Podcast source', width: 1672, height: 941 };
describe('scenario media', () => {
  it('reserves image dimensions and never introduces fake playback controls', () => {
    const view = render(<ScenarioMedia media={media} />);
    const image = screen.getByRole('img');
    expect(image.getAttribute('width')).toBe('1672');
    expect(image.getAttribute('height')).toBe('941');
    expect(image.getAttribute('loading')).toBe('lazy');
    expect(view.container.querySelector('video')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });
  it('provides a truthful accessible fallback when the image fails', () => {
    render(<ScenarioMedia media={media} eager />);
    expect(screen.getByRole('img').getAttribute('loading')).toBe('eager');
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByRole('img').getAttribute('aria-label')).toContain('Preview unavailable');
  });
});
