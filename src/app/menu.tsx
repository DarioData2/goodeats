import { useAccount } from '../../contexts/AuthContext';
import { WeeklyMenuScreen } from '../../components/WeeklyMenuScreen';

export default function MenuRoute() {
  const { user } = useAccount();
  return <WeeklyMenuScreen key={user?.id ?? 'local'} user={user} />;
}
