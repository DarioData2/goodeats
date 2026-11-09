import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { HomeScreen } from '../../components/HomeScreen';
import { RegistrationResult } from '../../components/RegistrationResult';
import { useAccount } from '../../contexts/AuthContext';
import { checkSignupRedirect, readSignupRedirect } from '../../services/authService';

export default function HomeRoute() {
  const { user } = useAccount();
  const router = useRouter();
  const pendingCheck = useRef<Promise<boolean> | null>(null);
  const [confirmed, setConfirmed] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!pendingCheck.current) {
      const result = readSignupRedirect(window.location.hash);
      if (!result) return;
      // Remove credentials from the URL. Checking the token does not change the current session.
      const { pathname, search } = window.location;
      window.history.replaceState(window.history.state, '', pathname + search);
      pendingCheck.current = checkSignupRedirect(result.accessToken).catch(() => false);
    }
    let active = true;
    void pendingCheck.current.then(success => { if (active) setConfirmed(success); });
    return () => { active = false; };
  }, []);

  return <>
    <HomeScreen key={user?.id ?? 'local'} user={user} />
    {confirmed !== null && <RegistrationResult
      title={confirmed ? 'Correo confirmado' : 'No pudimos verificar el enlace'}
      message={confirmed ? 'Tu cuenta está activa. Ya puedes iniciar sesión en GoodEats.' : 'Si tu cuenta ya está confirmada, inicia sesión. Si todavía está pendiente, solicita un código nuevo desde el acceso.'}
      onClose={() => setConfirmed(null)}
      onSignIn={() => { setConfirmed(null); router.push('/login'); }}
    />}
  </>;
}
