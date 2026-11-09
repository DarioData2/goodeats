import { PantryScreen } from '../../components/PantryScreen';
import { useAccount } from '../../contexts/AuthContext';

export default function PantryRoute() {
  const { user } = useAccount();
  return <PantryScreen key={user?.id ?? 'local'} user={user} />;
}
