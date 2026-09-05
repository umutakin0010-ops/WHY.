import { supabase } from "./supabase";
import type { UserProfile } from "./types";

type Row = {
  user_id: string;
  username: string;
  member_since: string;
  theme: string;
  accent: string;
  lang: string;
};

function rowToProfile(row: Row): UserProfile {
  return {
    username: row.username,
    memberSince: row.member_since,
    theme: row.theme as UserProfile["theme"],
    accent: row.accent as UserProfile["accent"],
    lang: row.lang as UserProfile["lang"],
  };
}

export async function fetchRemoteProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) { console.error("fetchRemoteProfile error:", error.message); return null; }
  return data ? rowToProfile(data as Row) : null;
}

export async function saveRemoteProfile(userId: string, profile: UserProfile) {
  if (!supabase) return;
  const { error } = await supabase.from("profiles").upsert({
    user_id: userId,
    username: profile.username,
    member_since: profile.memberSince,
    theme: profile.theme,
    accent: profile.accent,
    lang: profile.lang,
    updated_at: new Date().toISOString(),
  });
  if (error) console.error("saveRemoteProfile error:", error.message);
}
