import { supabase } from "./supabase";
import type { SetupTemplate } from "./types";

type Row = {
  id: string;
  user_id: string;
  created_at: string;
  name: string;
  pair: string;
  prefill: Record<string, string>;
};

function rowToRecord(row: Row): SetupTemplate {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    pair: row.pair,
    prefill: row.prefill ?? {},
  };
}

export async function fetchRemoteSetups(userId: string): Promise<SetupTemplate[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("setups")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) { console.error("fetchRemoteSetups error:", error.message); return []; }
  return (data as Row[]).map(rowToRecord);
}

export async function insertRemoteSetup(userId: string, setup: SetupTemplate) {
  if (!supabase) return;
  const { error } = await supabase.from("setups").insert({
    id: setup.id,
    user_id: userId,
    created_at: setup.createdAt,
    name: setup.name,
    pair: setup.pair,
    prefill: setup.prefill,
  });
  if (error) console.error("insertRemoteSetup error:", error.message);
}

export async function deleteRemoteSetup(id: string) {
  if (!supabase) return;
  const { error } = await supabase.from("setups").delete().eq("id", id);
  if (error) console.error("deleteRemoteSetup error:", error.message);
}
