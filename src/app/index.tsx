import { HomeScreen } from '../../components/HomeScreen';
import { useAccount } from '../../contexts/AuthContext';

export default function HomeRoute() {
  const { user } = useAccount();
  return <HomeScreen user={user} />;
}
