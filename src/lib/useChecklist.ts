import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./auth";
import type { ChecklistItem } from "./types";
import { loadChecklist as loadLocal, saveChecklist as saveLocal } from "./storage";
import { fetchRemoteChecklist, saveRemoteChecklist } from "./checklistRemote";

export function useChecklist() {
  const { user } = useAuth();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    if (user) {
      const remote = await fetchRemoteChecklist(user.id);
      if (remote === null) {
        // First time this user is signed in — seed the cloud with local/default items.
        const seeded = loadLocal();
        await saveRemoteChecklist(user.id, seeded);
        setItems(seeded);
      } else {
        setItems(remote);
      }
    } else {
      setItems(loadLocal());
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const persist = useCallback(async (next: ChecklistItem[]) => {
    setItems(next);
    if (user) await saveRemoteChecklist(user.id, next);
    else saveLocal(next);
  }, [user]);

  return { items, loading, persist, refresh, cloudSynced: Boolean(user) };
}
