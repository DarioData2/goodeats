import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { avatarPath } from '../services/profileLogic';
import { getAvatarUrl } from '../services/profileService';

export function useAvatar(user: User | null) {
  const owner = user?.id;
  const path = user ? avatarPath(user.id, user.user_metadata) : null;
  const [photo, setPhoto] = useState<{ owner: string; path: string; url: string } | null>(null);
  useEffect(() => {
    if (!owner || !path) return;
    let active = true;
    async function load() {
      try { const url = await getAvatarUrl(owner!, path!); if (active) setPhoto({ owner: owner!, path: path!, url }); }
      catch { if (active) setPhoto(null); }
    }
    void load();
    const timer = setInterval(() => void load(), 50 * 60 * 1000);
    return () => { active = false; clearInterval(timer); };
  }, [owner, path]);
  return photo?.owner === owner && photo?.path === path ? photo.url : null;
}
