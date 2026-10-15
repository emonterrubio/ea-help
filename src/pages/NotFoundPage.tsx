import { Link } from 'react-router';
import { PageContainer } from '@/components/layout/PageContainer';

/** Fallback for unknown URLs (the legacy app crashed here). */
export const NotFoundPage = () => (
  <div className="my-16">
    <PageContainer>
      <div className="py-16">
        <h1 className="electronicArtsDisplayBold md:text-3xl text-2xl mb-2">Page not found</h1>
        <p className="body-default mb-4">The page you’re looking for doesn’t exist.</p>
        <Link to="/" className="btn btn-link btn-md -ml-3.5">
          Go to EA Help home
        </Link>
      </div>
    </PageContainer>
  </div>
);
