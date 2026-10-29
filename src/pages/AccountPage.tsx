import { useNavigate } from 'react-router';
import violetGeometry from '@/assets/images/banners/violet-geometry.jpg';
import { CardTopics } from '@/components/cards/CardTopics';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHero } from '@/components/layout/PageHero';
import { SectionHeading } from '@/components/layout/SectionHeading';
import accountTools from '@/data/accountTools';
import { AccountRecoveryCallout } from '@/features/account/AccountRecoveryCallout';
import { useAiLayer } from '@/features/flags/aiLayer';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { capitalizeEachWord, capitalizeFirstLetter } from '@/lib/text';

/** "My Account" page: grid of self-help tools. */
export const AccountPage = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const aiEnabled = useAiLayer();

  return (
    <div className="my-16">
      <PageHero img={violetGeometry} padding="sm:py-16 py-10 sm:px-10 px-6" title="My Account" />
      <PageContainer className="sm:mx-auto sm:px-10 px-6">
        {aiEnabled && <AccountRecoveryCallout />}
        <section className="mt-10">
          <SectionHeading
            title={capitalizeEachWord('self-help tools')}
            description="Select the tool that best serves your issue."
          />
          <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-y-2 gap-x-2 sm:gap-y-4 sm:gap-x-4">
            {accountTools.map((tool) => (
              <CardTopics
                key={tool.id}
                icon={tool.icon}
                title={capitalizeEachWord(tool.product)}
                subtitle={capitalizeFirstLetter(tool.subtitle)}
                buttonLabel={capitalizeFirstLetter('learn more')}
                onClick={() => navigate(`/topic/${tool.product}`)}
              />
            ))}
          </div>
        </section>
      </PageContainer>
    </div>
  );
};
