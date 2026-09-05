export type Lang = "en" | "tr";
export type ThemeMode = "light" | "dark";
export type AccentTheme = "amber" | "crimson" | "blue" | "emerald";
export type Decision = "ready" | "pause" | "unclear" | "invalid";
export type TradeResult = "win" | "loss" | "breakeven" | "pending";

export type DecisionRecord = {
  id: string;
  createdAt: string; // ISO date
  pair: string;
  direction: "Bullish" | "Bearish" | "Unknown";
  score: number;
  decision: Decision;
  answers: Record<string, string>;
  reasoning: string;
  invalidation: string;
  sentence: string;
  result: TradeResult;
  rr?: number;
};

export type UserProfile = {
  username: string;
  memberSince: string; // ISO date
  theme: ThemeMode;
  accent: AccentTheme;
  lang: Lang;
};

export type SetupTemplate = {
  id: string;
  name: string;
  createdAt: string;
  pair: string;
  prefill: Record<string, string>; // subset of WHY answers (bias, htf, liquidity, structure, evidence)
};

export type ChecklistItem = { id: string; label: string; checked: boolean };
