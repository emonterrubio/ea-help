import { routeIntent } from './router';
import { SCENARIOS } from './scenarios';

describe('routeIntent', () => {
  it.each(SCENARIOS.map((scenario) => [scenario.id, scenario.prompt]))(
    'routes the %s sample prompt to its own scenario',
    (id, prompt) => {
      expect(routeIntent(prompt)).toBe(id);
    },
  );

  it('puts safety and escalation ahead of everything else', () => {
    expect(routeIntent("I bought a pack and now I'm being harassed in game chat")).toBe('escalate');
  });

  it('returns null when nothing matches', () => {
    expect(routeIntent('what is the meaning of life')).toBeNull();
  });
});
