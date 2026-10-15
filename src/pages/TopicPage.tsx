import { useParams } from 'react-router';
import greenGeometry from '@/assets/images/banners/green-geometry.jpg';
import mustardGeometry from '@/assets/images/banners/mustard-geometry.jpg';
import orangeGeometry from '@/assets/images/banners/orange-geometry.jpg';
import tealGeometry from '@/assets/images/banners/teal-geometry.jpg';
import { CardArticles } from '@/components/cards/CardArticles';
import { PageHero } from '@/components/layout/PageHero';
import { ArticleTitleList } from '@/components/sections/ArticleTitleList';
import { ContactUs } from '@/components/sections/ContactUs';
import { FeaturedArticlesHeader } from '@/components/sections/FeaturedArticlesHeader';
import { PageHelpful } from '@/components/sections/PageHelpful';
import { Accordion } from '@/components/ui/Accordion';
import { BackButton } from '@/components/ui/BackButton';
import articles from '@/data/articles';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { capitalizeEachWord, capitalizeFirstLetter, truncate } from '@/lib/text';

const PREVIEW_LENGTH = 100;

const TOPIC_BANNERS: Record<string, string> = {
  account: mustardGeometry,
  payments: greenGeometry,
  technical: orangeGeometry,
  safety: tealGeometry,
};

const topicTitle = (topic: string): string =>
  topic === 'safety'
    ? `${capitalizeFirstLetter('player')} ${capitalizeFirstLetter(topic)} ${capitalizeFirstLetter('support')}`
    : `${capitalizeFirstLetter(topic)} ${capitalizeFirstLetter('support')}`;

/** Help hub for a topic such as account, payments, technical or safety. */
export const TopicPage = () => {
  useScrollToTop();
  const { topicId = '' } = useParams();
  const topicArticles = articles.filter((article) => article.product === topicId);
  const featured = topicArticles.filter((article) => article.category === 'featured');

  const accordionSections = [
    { header: capitalizeEachWord('popular articles'), titles: topicArticles.map((article) => article.title) },
    {
      header: capitalizeEachWord('community'),
      titles: topicArticles.filter((article) => article.category === 'recommended').map((article) => article.title),
    },
  ];

  return (
    <div className="mt-16 mb-10">
      <PageHero
        img={TOPIC_BANNERS[topicId] ?? null}
        padding="sm:py-16 py-10 sm:px-10 px-6"
        title={topicTitle(topicId)}
      />
      <div className="sm:mx-auto lg:max-w-5xl md:max-w-4xl max-w-2xl sm:px-12 mx-6">
        <div className="my-6 sm:my-10 flex items-center">
          <BackButton />
        </div>
        <FeaturedArticlesHeader
          className="mt-8"
          titleWrapperClassName="mb-2"
          titleClassName="electronicArtsDisplayBold tracking-wide sm:text-3xl text-2xl"
          showViewAll
        />
        <div className="mt-4 grid md:grid-cols-2 grid-cols-1 gap-y-3 gap-x-6">
          {featured.map((article) => (
            <CardArticles
              key={article.id}
              eyebrow={article.type}
              title={capitalizeFirstLetter(article.title)}
              preview={capitalizeFirstLetter(truncate(article.preview, PREVIEW_LENGTH))}
              buttonLabel={capitalizeFirstLetter('learn more')}
            />
          ))}
        </div>
        <div className="sm:mt-10 mt-6 accordion">
          {accordionSections.map(({ header, titles }) => (
            <Accordion key={header} header={capitalizeFirstLetter(header)}>
              <ArticleTitleList titles={titles} />
            </Accordion>
          ))}
        </div>
        <div className="sm:mt-10 mt-6">
          <ContactUs buttonLabel={capitalizeFirstLetter('get started')} />
        </div>
        <div className="sm:mt-12 mt-10">
          <PageHelpful />
        </div>
      </div>
    </div>
  );
};
