import type { Game } from '@/types/domain';

export type GameSortOption = 'all' | 'year' | 'genre' | 'a-z' | 'z-a';

export const GAME_SORT_OPTIONS: { value: GameSortOption; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'year', label: 'Release year' },
  { value: 'genre', label: 'Genre' },
  { value: 'a-z', label: 'A – Z' },
  { value: 'z-a', label: 'Z – A' },
];

const COMPARATORS: Record<GameSortOption, (a: Game, b: Game) => number> = {
  /** Original order; ids are compared as strings, as in the legacy app. */
  all: (a, b) => a.id.localeCompare(b.id),
  year: (a, b) => b.year.localeCompare(a.year),
  genre: (a, b) => a.genre.localeCompare(b.genre),
  'a-z': (a, b) => a.title.localeCompare(b.title),
  'z-a': (a, b) => b.title.localeCompare(a.title),
};

export const isGameSortOption = (value: string): value is GameSortOption => value in COMPARATORS;

/**
 * Returns a sorted copy. Sorting is stable, so ties keep the order of `games`;
 * callers pass the currently displayed list to preserve that legacy behaviour.
 */
export const sortGames = (games: readonly Game[], option: GameSortOption): Game[] =>
  [...games].sort(COMPARATORS[option]);
