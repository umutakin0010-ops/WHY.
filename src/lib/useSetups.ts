import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./auth";
import type { SetupTemplate } from "./types";
import { loadSetups as loadLocal, saveSetup as saveLocal, deleteSetup as deleteLocal } from "./storage";
import { fetchRemoteSetups, insertRemoteSetup, deleteRemoteSetup } from "./setupsRemote";

export function useSetups() {
  const { user } = useAuth();
  const [setups, setSetups] = useState<SetupTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    if (user) {
      setSetups(await fetchRemoteSetups(user.id));
    } else {
      setSetups(loadLocal());
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const add = useCallback(async (setup: SetupTemplate) => {
    if (user) await insertRemoteSetup(user.id, setup);
    else saveLocal(setup);
    await refresh();
  }, [user, refresh]);

  const remove = useCallback(async (id: string) => {
    if (user) await deleteRemoteSetup(id);
    else deleteLocal(id);
    await refresh();
  }, [user, refresh]);

  return { setups, loading, add, remove, refresh, cloudSynced: Boolean(user) };
}
