import { Outlet } from 'react-router';
import blueGeometry from '@/assets/images/banners/blue-geometry.jpg';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHero } from '@/components/layout/PageHero';
import { SectionTabs, type SectionTab } from '@/components/navigation/SectionTabs';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const TABS: SectionTab[] = [
  { to: 'active', label: 'Active Cases' },
  { to: 'history', label: 'Cases History' },
];

/** "My Cases" shell: hero, Active/History tabs and the nested route outlet. */
export const CasesLayout = () => {
  useScrollToTop();

  return (
    <div className="mt-16">
      <PageHero
        img={blueGeometry}
        padding="sm:py-16 py-10 sm:px-10 px-6"
        title="My Cases"
        subtitle="View and manage all your help cases"
      />
      <PageContainer className="mt-6 sm:mx-auto sm:px-10 px-4">
        <SectionTabs label="Cases" tabs={TABS} />
        <div className="mt-6">
          <Outlet />
        </div>
      </PageContainer>
    </div>
  );
};
