import logo from '@/assets/images/logos/ea-filled-coral-logo.svg';
import { PlaceholderLink } from '@/components/ui/PlaceholderLink';
import { footerLinks } from '@/data/navigation';

/** Site footer with placeholder links (destinations not implemented yet). */
export const Footer = () => (
  <footer className="py-8 bg-white">
    <div className="sm:mx-auto lg:max-w-5xl md:max-w-4xl sm:max-w-2xl sm:px-10 mx-4">
      <nav className="flex flex-wrap items-center justify-center" aria-label="Footer">
        <img className="block h-8 w-auto sm:m-0 ml-2 pr-2 mb-4" src={logo} alt="EA logo" />
        {footerLinks.map((name) => (
          <div key={name} className="px-3 py-2">
            <PlaceholderLink className="body-default text-gray-500 hover:text-gray-900">{name}</PlaceholderLink>
          </div>
        ))}
      </nav>
      <p className="mt-4 text-center body-default text-gray-400">&copy; 2022 Electronic Arts Inc.</p>
    </div>
  </footer>
);
