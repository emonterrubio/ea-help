import { useState } from 'react';
import { GameGrid } from '@/components/games/GameGrid';
import { GameTile } from '@/components/games/GameTile';
import { BackButton } from '@/components/ui/BackButton';
import { Chip } from '@/components/ui/Chip';
import games from '@/data/games';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { capitalizeFirstLetter } from '@/lib/text';

/** Unique genres in order of first appearance. */
const GENRES = [...new Set(games.map((game) => game.genre))];

/** `null` means "All". */
type GenreFilter = string | null;

interface GenreFiltersProps {
  selected: GenreFilter;
  onSelect: (genre: GenreFilter) => void;
}

const GenreFilters = ({ selected, onSelect }: GenreFiltersProps) => (
  <div className="flex items-center pt-3 sm:p-0 gap-x-1" role="group" aria-label="Filter by genre">
    <Chip chipStyle="chip-gray" chipSize="chip-lg" onClick={() => onSelect(null)} pressed={selected === null}>
      All
    </Chip>
    {GENRES.map((genre) => (
      <Chip
        key={genre}
        chipStyle="chip-gray"
        chipSize="chip-lg"
        onClick={() => onSelect(genre)}
        pressed={selected === genre}
      >
        {genre}
      </Chip>
    ))}
  </div>
);

/** Full EA catalog filterable by genre. */
export const AllEAGamesPage = () => {
  useScrollToTop();
  const [genre, setGenre] = useState<GenreFilter>(null);
  const visibleGames = genre === null ? games : games.filter((game) => game.genre === genre);

  return (
    <div className="my-16">
      <div className="sm:mx-auto lg:max-w-5xl md:max-w-4xl max-w-2xl sm:px-10 px-4">
        <div className="py-4 sm:py-6 flex items-center">
          <BackButton />
        </div>
        <div className="mb-4 block sm:flex justify-between items-center">
          <div className="flex-1 pt-2 sm:p-0">
            <h1 className="electronicArtsDisplayBold md:text-3xl text-2xl">{capitalizeFirstLetter('games')}</h1>
          </div>
          <GenreFilters selected={genre} onSelect={setGenre} />
        </div>
        <GameGrid>
          {visibleGames.map((game) => (
            <GameTile key={game.id} game={game} showMeta />
          ))}
        </GameGrid>
      </div>
    </div>
  );
};
