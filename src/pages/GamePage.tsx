import { useParams } from 'react-router';
import { CardArticles } from '@/components/cards/CardArticles';
import { CardMediaHorizontal } from '@/components/cards/CardMediaHorizontal';
import { NotFoundMessage } from '@/components/details/NotFoundMessage';
import { PageHero } from '@/components/layout/PageHero';
import { Search } from '@/components/search/Search';
import { ArticleTitleList } from '@/components/sections/ArticleTitleList';
import { ContactUs } from '@/components/sections/ContactUs';
import { FeaturedArticlesHeader } from '@/components/sections/FeaturedArticlesHeader';
import { PageHelpful } from '@/components/sections/PageHelpful';
import { Accordion } from '@/components/ui/Accordion';
import { BackButton } from '@/components/ui/BackButton';
import { IncidentBanners } from '@/features/incidents/IncidentBanners';
import articles from '@/data/articles';
import games from '@/data/games';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { capitalizeFirstLetter, truncate } from '@/lib/text';
import type { Game } from '@/types/domain';

const FEATURED_LIMIT = 4;
const PREVIEW_LENGTH = 100;

const titlesForProduct = (product: string): string[] =>
  articles.filter((article) => article.product === product).map((article) => article.title);

const buildAccordionSections = (game: Game) => [
  { header: 'account', titles: titlesForProduct('account') },
  { header: 'technical', titles: titlesForProduct('technical') },
  {
    header: 'in-game issues',
    titles: game.articles.filter((article) => article.category === 'in-game issues').map((article) => article.title),
  },
  { header: 'payments', titles: titlesForProduct('payments') },
];

const GameContent = ({ game }: { game: Game }) => (
  <div className="mx-auto lg:max-w-5xl md:max-w-4xl max-w-2xl sm:px-10 px-4">
    <div className="my-6 sm:my-10 flex items-center">
      <BackButton />
    </div>
    <IncidentBanners gameIds={[game.id]} className="mb-8" />
    <div className="mt-8 sm:h-20 h-16 overflow-hidden">
      <img className="mx-auto h-full object-contain" src={game.logo} alt={game.title} />
    </div>
    <div className="sm:mt-10 mt-6">
      <h1 className="electronicArtsTextRegular md:text-2xl text-xl text-center">
        {`Get help for the top issues ${game.title} players are experiencing`}
      </h1>
    </div>
    <div className="relative sm:mt-10 mt-6 md:mx-10 mx-0">
      <Search placeholder="Search help here" gameTitle={game.title} />
    </div>
    <FeaturedArticlesHeader
      className="sm:mt-10 mt-6"
      titleWrapperClassName="flex-1"
      titleClassName="electronicArtsDisplayBold md:text-2xl text-xl tracking-wide"
      showViewAll={game.articles.length > FEATURED_LIMIT}
    />
    <div className="mt-4 grid md:grid-cols-2 grid-cols-1 gap-y-3 gap-x-6">
      {game.articles.slice(0, FEATURED_LIMIT).map((article, index) => (
        <CardArticles
          key={`${index}-${article.title}`}
          eyebrow={article.eyebrow}
          title={capitalizeFirstLetter(article.title)}
          preview={capitalizeFirstLetter(truncate(article.preview, PREVIEW_LENGTH))}
          buttonLabel={capitalizeFirstLetter('learn more')}
        />
      ))}
    </div>
    <div className="sm:mt-10 mt-6 accordion">
      {buildAccordionSections(game).map(({ header, titles }) => (
        <Accordion key={header} header={capitalizeFirstLetter(header)}>
          <ArticleTitleList titles={titles} />
        </Accordion>
      ))}
    </div>
    <div className="sm:mt-10 mt-6">
      <CardMediaHorizontal
        img={game.img}
        title={capitalizeFirstLetter(`get help from the ${game.title} community`)}
        subtitle={capitalizeFirstLetter(
          'get help from the community, find gameplay tips, and level up by answering player questions 24/7.',
        )}
        buttonWidth="w-full sm:w-auto"
        buttonLabel={capitalizeFirstLetter('read more')}
      />
    </div>
    <div className="sm:mt-10 mt-6">
      <ContactUs buttonLabel={capitalizeFirstLetter('Contact us')} />
    </div>
    <div className="sm:my-12 my-8">
      <PageHelpful />
    </div>
  </div>
);

/** Help hub for a single game. */
export const GamePage = () => {
  useScrollToTop();
  const { gameId } = useParams();
  const game = games.find((item) => item.id === gameId);

  return (
    <div className="mt-16">
      {game ? (
        <>
          <PageHero img={game.img} padding="sm:py-36 py-20" />
          <GameContent game={game} />
        </>
      ) : (
        <div className="mx-auto lg:max-w-5xl md:max-w-4xl max-w-2xl sm:px-10 px-4">
          <NotFoundMessage entity="game" />
        </div>
      )}
    </div>
  );
};
