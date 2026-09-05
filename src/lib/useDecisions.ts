import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./auth";
import type { DecisionRecord } from "./types";
import { loadDecisions as loadLocal, saveDecision as saveLocal, updateDecisionResult as updateLocal, deleteDecision as deleteLocal } from "./storage";
import { fetchRemoteDecisions, insertRemoteDecision, updateRemoteDecisionResult, deleteRemoteDecision } from "./decisionsRemote";

export function useDecisions() {
  const { user } = useAuth();
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    if (user) {
      setDecisions(await fetchRemoteDecisions(user.id));
    } else {
      setDecisions(loadLocal());
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const add = useCallback(async (record: DecisionRecord) => {
    if (user) await insertRemoteDecision(user.id, record);
    else saveLocal(record);
    await refresh();
  }, [user, refresh]);

  const setResult = useCallback(async (id: string, result: DecisionRecord["result"]) => {
    if (user) await updateRemoteDecisionResult(id, result);
    else updateLocal(id, result);
    await refresh();
  }, [user, refresh]);

  const remove = useCallback(async (id: string) => {
    if (user) await deleteRemoteDecision(id);
    else deleteLocal(id);
    await refresh();
  }, [user, refresh]);

  return { decisions, loading, add, setResult, remove, refresh, cloudSynced: Boolean(user) };
}
