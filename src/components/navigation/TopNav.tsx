import { NavLink } from 'react-router';
import logo from '@/assets/images/logos/ea-filled-coral-logo.svg';
import { currentUser, primaryNav } from '@/data/navigation';
import { UserAvatarButton } from './UserAvatarButton';
import { tabClassName } from './navLinkClasses';

const linkClassName = tabClassName(
  'text-base leading-5 tracking-wide border-transparent inline-flex items-center px-1 pt-1 border-solid border-b-4 transition duration-150 ease-in-out',
);

/** Fixed desktop header (≥ md) with logo, primary navigation and avatar. */
export const TopNav = () => (
  <header className="relative z-50 md:block hidden">
    <div className="w-full fixed top-0 left-0 bg-white shadow">
      <div className="mx-auto lg:max-w-5xl md:max-w-4xl max-w-2xl sm:px-10 px-4">
        <div className="flex justify-between items-center">
          <div className="relative flex items-center h-16">
            <div className="flex-shrink-0 flex items-stretch">
              <img className="block h-8 w-auto my-auto" src={logo} alt="EA logo" />
            </div>
            <div className="md:flex md:items-center justify-start hidden">
              <div className="flex">
                <div className="inline-flex items-center ml-2 electronicArtsDisplayBold tracking-normal text-2xl text-red-500">
                  Help
                </div>
              </div>
              <nav aria-label="Primary" className="ml-8 h-16 flex space-x-6">
                {primaryNav.map((item) => (
                  <NavLink key={item.to} to={item.to} end className={linkClassName}>
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
          <div>
            <UserAvatarButton user={currentUser} />
          </div>
        </div>
      </div>
    </div>
  </header>
);
