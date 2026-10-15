import type { ReactNode } from 'react';

interface PageHeroProps {
  img: string | null;
  /** Tailwind padding classes for the content box. */
  padding: string;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
}

/** Full-bleed hero banner: decorative background image with optional title, subtitle and extra content. */
export const PageHero = ({ img, padding, title, subtitle, children }: PageHeroProps) => (
  <div className="relative">
    <div className="absolute inset-0">
      <img className="h-full w-full object-cover bg-slate-100" src={img ?? undefined} alt="" />
    </div>
    <div className={`relative ${padding} mx-auto lg:max-w-5xl md:max-w-4xl max-w-2xl`}>
      {title !== undefined && (
        <h1 className="mb-3 electronicArtsDisplayRegular text-white tracking-wide sm:text-6xl text-5xl">{title}</h1>
      )}
      {subtitle !== undefined && (
        <p className="electronicArtsTextRegular text-white tracking-wide text-md sm:text-lg">{subtitle}</p>
      )}
      {children}
    </div>
  </div>
);
