import type { Infraction } from '@/types/domain';
import fifa22 from '@/assets/images/logos/fifa22_logo.svg';
import swsquadrons from '@/assets/images/logos/swsquadrons_logo.svg';
import battlefield from '@/assets/images/logos/battlefield2042_logo.svg';
import maddenNFL23 from '@/assets/images/logos/madden23_logo.svg';
import eaplay from '@/assets/images/logos/ea-play-logo.svg';
import ea from '@/assets/images/logos/ea-filled-black-logo.svg';

const infractions: Infraction[] = [
  {
    id: '1',
    img: fifa22,
    game: 'FIFA 22',
    type: 'suspension',
    status: 'open',
    outcome: 'suspension appeal ends in 2 days',
    date: '6/9/2021',
    enddate: '6/16/2021',
    title: 'You have an active suspension from FIFA 22 on your EA account',
    chipStyle: 'chip-green', // color based on status
    typeStyle: 'chip-yellow', // color based on type
    description:
      'If you have an account/device suspension or Transfer Market ban and feel this is not justified, you can appeal this action via this link. If you have already submitted an appeal we ask for your patience until the dedicated team can get to your case.',
  },
  {
    id: '2',
    img: swsquadrons,
    game: 'Star Wars Squadrons',
    type: 'suspension',
    status: 'open',
    outcome: 'waiting on player to appeal suspension',
    date: '4/12/2021',
    enddate: '4/8/2021',
    title: 'You have an active suspension from Star Wars Squadrons on your EA account',
    chipStyle: 'chip-green',
    typeStyle: 'chip-yellow',
    description:
      'If you have an account/device suspension or Transfer Market ban and feel this is not justified, you can appeal this action via this link. If you have already submitted an appeal we ask for your patience until the dedicated team can get to your case.',
  },
  {
    id: '3',
    img: battlefield,
    game: 'Battlefield 2042',
    type: 'ban',
    status: 'closed',
    outcome: 'ban appeal in review',
    date: '2/21/2021',
    enddate: '2/26/2021',
    title: 'You have an active ban from Battlefield 2042 on your EA account',
    chipStyle: 'chip-gray',
    typeStyle: 'chip-red',
    description:
      'If you have an account/device suspension or Transfer Market ban and feel this is not justified, you can appeal this action via this link. If you have already submitted an appeal we ask for your patience until the dedicated team can get to your case.',
  },
  {
    id: '4',
    img: maddenNFL23,
    game: 'Madden NFL 23',
    type: 'suspension',
    status: 'closed',
    outcome: 'suspension 7 day appeal expiration ended',
    date: '10/15/2020',
    enddate: '10/10/2021',
    title: 'You had a suspension from Madden NFL 23 on your EA account',
    chipStyle: 'chip-gray', // color based on status
    typeStyle: 'chip-yellow',
    description:
      'If you have an account/device suspension or Transfer Market ban and feel this is not justified, you can appeal this action via this link. If you have already submitted an appeal we ask for your patience until the dedicated team can get to your case.',
  },
  {
    id: '5',
    img: eaplay,
    game: 'EA Play',
    type: 'suspension',
    status: 'closed',
    outcome: 'suspension appeal expiration ended',
    date: '8/11/2021',
    enddate: '8/15/2021',
    title: 'You had a suspension from EA Play on your EA account',
    chipStyle: 'chip-gray',
    typeStyle: 'chip-yellow',
    description:
      'If you have an account/device suspension or Transfer Market ban and feel this is not justified, you can appeal this action via this link. If you have already submitted an appeal we ask for your patience until the dedicated team can get to your case.',
  },
  {
    id: '6',
    img: ea,
    game: 'Account',
    type: 'suspension',
    status: 'closed',
    outcome: 'suspension appeal denied',
    date: '3/3/2021',
    enddate: '3/23/2021',
    title: 'You had a suspension on your EA account',
    chipStyle: 'chip-gray',
    typeStyle: 'chip-yellow',
    description:
      'If you have an account/device suspension or Transfer Market ban and feel this is not justified, you can appeal this action via this link. If you have already submitted an appeal we ask for your patience until the dedicated team can get to your case.',
  },
  {
    id: '7',
    img: ea,
    game: 'Account',
    type: 'ban',
    status: 'closed',
    outcome: 'ban overturned',
    date: '2/12/2018',
    enddate: '4/22/2018',
    title: 'You had a ban on your EA account',
    chipStyle: 'chip-gray',
    typeStyle: 'chip-red',
    description:
      'If you have an account/device suspension or Transfer Market ban and feel this is not justified, you can appeal this action via this link. If you have already submitted an appeal we ask for your patience until the dedicated team can get to your case.',
  },
];

export default infractions;
