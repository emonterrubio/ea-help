import { useState } from 'react';
import eaHero from '@/assets/images/banners/ea-play-hero.jpg';
import eaShapes from '@/assets/images/banners/EA_PrimaryHeritageShapes.png';
import { CardMediaHorizontal } from '@/components/cards/CardMediaHorizontal';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHero } from '@/components/layout/PageHero';
import { Search } from '@/components/search/Search';
import { Banner } from '@/components/sections/Banner';
import { FeaturedGames } from '@/components/sections/FeaturedGames';
import { PageHelpful } from '@/components/sections/PageHelpful';
import { Topics } from '@/components/sections/Topics';
import { IncidentBanners } from '@/features/incidents/IncidentBanners';
import { greetingNames } from '@/data/navigation';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { pickRandom } from '@/lib/random';
import { capitalizeFirstLetter } from '@/lib/text';

export const HomePage = () => {
  useScrollToTop();
  const [name] = useState(() => pickRandom(greetingNames));

  return (
    <div className="mt-16">
      <PageHero
        img={eaHero}
        padding="sm:py-20 py-10 sm:px-10 px-6"
        title={`Hi ${name}, how we can help?`}
        subtitle={capitalizeFirstLetter(
          'find common solutions through product articles, and other self-service tools.',
        )}
      >
        <div className="pt-4">
          <Search placeholder="How can we help?" />
        </div>
      </PageHero>
      <PageContainer>
        <IncidentBanners className="mt-6" />
        <div className="my-10">
          <Topics />
        </div>
        <div className="my-10">
          <FeaturedGames />
        </div>
        <div className="my-10">
          <Banner
            title={capitalizeFirstLetter('get help from the community')}
            subtitle={capitalizeFirstLetter('find gameplay tips, and level up by answering player questions 24/7.')}
            buttonLabel={capitalizeFirstLetter('learn more')}
          />
        </div>
        <div className="my-10">
          <CardMediaHorizontal
            img={eaShapes}
            title={capitalizeFirstLetter('keep up with the latest EA games and news')}
            subtitle={capitalizeFirstLetter(
              'get help from the community, find gameplay tips, and level up by answering player questions 24/7.',
            )}
            buttonWidth="w-full"
            buttonLabel={capitalizeFirstLetter('read more')}
          />
        </div>
        <div className="sm:my-12 my-8">
          <PageHelpful />
        </div>
      </PageContainer>
    </div>
  );
};
