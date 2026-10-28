import { AI_LAYER_STORAGE_KEY, resolveInitialAiLayer } from './aiLayer';

describe('resolveInitialAiLayer', () => {
  it('defaults to on', () => {
    expect(resolveInitialAiLayer('')).toBe(true);
  });

  it('honours and remembers ?ai=off / ?ai=on', () => {
    expect(resolveInitialAiLayer('?ai=off')).toBe(false);
    expect(window.localStorage.getItem(AI_LAYER_STORAGE_KEY)).toBe('off');
    expect(resolveInitialAiLayer('')).toBe(false);
    expect(resolveInitialAiLayer('?ai=on')).toBe(true);
    expect(resolveInitialAiLayer('')).toBe(true);
  });

  it('ignores unknown values', () => {
    expect(resolveInitialAiLayer('?ai=maybe')).toBe(true);
  });
});
