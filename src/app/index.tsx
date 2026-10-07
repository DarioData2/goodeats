import ShoppingScreen from '../../components/ShoppingScreen';
import { useAccount } from '../../contexts/AuthContext';
export default function ShoppingRoute() {
  const { user } = useAccount();
  return <ShoppingScreen key={user?.id ?? 'local'} user={user} />;
}
