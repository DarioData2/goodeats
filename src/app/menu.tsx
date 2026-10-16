import { useAccount } from '../../contexts/AuthContext';
import { PlannerWorkspace } from '../../components/PlannerWorkspace';

export default function MenuRoute() {
  const { user } = useAccount();
  return <PlannerWorkspace key={user?.id ?? 'local'} user={user} mode="menu" />;
}
