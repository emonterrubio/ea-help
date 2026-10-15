import {
  MdOutlineAccountCircle,
  MdOutlineEmail,
  MdOutlineSecurity,
  MdOutlineShoppingCart,
  MdOutlineVpnKey,
  MdQrCodeScanner,
} from 'react-icons/md';
import type { TopicTile } from '@/types/domain';

const accountTools: TopicTile[] = [
  { id: '1', icon: MdOutlineVpnKey, product: 'password', subtitle: 'change or recover your password' },
  { id: '2', icon: MdOutlineEmail, product: 'email', subtitle: 'change or update your email' },
  { id: '3', icon: MdOutlineShoppingCart, product: 'orders', subtitle: 'manage any pending or past orders' },
  { id: '4', icon: MdQrCodeScanner, product: 'redeem', subtitle: 'redeem a product code' },
  { id: '5', icon: MdOutlineSecurity, product: 'security', subtitle: 'manage your security settings' },
  { id: '6', icon: MdOutlineAccountCircle, product: 'account', subtitle: 'link of unlink your EA account' },
];

export default accountTools;
