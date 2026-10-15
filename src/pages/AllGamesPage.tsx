import { useId, useState, type ChangeEvent } from 'react';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';
import { GameGrid } from '@/components/games/GameGrid';
import { GameTile } from '@/components/games/GameTile';
import { BackButton } from '@/components/ui/BackButton';
import games from '@/data/games';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { GAME_SORT_OPTIONS, isGameSortOption, sortGames } from '@/lib/sortGames';
import { capitalizeFirstLetter } from '@/lib/text';

const VISIBLE_LIMIT = 10;

/** "Games you own" catalog with a sort selector. */
export const AllGamesPage = () => {
  useScrollToTop();
  const sortId = useId();
  const [sortedGames, setSortedGames] = useState(games);

  const handleSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    if (isGameSortOption(value)) setSortedGames((current) => sortGames(current, value));
  };

  return (
    <div className="my-16">
      <div className="sm:mx-auto lg:max-w-5xl md:max-w-4xl max-w-2xl sm:px-10 px-4">
        <div className="py-4 sm:py-6 flex items-center">
          <BackButton />
        </div>
        <div>
          <h1 className="electronicArtsDisplayBold md:text-3xl text-2xl">{capitalizeFirstLetter('Games')}</h1>
        </div>
        <div className="mb-4 block sm:flex justify-between gap-x-3 items-center items-end">
          <div className="flex-1 pt-2 sm:p-0">
            <p className="body-default">Select from one of the titles you own.</p>
          </div>
          <div className="flex items-center pt-3 sm:p-0 gap-x-3">
            <label htmlFor={sortId} className="body-default">
              View by:
            </label>
            <div className="relative">
              <select
                id={sortId}
                className="p-2 border border-solid border-slate-200 rounded-sm body-default"
                onChange={handleSortChange}
              >
                {GAME_SORT_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <span className="absolute top-1 right-2 pointer-events-none" aria-hidden="true">
                <MdOutlineKeyboardArrowDown className="h-6 w-6" />
              </span>
            </div>
          </div>
        </div>
        <GameGrid>
          {sortedGames.slice(0, VISIBLE_LIMIT).map((game) => (
            <GameTile key={game.id} game={game} showMeta />
          ))}
        </GameGrid>
      </div>
    </div>
  );
};
