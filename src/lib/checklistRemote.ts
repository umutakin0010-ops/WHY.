import { supabase } from "./supabase";
import type { ChecklistItem } from "./types";

type Row = { user_id: string; items: ChecklistItem[] };

export async function fetchRemoteChecklist(userId: string): Promise<ChecklistItem[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("checklists")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) { console.error("fetchRemoteChecklist error:", error.message); return null; }
  return data ? (data as Row).items ?? [] : null;
}

export async function saveRemoteChecklist(userId: string, items: ChecklistItem[]) {
  if (!supabase) return;
  const { error } = await supabase
    .from("checklists")
    .upsert({ user_id: userId, items, updated_at: new Date().toISOString() });
  if (error) console.error("saveRemoteChecklist error:", error.message);
}
