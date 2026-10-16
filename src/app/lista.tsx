import { PlannerWorkspace } from '../../components/PlannerWorkspace';
import { useAccount } from '../../contexts/AuthContext';

export default function ShoppingRoute() {
  const { user } = useAccount();
  return <PlannerWorkspace key={user?.id ?? 'local'} user={user} mode="shopping" />;
}
