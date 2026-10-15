import { Link } from 'react-router';
import { capitalizeFirstLetter, truncate } from '@/lib/text';
import type { Game } from '@/types/domain';

const MAX_TITLE_LENGTH = 18;

interface GameTileProps {
  game: Game;
  /** Show year and genre badges under the title. */
  showMeta?: boolean;
}

/** Key-art tile linking to the game's help page. */
export const GameTile = ({ game, showMeta = false }: GameTileProps) => (
  <div className="flex flex-col cursor-pointer">
    <div className="group rounded overflow-hidden mb-4">
      <Link to={`/game/${game.id}`} aria-label={game.title} className="thumbnail flex relative justify-center">
        <span className="relative w-full block">
          <img className="w-full object-cover" src={game.tile} alt="" loading="lazy" decoding="async" />
        </span>
        <span className="overlay absolute w-full h-full top-0 left-0 bg-slate-900 mix-blend-multiply opacity-20" />
        <span className="absolute w-3/5 flex items-center h-full z-10">
          <img src={game.tilelogo} alt="" />
        </span>
      </Link>
    </div>
    <div className="electronicArtsDisplayBold text-base tracking-wide text-center" aria-hidden="true">
      {truncate(game.title, MAX_TITLE_LENGTH)}
    </div>
    {showMeta && (
      <div className="flex items-center justify-around gap-x-2 body-default text-center mx-12">
        <p className="body-small text-center p-1 bg-zinc-100 rounded-md">{game.year}</p>
        <p className="body-small text-center p-1 bg-zinc-100 rounded-md">{capitalizeFirstLetter(game.genre)}</p>
      </div>
    )}
  </div>
);
