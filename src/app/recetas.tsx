import { RecipesScreen } from '../../components/RecipesScreen';
import { useAccount } from '../../contexts/AuthContext';

export default function RecipesRoute() {
  const { user } = useAccount();
  return <RecipesScreen key={user?.id ?? 'local'} user={user} />;
}
