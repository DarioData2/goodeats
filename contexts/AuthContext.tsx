import { createContext, useContext, type PropsWithChildren } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAvatar } from '../hooks/useAvatar';
const AuthContext = createContext<(ReturnType<typeof useAuth> & { avatarUrl: string | null }) | null>(null);
export function AuthProvider({ children }: PropsWithChildren) {
  // Una sola suscripción de Auth mantiene ambas rutas en la misma sesión.
  const auth = useAuth();
  const avatarUrl = useAvatar(auth.user);
  return <AuthContext.Provider value={{ ...auth, avatarUrl }}>{children}</AuthContext.Provider>;
}
export function useAccount() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('La sesión requiere AuthProvider.');
  return auth;
}
