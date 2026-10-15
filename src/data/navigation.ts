import type { IconType } from 'react-icons';
import { BiHomeSmile } from 'react-icons/bi';
import { MdOutlineAccountCircle, MdOutlineBackHand, MdOutlineFolderOpen } from 'react-icons/md';

export interface NavItem {
  label: string;
  to: string;
  icon: IconType;
}

/** Primary navigation shared by the desktop top bar and the mobile sidebar. */
export const primaryNav: NavItem[] = [
  { label: 'Home', to: '/', icon: BiHomeSmile },
  { label: 'My Cases', to: '/cases/active', icon: MdOutlineFolderOpen },
  { label: 'My Infractions', to: '/infractions/active', icon: MdOutlineBackHand },
  { label: 'My Account', to: '/account', icon: MdOutlineAccountCircle },
];

export const footerLinks: string[] = ['Browse Games', 'Answers HQ', 'About', 'Accessibility', 'Jobs', 'Contact Us'];

/** Placeholder signed-in user shown in the header avatar. */
export const currentUser = {
  name: 'Tom Cook',
  email: 'tom@example.com',
  imageUrl:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
} as const;

/** First names used for the randomized home-page greeting. */
export const greetingNames: string[] = [
  'Naveen',
  'Melissa',
  'Kareem',
  'Matt',
  'Nick',
  'James',
  'Sunil',
  'Sarah',
  'Marlon',
  'Amit',
  'Marlon',
  'Kimberly',
  'Ed',
];

export const moreHelpLinks = {
  learnMore: [
    'How to get more information about my ban or suspension',
    'How to avoid phishing',
    'How to link your EA Account to Twitch',
    'How to create an EA Account',
  ],
  communityHelp: [
    'Forum suspension, notification & appeal',
    'Unfairly banned and can not fill a case',
    'I cannot enter the MUT auction house. What shall I do?',
    'Frustration - Ban on account',
    'My account got falsely banned. What shall I do?',
  ],
} as const;
