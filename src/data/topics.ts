import { MdOutlineAccountCircle, MdOutlineBuildCircle, MdPayment, MdPeople } from 'react-icons/md';
import type { TopicTile } from '@/types/domain';

const topics: TopicTile[] = [
  {
    id: '1',
    icon: MdOutlineAccountCircle,
    product: 'account',
    subtitle: 'learn how to manage and update your EA account',
  },
  {
    id: '2',
    icon: MdPayment,
    product: 'payments',
    subtitle: 'learn about payment methods EA accepts',
  },
  {
    id: '3',
    icon: MdOutlineBuildCircle,
    product: 'technical',
    subtitle: 'see answers to FAQ and find solutions to common issues',
  },
  {
    id: '4',
    icon: MdPeople,
    product: 'safety',
    subtitle: 'a game community that it’s positive, fair and safe for all',
  },
];

export default topics;
