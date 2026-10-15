import { capitalizeFirstLetter } from '@/lib/text';

interface FeaturedArticlesHeaderProps {
  /** Classes for the outer row (spacing). */
  className: string;
  /** Classes for the box wrapping the heading. */
  titleWrapperClassName: string;
  titleClassName: string;
  showViewAll: boolean;
}

/** "Featured articles" heading row with an optional (placeholder) "View all" action. */
export const FeaturedArticlesHeader = ({
  className,
  titleWrapperClassName,
  titleClassName,
  showViewAll,
}: FeaturedArticlesHeaderProps) => (
  <div className={`flex justify-between items-center ${className}`}>
    <div className={titleWrapperClassName}>
      <h2 className={titleClassName}>{capitalizeFirstLetter('featured articles')}</h2>
    </div>
    {showViewAll && (
      <div>
        <button type="button" className="-mr-4 btn btn-link btn-md text-blue-500">
          {capitalizeFirstLetter('view all')}
        </button>
      </div>
    )}
  </div>
);
