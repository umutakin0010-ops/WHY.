import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./auth";
import type { UserProfile } from "./types";
import { loadProfile as loadLocal, saveProfile as saveLocal } from "./storage";
import { fetchRemoteProfile, saveRemoteProfile } from "./profileRemote";

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(() => loadLocal());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    if (user) {
      const remote = await fetchRemoteProfile(user.id);
      if (remote === null) {
        // First time this user is signed in — seed the cloud with whatever is local.
        const seeded = loadLocal();
        await saveRemoteProfile(user.id, seeded);
        setProfile(seeded);
      } else {
        setProfile(remote);
      }
    } else {
      setProfile(loadLocal());
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const update = useCallback((next: UserProfile) => {
    setProfile(next);
    if (user) saveRemoteProfile(user.id, next);
    else saveLocal(next);
  }, [user]);

  return { profile, loading, update, refresh, cloudSynced: Boolean(user) };
}
