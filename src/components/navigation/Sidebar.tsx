import { useId, useState } from 'react';
import { MdMenu } from 'react-icons/md';
import { Link, useLocation } from 'react-router';
import logo from '@/assets/images/logos/ea-filled-coral-logo.svg';
import { currentUser, primaryNav } from '@/data/navigation';
import { UserAvatarButton } from './UserAvatarButton';

/** Mobile header (< md) with a slide-in navigation drawer. */
export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();
  const drawerId = useId();
  const toggle = () => setIsOpen((open) => !open);

  return (
    <>
      <div className={isOpen ? 'navoverlay active' : 'navoverlay'} aria-hidden="true" />
      <header className="relative z-50">
        <div className="w-full fixed top-0 left-0 bg-white shadow">
          <div className="mx-auto xl:max-w-5xl lg:max-w-4xl md:max-w-2xl w-full">
            <div className="flex justify-between items-center">
              <div className="relative flex items-center h-16 pl-4">
                <div className="mr-3 flex-shrink-0 flex items-stretch md:hidden sm:block">
                  <button
                    type="button"
                    onClick={toggle}
                    aria-label={isOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={isOpen}
                    aria-controls={drawerId}
                  >
                    <MdMenu className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="flex-shrink-0 flex items-stretch">
                  <img className="block h-8 w-auto my-auto" src={logo} alt="EA logo" />
                  <span className="ml-2 electronicArtsDisplayBold tracking-normal text-2xl md:hidden">Help</span>
                </div>
              </div>
              <div className="mr-4">
                <UserAvatarButton user={currentUser} />
              </div>
            </div>
            <nav id={drawerId} aria-label="Primary" className={isOpen ? 'sidebar active' : 'sidebar'} inert={!isOpen}>
              <ul className="sidebarlist">
                {primaryNav.map((item) => {
                  const isActive = pathname === item.to;
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        onClick={toggle}
                        aria-current={isActive ? 'page' : undefined}
                        className={`row ${isActive ? 'is-active' : ''}`}
                      >
                        <span className="flex flex-row text-base leading-5 tracking-wide">
                          <span className="pr-3">
                            <item.icon className="h-5 w-5" aria-hidden="true" />
                          </span>
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
};
