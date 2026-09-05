import type { ChecklistItem, DecisionRecord, SetupTemplate, UserProfile } from "./types";

const DECISIONS_KEY = "why.decisions.v1";
const PROFILE_KEY = "why.profile.v1";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadDecisions(): DecisionRecord[] {
  const list = safeParse<DecisionRecord[]>(localStorage.getItem(DECISIONS_KEY), []);
  return list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function saveDecision(record: DecisionRecord) {
  const list = loadDecisions();
  list.unshift(record);
  localStorage.setItem(DECISIONS_KEY, JSON.stringify(list));
}

export function updateDecisionResult(id: string, result: DecisionRecord["result"]) {
  const list = loadDecisions().map((d) => (d.id === id ? { ...d, result } : d));
  localStorage.setItem(DECISIONS_KEY, JSON.stringify(list));
}

export function deleteDecision(id: string) {
  const list = loadDecisions().filter((d) => d.id !== id);
  localStorage.setItem(DECISIONS_KEY, JSON.stringify(list));
}

const DEFAULT_PROFILE: UserProfile = {
  username: "Trader",
  memberSince: new Date().toISOString(),
  theme: "light",
  accent: "amber",
  lang: "en",
};

export function loadProfile(): UserProfile {
  const stored = safeParse<Partial<UserProfile>>(localStorage.getItem(PROFILE_KEY), {});
  return { ...DEFAULT_PROFILE, ...stored };
}

export function saveProfile(profile: UserProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

// ---------- Setup Library ----------
const SETUPS_KEY = "why.setups.v1";

export function loadSetups(): SetupTemplate[] {
  return safeParse<SetupTemplate[]>(localStorage.getItem(SETUPS_KEY), []).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function saveSetup(setup: SetupTemplate) {
  const list = loadSetups();
  list.unshift(setup);
  localStorage.setItem(SETUPS_KEY, JSON.stringify(list));
}

export function deleteSetup(id: string) {
  const list = loadSetups().filter((s) => s.id !== id);
  localStorage.setItem(SETUPS_KEY, JSON.stringify(list));
}

// ---------- Pending setup prefill (handoff from Setup Library -> WHY) ----------
const PENDING_PREFILL_KEY = "why.pendingPrefill.v1";

export function setPendingPrefill(prefill: Record<string, string>, pair: string) {
  sessionStorage.setItem(PENDING_PREFILL_KEY, JSON.stringify({ prefill, pair }));
}
export function consumePendingPrefill(): { prefill: Record<string, string>; pair: string } | null {
  const raw = sessionStorage.getItem(PENDING_PREFILL_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(PENDING_PREFILL_KEY);
  try { return JSON.parse(raw); } catch { return null; }
}

// ---------- Trade checklist (quick pre-trade checklist, independent of WHY) ----------
const CHECKLIST_KEY = "why.checklist.v1";
const DEFAULT_CHECKLIST_LABELS = [
  "Session/kill zone confirmed",
  "HTF bias checked",
  "News calendar checked",
  "Risk defined before entry",
  "Not revenge trading",
  "Not chasing price (no FOMO entry)",
];

export function loadChecklist(): ChecklistItem[] {
  const stored = safeParse<ChecklistItem[]>(localStorage.getItem(CHECKLIST_KEY), []);
  if (stored.length > 0) return stored;
  return DEFAULT_CHECKLIST_LABELS.map((label, i) => ({ id: `default-${i}`, label, checked: false }));
}

export function saveChecklist(items: ChecklistItem[]) {
  localStorage.setItem(CHECKLIST_KEY, JSON.stringify(items));
}
