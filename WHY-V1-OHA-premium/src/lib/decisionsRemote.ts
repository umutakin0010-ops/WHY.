import { supabase } from "./supabase";
import type { DecisionRecord } from "./types";

type Row = {
  id: string;
  user_id: string;
  created_at: string;
  pair: string;
  direction: string;
  score: number;
  decision: string;
  answers: Record<string, string>;
  reasoning: string;
  invalidation: string;
  sentence: string;
  result: string;
  rr: number | null;
};

function rowToRecord(row: Row): DecisionRecord {
  return {
    id: row.id,
    createdAt: row.created_at,
    pair: row.pair,
    direction: row.direction as DecisionRecord["direction"],
    score: row.score,
    decision: row.decision as DecisionRecord["decision"],
    answers: row.answers ?? {},
    reasoning: row.reasoning ?? "",
    invalidation: row.invalidation ?? "",
    sentence: row.sentence ?? "",
    result: row.result as DecisionRecord["result"],
    rr: row.rr ?? undefined,
  };
}

export async function fetchRemoteDecisions(userId: string): Promise<DecisionRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("decisions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) { console.error("fetchRemoteDecisions error:", error.message); return []; }
  return (data as Row[]).map(rowToRecord);
}

export async function insertRemoteDecision(userId: string, record: DecisionRecord) {
  if (!supabase) return;
  const { error } = await supabase.from("decisions").insert({
    id: record.id,
    user_id: userId,
    created_at: record.createdAt,
    pair: record.pair,
    direction: record.direction,
    score: record.score,
    decision: record.decision,
    answers: record.answers,
    reasoning: record.reasoning,
    invalidation: record.invalidation,
    sentence: record.sentence,
    result: record.result,
    rr: record.rr ?? null,
  });
  if (error) console.error("insertRemoteDecision error:", error.message);
}

export async function updateRemoteDecisionResult(id: string, result: DecisionRecord["result"]) {
  if (!supabase) return;
  const { error } = await supabase.from("decisions").update({ result }).eq("id", id);
  if (error) console.error("updateRemoteDecisionResult error:", error.message);
}

export async function deleteRemoteDecision(id: string) {
  if (!supabase) return;
  const { error } = await supabase.from("decisions").delete().eq("id", id);
  if (error) console.error("deleteRemoteDecision error:", error.message);
}
