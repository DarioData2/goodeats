import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, supabaseConfigurationError } from '../lib/supabase';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!!supabase);
  const [error, setError] = useState<string | null>(supabaseConfigurationError);
  useEffect(() => {
    const client = supabase;
    let active = true;
    let receivedEvent = false;
    if (!client) return;
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, next) => {
      receivedEvent = true;
      if (active) { setSession(next); setLoading(false); setError(null); }
    });
    void client.auth.getSession().then(({ data, error: issue }) => {
      if (!active || receivedEvent) return;
      setSession(data.session); setLoading(false);
      if (issue) setError('No pudimos recuperar la sesión. Puedes volver a iniciar sesión.');
    }).catch(() => {
      if (active && !receivedEvent) {
        setLoading(false); setError('No pudimos recuperar la sesión. Intenta de nuevo.');
      }
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);
  return { user: session?.user ?? null, loading, error };
}
