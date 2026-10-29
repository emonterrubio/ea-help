import { Link, useNavigate } from 'react-router';
import { GameGrid } from '@/components/games/GameGrid';
import { GameTile } from '@/components/games/GameTile';
import { Button } from '@/components/ui/Button';
import games from '@/data/games';
import { pickUniqueIndices } from '@/lib/random';
import { capitalizeFirstLetter } from '@/lib/text';

const FEATURED_COUNT = 8;

/** Picked once per page load so the selection stays stable while navigating. */
const featuredGames = pickUniqueIndices(games.length, FEATURED_COUNT).flatMap((index) => games[index] ?? []);

/** Home-page grid of randomly featured games. */
export const FeaturedGames = () => {
  const navigate = useNavigate();

  return (
    <section>
      <div>
        <h2 className="electronicArtsDisplayBold md:text-3xl text-2xl">{capitalizeFirstLetter('games')}</h2>
      </div>
      <div className="mb-2 flex justify-between items-center">
        <div className="flex-1">
          <p className="py-2 text-base leading-5 tracking-wide">Select from one of the titles you own.</p>
        </div>
        <div>
          {featuredGames.length >= FEATURED_COUNT && (
            <Link to="/games" className="-mr-4 btn btn-link btn-md text-blue-500">
              {capitalizeFirstLetter('view all')}
            </Link>
          )}
        </div>
      </div>
      <GameGrid>
        {featuredGames.map((game) => (
          <GameTile key={game.id} game={game} />
        ))}
      </GameGrid>
      <div className="mt-6 flex justify-center">
        <Button buttonWidth="w-full sm:w-auto" buttonStyle="btn-terciary-outline" onClick={() => navigate('/eagames')}>
          See all EA games
        </Button>
      </div>
    </section>
  );
};
