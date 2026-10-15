import games from '@/data/games';
import { sortGames } from './sortGames';

describe('sortGames', () => {
  it('sorts by title ascending and descending', () => {
    const az = sortGames(games, 'a-z').map((g) => g.title);
    expect(az).toEqual([...az].sort((a, b) => a.localeCompare(b)));
    expect(sortGames(games, 'z-a').map((g) => g.title)).toEqual([...az].reverse());
  });

  it('sorts by year newest first', () => {
    const years = sortGames(games, 'year').map((g) => g.year);
    expect(years).toEqual([...years].sort((a, b) => b.localeCompare(a)));
  });

  it('compares ids as strings for "all" (legacy behaviour: "10" before "2")', () => {
    const ids = sortGames(games, 'all').map((g) => g.id);
    expect(ids.indexOf('10')).toBeLessThan(ids.indexOf('2'));
  });

  it('is stable, so ties keep the previous order', () => {
    const byTitle = sortGames(games, 'a-z');
    const byGenre = sortGames(byTitle, 'genre');
    const sports = byGenre.filter((g) => g.genre === 'sports').map((g) => g.title);
    expect(sports).toEqual([...sports].sort((a, b) => a.localeCompare(b)));
  });

  it('does not mutate the input', () => {
    const before = games.map((g) => g.id);
    sortGames(games, 'z-a');
    expect(games.map((g) => g.id)).toEqual(before);
  });
});
