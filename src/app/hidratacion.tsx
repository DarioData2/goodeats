import { useAccount } from '../../contexts/AuthContext';
import { HydrationScreen } from '../../components/HydrationScreen';

export default function HydrationRoute() {
  const { user } = useAccount();
  return <HydrationScreen key={user?.id ?? 'local'} user={user} />;
}
