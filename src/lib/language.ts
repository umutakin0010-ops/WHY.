// Belief language = emotional/predictive conviction with no observable evidence behind it.
// Evidence language = references to things that actually happened on the chart.
// The goal: a trader who writes "I believe it will go down" should never score the same
// as a trader who writes "liquidity swept, displacement confirmed, FVG reaction."

const BELIEF_WORDS_TR = [
  "inanıyorum", "inanıyom", "bence", "hissediyorum", "sanırım", "sanıyorum",
  "eminim", "kesin", "kesinlikle", "göreceksin", "göreceğiz", "muhtemelen öyle olur",
  "gibi geliyor", "içime doğdu", "hislerime göre", "tahmin ediyorum", "umuyorum",
];
const EVIDENCE_WORDS_TR = [
  "sweep", "süpürdü", "aldı", "displacement", "structure kırıldı", "yapı kırıldı",
  "close verdi", "kapanış verdi", "reclaim", "confirm", "onayladı", "reaksiyon",
  "fvg", "ifvg", "order block", "ob", "mss", "bos", "choch", "likidite alındı",
  "retest", "displacement oldu",
];

const BELIEF_WORDS_EN = [
  "i believe", "i think", "i feel", "i guess", "i'm sure", "i am sure", "definitely",
  "certainly", "you'll see", "probably will", "feels like", "gut feeling", "my gut says",
  "i predict", "hopefully", "should go",
];
const EVIDENCE_WORDS_EN = [
  "sweep", "swept", "displacement", "structure broke", "broke structure", "closed",
  "reclaim", "confirm", "confirmed", "reaction", "fvg", "ifvg", "order block", "ob",
  "mss", "bos", "choch", "liquidity taken", "retest",
];

export type LanguageAnalysis = {
  beliefMatches: string[];
  evidenceMatches: string[];
};

export function analyzeLanguage(rawText: string): LanguageAnalysis {
  const text = rawText.toLowerCase();
  const beliefMatches = [...BELIEF_WORDS_TR, ...BELIEF_WORDS_EN].filter((w) => text.includes(w));
  const evidenceMatches = [...EVIDENCE_WORDS_TR, ...EVIDENCE_WORDS_EN].filter((w) => text.includes(w));
  return { beliefMatches, evidenceMatches };
}
