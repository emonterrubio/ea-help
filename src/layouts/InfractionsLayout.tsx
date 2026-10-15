import { MdOutlineInfo } from 'react-icons/md';
import { Outlet } from 'react-router';
import redGeometry from '@/assets/images/banners/red-geometry.jpg';
import { AlertDismiss } from '@/components/alert/AlertDismiss';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHero } from '@/components/layout/PageHero';
import { SectionTabs, type SectionTab } from '@/components/navigation/SectionTabs';
import { MoreHelp } from '@/components/sections/MoreHelp';
import { usePlaceholderAction } from '@/hooks/usePlaceholderAction';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const TABS: SectionTab[] = [
  { to: 'active', label: 'Active Infractions' },
  { to: 'history', label: 'Infractions History', className: 'rounded-sm' },
];

const BAN_NOTICE =
  ' We’ll ban players who break our User Agreement. If you’ve got a ban or suspension on your EA Account for a specific game, or for the device you play on, we’ll notify you via email. Check your inbox for more details.';

/** "My Infractions" shell: hero, ban notice, Active/History tabs, outlet and help links. */
export const InfractionsLayout = () => {
  useScrollToTop();
  const onLearnMore = usePlaceholderAction();

  return (
    <div className="mt-16">
      <PageHero
        img={redGeometry}
        padding="sm:py-16 py-10 sm:px-10 px-6"
        title="My Infractions"
        subtitle="View your active and past bans and suspensions"
      />
      <PageContainer>
        <div className="mt-4">
          <AlertDismiss
            severity="info"
            icon={<MdOutlineInfo className="h-6 w-6" aria-hidden="true" />}
            title="Important"
            description={BAN_NOTICE}
            onLearnMore={onLearnMore}
          />
        </div>
        <SectionTabs label="Infractions" tabs={TABS} />
        <div className="mt-6">
          <Outlet />
          <MoreHelp />
        </div>
      </PageContainer>
    </div>
  );
};
