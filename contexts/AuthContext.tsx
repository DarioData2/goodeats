import { createContext, useContext, type PropsWithChildren } from 'react';
import { useAuth } from '../hooks/useAuth';
const AuthContext = createContext<ReturnType<typeof useAuth> | null>(null);
export function AuthProvider({ children }: PropsWithChildren) {
  // Una sola suscripción de Auth mantiene ambas rutas en la misma sesión.
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
export function useAccount() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('La sesión requiere AuthProvider.');
  return auth;
}
