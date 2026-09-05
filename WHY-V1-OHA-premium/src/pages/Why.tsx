import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, RotateCcw, ShieldAlert, ShieldCheck, Sparkles, Target, Zap, BookmarkPlus } from "lucide-react";
import type { Decision, Lang, UserProfile } from "../lib/types";
import { consumePendingPrefill } from "../lib/storage";
import { useDecisions } from "../lib/useDecisions";
import { useSetups } from "../lib/useSetups";
import { analyzeLanguage } from "../lib/language";
import { useCountUp } from "../lib/useCountUp";
import "./Why.css";

// Answers that indicate the trader actually lacks something (no evidence, no clarity) —
// distinct per question because "unclear" means something different on each checkpoint.
const WEAK_ANSWERS: Record<string, string[]> = {
  bias: ["Unknown"],
  liquidity: ["Unclear"],
  structure: ["Range / unclear"],
};

const BELIEF_WARNINGS = {
  en: [
    { title: "Belief detected, not evidence.", body: "Your thesis leans on conviction language rather than observable evidence. The market does not care what you believe." },
    { title: "That's a feeling, not a setup.", body: "Nothing in this thesis points to something that actually happened on the chart. Feelings don't move price." },
    { title: "You're predicting, not reading.", body: "This reads like a guess dressed up as analysis. Go back and find what's observable, not what you hope for." },
    { title: "Conviction isn't confirmation.", body: "Being sure and being right are different things. The thesis needs proof from price, not certainty from you." },
    { title: "The chart didn't say this. You did.", body: "This thesis sounds like a story you're telling yourself, not something the market showed you." },
  ],
  tr: [
    { title: "Bu bir kanıt değil, bir inanç.", body: "Thesis'in gözlemlenebilir kanıttan çok inanç diline dayanıyor. Market senin neye inandığını umursamaz." },
    { title: "Bu bir setup değil, bir his.", body: "Bu thesis'te grafikte gerçekten olmuş bir şeye işaret eden hiçbir şey yok. His fiyatı hareket ettirmez." },
    { title: "Okumuyorsun, tahmin ediyorsun.", body: "Bu analiz kılığına girmiş bir tahmin gibi okunuyor. Geri dön, umduğun şeyi değil gözlemlenebilir olanı bul." },
    { title: "Emin olmak, doğrulanmak değildir.", body: "Emin olmakla haklı olmak farklı şeyler. Thesis'in senin kesinliğine değil, fiyatın kanıtına ihtiyacı var." },
    { title: "Grafik bunu söylemedi. Sen söyledin.", body: "Bu thesis, market'in sana gösterdiği bir şey değil, kendine anlattığın bir hikâye gibi duruyor." },
  ],
};

type QuestionType = "choice" | "textarea" | "multiselect" | "risk" | "info";
type QuestionOption = { value: string; label: Record<Lang, string>; tone?: "positive" | "negative" | "neutral" };
type Question = {
  id: string;
  section: Record<Lang, string>;
  title: Record<Lang, string>;
  description: Record<Lang, string>;
  type: QuestionType;
  options?: QuestionOption[];
  placeholder?: Record<Lang, string>;
  exclusive?: string;
};

const copy = {
  en: {
    enter: "Enter WHY", back: "Back", next: "Continue", finish: "Run analysis", reset: "Start over",
    oneSentence: "Compress the thesis.", oneSentenceHint: "If you cannot explain the trade in one clean sentence, the edge is not clear enough yet.",
    ready: "READY", pause: "PAUSE", unclear: "UNCLEAR", invalid: "INVALID",
    readyText: "The reasoning is coherent enough to execute the plan you described. Protect the invalidation. Do not improvise.",
    pauseText: "Your thesis has a gap. The best trade right now may be no trade. Resolve the weak point before execution.",
    unclearText: "There are conflicting or undefined inputs. You have information, but not enough clarity to act with conviction.",
    invalidText: "This setup is structurally broken — your own inputs contradict each other, or the risk data doesn't hold up. This is not a trade to manage. It's a trade to skip.",
    why: "Why", invalidation: "Invalidation", summary: "Protocol snapshot", noAnswer: "Not answered", warning: "Clarity is the goal — not a prediction.",
    score: "Clarity score", pairLabel: "Which pair / asset?", heroCopy: "A pre-trade clarity protocol for traders who refuse to click first and think later.",
    analyzing: "Reading the thesis", analyzingSub: "Cross-checking context, evidence, contradictions, risk and psychology.",
    biasWarn: "Bias not defined.", biasWarnSub: "Do not force a direction. Re-evaluate context before execution.",
    savedNote: "Saved to your journal.",
    checkpoint: "CHECKPOINT",
    breakdown: "Score breakdown",
    weakAnswers: "weak checkpoint answers", beliefLang: "belief language detected", evidenceLang: "evidence language found",
    none: "None of these",
    contradictionsClear: "No structural contradictions found between your inputs.",
    riskEntry: "Entry price", riskStop: "Stop price", riskTarget: "Target price",
    riskBalance: "Account balance", riskPercent: "Risk %", riskCash: "Risk amount", positionSize: "Position size",
    riskAmountLabel: "Stop distance", rrLabel: "R:R", riskMissing: "Fill entry and stop to continue — invalidation without risk isn't a plan.",
    sections: {
      context: "Market Context", thesis: "Thesis", evidence: "Evidence", contradictions: "Contradictions",
      invalidation: "Invalidation", risk: "Risk", psychology: "Psychology", finalDecision: "Final Decision",
    },
  },
  tr: {
    enter: "WHY'a gir", back: "Geri", next: "Devam", finish: "Analizi çalıştır", reset: "Baştan başla",
    oneSentence: "Thesis'i sıkıştır.", oneSentenceHint: "İşlemi tek temiz cümlede açıklayamıyorsan edge henüz yeterince net değil.",
    ready: "READY", pause: "PAUSE", unclear: "UNCLEAR", invalid: "INVALID",
    readyText: "Reasoning, tarif ettiğin planı uygulamak için yeterince tutarlı. Invalidation'ı koru. Doğaçlama yapma.",
    pauseText: "Thesis'inde bir boşluk var. Şu anki en iyi trade hiç trade almamak olabilir. İşleme girmeden zayıf noktayı çöz.",
    unclearText: "Çelişen ya da tanımsız noktalar var. Bilgin var ama kararlılıkla hareket edecek kadar netlik yok.",
    invalidText: "Bu setup yapısal olarak bozuk — kendi inputların birbiriyle çelişiyor ya da risk verisi tutmuyor. Bu yönetilecek bir trade değil, geçilecek bir trade.",
    why: "Neden", invalidation: "Invalidation", summary: "Karar özeti", noAnswer: "Cevaplanmadı", warning: "Amaç tahmin değil — netlik.",
    score: "Netlik skoru", pairLabel: "Hangi pair / asset?", heroCopy: "İşleme girmeden önce düşünmeyi reddetmeyen trader'lar için netlik protokolü.",
    analyzing: "Thesis okunuyor", analyzingSub: "Context, kanıt, çelişki, risk ve psikoloji çapraz kontrol ediliyor.",
    biasWarn: "Bias tanımlı değil.", biasWarnSub: "Yönü zorlama. Execution öncesi context'i tekrar değerlendir.",
    savedNote: "Journal'ına kaydedildi.",
    checkpoint: "CHECKPOINT",
    breakdown: "Score breakdown",
    weakAnswers: "zayıf checkpoint cevabı", beliefLang: "inanç dili tespit edildi", evidenceLang: "kanıt dili bulundu",
    none: "Bunlardan hiçbiri",
    contradictionsClear: "Cevaplarında yapısal bir çelişki bulunamadı.",
    riskEntry: "Entry fiyatı", riskStop: "Stop fiyatı", riskTarget: "Target fiyatı",
    riskBalance: "Hesap bakiyesi", riskPercent: "Risk %", riskCash: "Risk miktarı", positionSize: "Pozisyon büyüklüğü",
    riskAmountLabel: "Stop mesafesi", rrLabel: "R:R", riskMissing: "Devam etmek için entry ve stop gir — risksiz invalidation bir plan değildir.",
    sections: {
      context: "Market Context", thesis: "Thesis", evidence: "Evidence", contradictions: "Contradictions",
      invalidation: "Invalidation", risk: "Risk", psychology: "Psychology", finalDecision: "Final Decision",
    },
  },
};

const questions: Question[] = [
  { id: "bias", section: { en: "Market Context", tr: "Market Context" }, title: { en: "What's your Bias?", tr: "Bias'ın ne?" }, description: { en: "State the directional thesis before the chart starts telling you a story.", tr: "Grafiğin sana hikâye anlatmasına izin vermeden directional thesis'ini söyle." }, type: "choice", options: [
    { value: "Bullish", label: { en: "Bullish", tr: "Bullish" }, tone: "positive" }, { value: "Bearish", label: { en: "Bearish", tr: "Bearish" }, tone: "negative" }, { value: "Unknown", label: { en: "I don't know", tr: "Bilmiyorum" }, tone: "neutral" }] },
  { id: "htf", section: { en: "Market Context", tr: "Market Context" }, title: { en: "HTF Context", tr: "HTF Context" }, description: { en: "Name the environment. Expansion, retracement, range — context before trigger.", tr: "Ortamı isimlendir. Expansion, retracement, range — trigger'dan önce context." }, type: "choice", options: ["Expansion", "Retracement", "Consolidation", "Range", "Premium", "Discount", "Other"].map(value => ({ value, label: { en: value, tr: value } })) },
  { id: "liquidity", section: { en: "Market Context", tr: "Market Context" }, title: { en: "Where is the liquidity?", tr: "Liquidity nerede?" }, description: { en: "Mark what you see. WHY does not predict which liquidity gets taken.", tr: "Gördüğünü işaretle. WHY hangi liquidity'nin alınacağını tahmin etmez." }, type: "choice", options: ["Buy-side", "Sell-side", "Both", "Unclear"].map(value => ({ value, label: { en: value, tr: value }, tone: value === "Unclear" ? "neutral" : undefined })) },
  { id: "structure", section: { en: "Market Context", tr: "Market Context" }, title: { en: "Market Structure", tr: "Market Structure" }, description: { en: "Read the structure you actually have — not the structure you want.", tr: "İstediğin yapıyı değil, gerçekten gördüğün yapıyı oku." }, type: "choice", options: ["Bullish", "Bearish", "Range / unclear"].map(value => ({ value, label: { en: value, tr: value }, tone: value.includes("unclear") ? "neutral" : value === "Bullish" ? "positive" : "negative" })) },
  { id: "reasoning", section: { en: "Thesis", tr: "Thesis" }, title: { en: "Why are you taking this trade?", tr: "Bu işlemi neden alıyorsun?" }, description: { en: "Write the thesis in your own words. WHY never writes the answer for you.", tr: "Thesis'ini kendi kelimelerinle yaz. WHY cevabı senin yerine yazmaz." }, type: "textarea", placeholder: { en: "Liquidity sweep → displacement → FVG → entry because...", tr: "Liquidity sweep → displacement → FVG → entry çünkü..." } },
  { id: "evidence", section: { en: "Evidence", tr: "Evidence" }, title: { en: "What actually happened on the chart?", tr: "Grafikte gerçekten ne oldu?" }, description: { en: "Select everything you can point to — not what you hope is there. Zero selections is a valid, if weak, answer.", tr: "Umduğun şeyi değil, gerçekten gösterebileceğin her şeyi seç. Hiçbir şey seçmemek de geçerli (ama zayıf) bir cevap." }, type: "multiselect", options: ["Displacement", "FVG / IFVG reaction", "Liquidity sweep confirmed", "MSS / BOS", "Order Block reaction", "Session alignment", "HTF confluence"].map(value => ({ value, label: { en: value, tr: value } })) },
  { id: "contradictions", section: { en: "Contradictions", tr: "Contradictions" }, title: { en: "System check", tr: "Sistem kontrolü" }, description: { en: "WHY cross-checks your own answers against each other before you go further.", tr: "WHY, ileri gitmeden önce kendi cevaplarını birbiriyle çapraz kontrol ediyor." }, type: "info" },
  { id: "invalidation", section: { en: "Invalidation", tr: "Invalidation" }, title: { en: "Where are you wrong?", tr: "Nerede yanılırsın?" }, description: { en: "Define the condition that kills the thesis. Entry is not invalidation.", tr: "Thesis'i öldüren koşulu tanımla. Entry, invalidation değildir." }, type: "textarea", placeholder: { en: "My thesis is invalid if price...", tr: "Thesis'im şu durumda geçersiz..." } },
  { id: "risk", section: { en: "Risk", tr: "Risk" }, title: { en: "Define the trade.", tr: "İşlemi tanımla." }, description: { en: "Entry, stop, target. No thesis is complete without a number attached to it.", tr: "Entry, stop, target. Hiçbir thesis, bir sayıya bağlanmadan tamamlanmış sayılmaz." }, type: "risk" },
  { id: "psychology", section: { en: "Psychology", tr: "Psychology" }, title: { en: "Check yourself.", tr: "Kendini kontrol et." }, description: { en: "Be honest — this only works if you are. Select anything that's true right now.", tr: "Dürüst ol — bu ancak dürüst olursan işe yarar. Şu an doğru olan her şeyi seç." }, type: "multiselect", exclusive: "None", options: [
    { value: "FOMO", label: { en: "FOMO", tr: "FOMO" } }, { value: "Revenge", label: { en: "Revenge trading", tr: "Revenge trading" } },
    { value: "Boredom", label: { en: "Boredom", tr: "Sıkılganlık" } }, { value: "Overconfidence", label: { en: "Overconfidence", tr: "Aşırı özgüven" } },
    { value: "None", label: { en: "None of these", tr: "Bunlardan hiçbiri" } },
  ] },
  { id: "sentence", section: { en: "Final Decision", tr: "Final Decision" }, title: { en: "Compress the thesis.", tr: "Thesis'i sıkıştır." }, description: { en: "If you cannot explain the trade in one clean sentence, the edge is not clear enough yet.", tr: "İşlemi tek temiz cümlede açıklayamıyorsan edge henüz yeterince net değil." }, type: "textarea", placeholder: { en: "I am taking this trade because...", tr: "Bu işlemi alıyorum çünkü..." } },
];

export default function Why({ profile }: { profile: UserProfile }) {
  const navigate = useNavigate();
  const lang: Lang = profile.lang;
  const t = copy[lang];

  const [started, setStarted] = useState(false);
  const [pair, setPair] = useState("EUR/USD");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [calculating, setCalculating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [saved, setSaved] = useState(false);
  const [beliefWarningIdx, setBeliefWarningIdx] = useState(0);
  const [setupName, setSetupName] = useState("");
  const [setupSaved, setSetupSaved] = useState(false);

  useEffect(() => {
    const pending = consumePendingPrefill();
    if (pending) {
      setAnswers((prev) => ({ ...prev, ...pending.prefill }));
      setPair(pending.pair);
    }
  }, []);

  const current = questions[step];
  const isLastStep = step === questions.length - 1;
  const progress = Math.round(((step + 1) / questions.length) * 100);

  const updateAnswer = (value: string) => setAnswers((prev) => ({ ...prev, [current.id]: value }));

  const selectedList = (id: string) => (answers[id] ?? "").split(",").filter(Boolean);
  const toggleMulti = (id: string, value: string, exclusiveValue?: string) => {
    const list = selectedList(id);
    let next: string[];
    if (exclusiveValue && value === exclusiveValue) {
      next = list.includes(value) ? [] : [value];
    } else if (list.includes(value)) {
      next = list.filter((v) => v !== value);
    } else {
      next = [...list.filter((v) => v !== exclusiveValue), value];
    }
    setAnswers((prev) => ({ ...prev, [id]: next.join(",") }));
  };

  const riskEntry = parseFloat(answers.riskEntry ?? "");
  const riskStop = parseFloat(answers.riskStop ?? "");
  const riskTarget = parseFloat(answers.riskTarget ?? "");
  const riskBalance = parseFloat(answers.riskBalance ?? "");
  const riskPercent = parseFloat(answers.riskPercent ?? "");
  const stopDistance = Math.abs(riskEntry - riskStop);
  const riskValid = !isNaN(riskEntry) && !isNaN(riskStop) && stopDistance > 0;
  const rr = riskValid && !isNaN(riskTarget) ? Math.abs(riskTarget - riskEntry) / stopDistance : undefined;
  const riskCash = !isNaN(riskBalance) && !isNaN(riskPercent) ? (riskBalance * riskPercent) / 100 : undefined;
  const positionSize = riskValid && riskCash !== undefined ? riskCash / stopDistance : undefined;

  const canAdvance = (() => {
    if (current.type === "textarea") return Boolean((answers[current.id] ?? "").trim());
    if (current.type === "choice") return Boolean(answers[current.id]);
    if (current.type === "multiselect") return true;
    if (current.type === "info") return true;
    if (current.type === "risk") return riskValid;
    return true;
  })();

  const contradictions = useMemo(() => {
    const items: string[] = [];
    const bias = answers.bias;
    const structure = answers.structure;
    const evidenceCount = selectedList("evidence").length;
    let structureMismatch = false;

    if (bias && structure && ((bias === "Bullish" && structure === "Bearish") || (bias === "Bearish" && structure === "Bullish"))) {
      structureMismatch = true;
      items.push(lang === "en" ? "Your bias directly contradicts the market structure you selected." : "Bias'ın seçtiğin market structure ile doğrudan çelişiyor.");
    }
    if ((bias === "Bullish" || bias === "Bearish") && evidenceCount === 0) {
      items.push(lang === "en" ? "You picked a clear direction but selected zero pieces of evidence for it." : "Net bir yön seçtin ama onun için sıfır kanıt işaretledin.");
    }
    return { items, structureMismatch, evidenceCount };
  }, [answers, lang]);

  const metrics = useMemo(() => {
    const weakQuestions = questions.filter((q) => WEAK_ANSWERS[q.id]?.includes(answers[q.id] ?? "")).length;
    const evidenceList = selectedList("evidence");
    const psychologyList = selectedList("psychology").filter((v) => v !== "None");

    const combinedText = `${answers.reasoning ?? ""} ${answers.sentence ?? ""}`;
    const { beliefMatches, evidenceMatches } = analyzeLanguage(combinedText);
    const beliefDominant = beliefMatches.length > evidenceMatches.length;

    const reasoningLen = answers.reasoning?.trim().length ?? 0;
    const invalidationLen = answers.invalidation?.trim().length ?? 0;
    const oneLineLen = answers.sentence?.trim().length ?? 0;

    const breakdown: { label: string; delta: number }[] = [];
    let raw = 78;

    if (weakQuestions > 0) {
      const delta = -weakQuestions * 10;
      raw += delta;
      breakdown.push({ label: lang === "en" ? `${weakQuestions} weak checkpoint answer(s)` : `${weakQuestions} zayıf checkpoint cevabı`, delta });
    }
    if (evidenceList.length > 0) {
      const delta = Math.min(evidenceList.length, 5) * 6;
      raw += delta;
      breakdown.push({ label: lang === "en" ? `evidence checklist (${evidenceList.length})` : `evidence checklist (${evidenceList.length})`, delta });
    } else if (answers.bias === "Bullish" || answers.bias === "Bearish") {
      const delta = -20;
      raw += delta;
      breakdown.push({ label: lang === "en" ? "directional bias, zero evidence" : "yön var, evidence yok", delta });
    }
    if (evidenceMatches.length > 0) {
      const delta = Math.min(evidenceMatches.length, 4) * 5;
      raw += delta;
      breakdown.push({ label: `${t.evidenceLang} (${evidenceMatches.length})`, delta });
    }
    if (beliefMatches.length > 0) {
      const delta = -Math.min(beliefMatches.length, 4) * 11;
      raw += delta;
      breakdown.push({ label: `${t.beliefLang} (${beliefMatches.length})`, delta });
    }
    if (psychologyList.length > 0) {
      const delta = -Math.min(psychologyList.length, 3) * 15;
      raw += delta;
      breakdown.push({ label: lang === "en" ? `psychological red flag(s) (${psychologyList.length})` : `psikolojik red flag (${psychologyList.length})`, delta });
    }
    if (rr !== undefined) {
      const delta = rr >= 2 ? 10 : rr >= 1.5 ? 5 : rr < 1 ? -15 : 0;
      if (delta !== 0) {
        raw += delta;
        breakdown.push({ label: `${t.rrLabel} ${rr.toFixed(2)}`, delta });
      }
    }
    const lengthBonus = Math.round(Math.min(reasoningLen, 80) * 0.08 + Math.min(invalidationLen, 60) * 0.08 + Math.min(oneLineLen, 80) * 0.05);
    if (lengthBonus > 0) {
      raw += lengthBonus;
      breakdown.push({ label: lang === "en" ? "depth of reasoning" : "reasoning derinliği", delta: lengthBonus });
    }

    let score = Math.max(0, Math.min(100, Math.round(raw)));
    if (beliefDominant) score = Math.min(score, 58);

    const structuralBreak = contradictions.structureMismatch || !riskValid || psychologyList.length >= 2;

    let decision: Decision;
    if (structuralBreak) {
      score = Math.min(score, 35);
      decision = "invalid";
    } else if (beliefDominant) {
      decision = score >= 50 ? "unclear" : "pause";
    } else {
      decision = score >= 78 && weakQuestions <= 1 && evidenceList.length >= 1 ? "ready" : score >= 55 ? "unclear" : "pause";
    }

    return { score, decision, weakQuestions, beliefDominant, beliefMatches, evidenceMatches, breakdown, evidenceList, psychologyList };
  }, [answers, lang, t, contradictions, riskValid, rr]);

  const animatedScore = useCountUp(showResult ? metrics.score : 0, 900);

  const reset = () => {
    setStarted(false); setStep(0); setAnswers({}); setShowResult(false); setCalculating(false); setSaved(false);
    setSetupName(""); setSetupSaved(false);
  };

  const { add: addDecision } = useDecisions();
  const { add: addSetup } = useSetups();

  const analyze = () => {
    setBeliefWarningIdx(Math.floor(Math.random() * BELIEF_WARNINGS.en.length));
    setCalculating(true);
    window.setTimeout(() => {
      setCalculating(false);
      setShowResult(true);
      if (!saved) {
        addDecision({
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          pair: pair || "—",
          direction: (answers.bias as "Bullish" | "Bearish" | "Unknown") ?? "Unknown",
          score: metrics.score,
          decision: metrics.decision,
          answers: { ...answers },
          reasoning: answers.reasoning ?? "",
          invalidation: answers.invalidation ?? "",
          sentence: answers.sentence ?? "",
          result: "pending",
          rr,
        });
        setSaved(true);
      }
    }, 1200);
  };

  if (!started) {
    return (
      <div className="why-intro sweep-field" style={{ paddingTop: 36 }}>
        <div className="why-eyebrow"><Sparkles size={12} /> {lang === "en" ? "Trade with intention" : "Niyetle trade et"}</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(40px,7vw,64px)", letterSpacing: "-.03em", margin: "14px 0" }}>WHY<span style={{ color: "var(--accent)" }}>.</span></h1>
        <p className="why-hero-copy">{t.heroCopy}</p>
        <div className="card-label" style={{ textAlign: "center" }}>{t.pairLabel}</div>
        <input className="why-pair-input" value={pair} onChange={(e) => setPair(e.target.value.toUpperCase())} placeholder="EUR/USD" />
        <div>
          <button className="btn btn-primary" onClick={() => setStarted(true)}>
            {t.enter} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-faint)", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 700, marginBottom: 18 }}>
          <Zap size={13} /> {pair} · {t.savedNote}
        </div>
        <div className="why-verdict bracket">
          <div>
            <div className={`why-decision-word ${metrics.decision}`}>{t[metrics.decision]}</div>
            <p style={{ color: "var(--text-muted)", fontSize: 13.5, lineHeight: 1.7, marginTop: 14, maxWidth: 460 }}>
              {metrics.decision === "ready" ? t.readyText : metrics.decision === "pause" ? t.pauseText : metrics.decision === "invalid" ? t.invalidText : t.unclearText}
            </p>
          </div>
          <div className="why-score-ring" style={{ background: `conic-gradient(var(--accent) ${animatedScore * 3.6}deg, var(--bg-soft) 0)` }}>
            <div><strong>{animatedScore}</strong><span>/100</span></div>
          </div>
        </div>

        {metrics.beliefDominant && (
          <div className="why-notice" style={{ borderColor: "var(--negative)", background: "var(--negative-soft)", marginTop: 0, marginBottom: 18 }}>
            <ShieldAlert size={17} />
            <div>
              <strong style={{ display: "block", marginBottom: 3 }}>{BELIEF_WARNINGS[lang][beliefWarningIdx].title}</strong>
              {BELIEF_WARNINGS[lang][beliefWarningIdx].body}
            </div>
          </div>
        )}

        {contradictions.items.length > 0 && (
          <div className="why-notice" style={{ borderColor: "var(--negative)", background: "var(--negative-soft)", marginTop: 0, marginBottom: 18, flexDirection: "column", gap: 6 }}>
            {contradictions.items.map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 10 }}><ShieldAlert size={15} style={{ flexShrink: 0, marginTop: 1 }} />{c}</div>
            ))}
          </div>
        )}

        <div className="card" style={{ marginBottom: 14 }}>
          <div className="card-label">{t.breakdown}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {metrics.breakdown.map((b, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                <span style={{ color: "var(--text-muted)" }}>{b.label}</span>
                <span style={{ fontWeight: 700, color: b.delta >= 0 ? "var(--positive)" : "var(--negative)" }}>
                  {b.delta >= 0 ? "+" : ""}{b.delta}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div className="card">
            <div className="card-label">{t.why}</div>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{answers.reasoning || t.noAnswer}</p>
          </div>
          <div className="card">
            <div className="card-label">{t.invalidation}</div>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{answers.invalidation || t.noAnswer}</p>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 14, background: "var(--accent-soft)", border: "1px solid transparent" }}>
          <div className="card-label" style={{ color: "var(--accent)" }}>{lang === "en" ? "Compressed thesis" : "Sıkıştırılmış thesis"}</div>
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.7, fontWeight: 600 }}>{answers.sentence || t.noAnswer}</p>
        </div>

        {riskValid && (
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-label">{t.sections.risk}</div>
            <div className="why-risk-summary" style={{ marginTop: 0, paddingTop: 0, borderTop: "none" }}>
              <div><span>{t.riskEntry}</span><strong>{riskEntry}</strong></div>
              <div><span>{t.riskStop}</span><strong>{riskStop}</strong></div>
              {!isNaN(riskTarget) && <div><span>{t.riskTarget}</span><strong>{riskTarget}</strong></div>}
              {rr !== undefined && <div><span>{t.rrLabel}</span><strong>{rr.toFixed(2)}</strong></div>}
              {positionSize !== undefined && <div><span>{t.riskCash}</span><strong>{riskCash?.toFixed(2)}</strong></div>}
              {positionSize !== undefined && <div><span>{t.positionSize}</span><strong>{positionSize.toFixed(2)}</strong></div>}
            </div>
          </div>
        )}

        <div className="why-summary-card">
          {questions.filter((q) => q.type === "choice" || q.type === "multiselect").map((q) => (
            <div className="why-summary-row" key={q.id}>
              <span>{q.title[lang]}</span>
              <strong>{answers[q.id] ? answers[q.id].split(",").join(", ") : t.noAnswer}</strong>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {!setupSaved ? (
              <>
                <input
                  value={setupName}
                  onChange={(e) => setSetupName(e.target.value)}
                  placeholder={lang === "en" ? "Setup name..." : "Setup adı..."}
                  style={{ height: 36, borderRadius: 9, border: "1px solid var(--border)", background: "var(--card-soft)", color: "var(--text)", padding: "0 12px", fontSize: 12.5, width: 170 }}
                />
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={!setupName.trim()}
                  onClick={() => {
                    addSetup({
                      id: crypto.randomUUID(),
                      name: setupName.trim(),
                      createdAt: new Date().toISOString(),
                      pair,
                      prefill: {
                        bias: answers.bias ?? "", htf: answers.htf ?? "", liquidity: answers.liquidity ?? "",
                        structure: answers.structure ?? "", evidence: answers.evidence ?? "",
                      },
                    });
                    setSetupSaved(true);
                  }}
                >
                  <BookmarkPlus size={14} /> {lang === "en" ? "Save as Setup" : "Setup Olarak Kaydet"}
                </button>
              </>
            ) : (
              <span style={{ fontSize: 12, color: "var(--positive)", fontWeight: 700 }}>
                {lang === "en" ? "Saved to Setup Library." : "Setup Library'ye kaydedildi."}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-secondary" onClick={() => navigate("/journal")}>{lang === "en" ? "Open Journal" : "Journal'ı Aç"}</button>
            <button className="btn btn-primary" onClick={reset}><RotateCcw size={15} />{t.reset}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 780, margin: "0 auto" }}>
      <div className="why-progress-wrap">
        <span className="why-progress-label">{String(step + 1).padStart(2, "0")}/{String(questions.length).padStart(2, "0")}</span>
        <div className="why-progress-track"><div className="why-progress-fill" style={{ width: `${progress}%` }} /></div>
        <span className="why-progress-label">{progress}%</span>
      </div>

      <div className="why-question" key={current.id}>
        <div className="why-eyebrow" style={{ justifyContent: "flex-start", marginBottom: 6, color: "var(--accent)" }}>{current.section[lang].toUpperCase()}</div>
        <div style={{ fontSize: 10.5, color: "var(--text-faint)", fontWeight: 700, letterSpacing: ".08em", marginBottom: 10 }}>{t.checkpoint} {String(step + 1).padStart(2, "0")}</div>
        <h1>{current.title[lang]}</h1>
        <p className="desc">{current.description[lang]}</p>

        {current.type === "choice" && (
          <div className="why-options">
            {current.options?.map((option) => {
              const selected = answers[current.id] === option.value;
              return (
                <button key={option.value} className={`why-option ${selected ? "selected" : ""} ${option.tone || ""}`} onClick={() => updateAnswer(option.value)}>
                  {option.label[lang]} {selected ? <Check size={15} /> : null}
                </button>
              );
            })}
          </div>
        )}

        {current.type === "textarea" && (
          <textarea className="why-textarea" autoFocus value={answers[current.id] ?? ""} onChange={(e) => updateAnswer(e.target.value)} placeholder={current.placeholder?.[lang]} />
        )}

        {current.type === "multiselect" && (
          <div className="why-options">
            {current.options?.map((option) => {
              const list = selectedList(current.id);
              const selected = list.includes(option.value);
              return (
                <button key={option.value} className={`why-option ${selected ? "selected" : ""}`} onClick={() => toggleMulti(current.id, option.value, current.exclusive)}>
                  {option.label[lang]} {selected ? <Check size={15} /> : null}
                </button>
              );
            })}
          </div>
        )}

        {current.type === "risk" && (
          <div>
            <div className="why-risk-grid">
              <div className="why-risk-field">
                <label>{t.riskEntry}</label>
                <input type="number" inputMode="decimal" value={answers.riskEntry ?? ""} onChange={(e) => setAnswers((p) => ({ ...p, riskEntry: e.target.value }))} placeholder="1.08500" />
              </div>
              <div className="why-risk-field">
                <label>{t.riskStop}</label>
                <input type="number" inputMode="decimal" value={answers.riskStop ?? ""} onChange={(e) => setAnswers((p) => ({ ...p, riskStop: e.target.value }))} placeholder="1.08200" />
              </div>
              <div className="why-risk-field">
                <label>{t.riskTarget}</label>
                <input type="number" inputMode="decimal" value={answers.riskTarget ?? ""} onChange={(e) => setAnswers((p) => ({ ...p, riskTarget: e.target.value }))} placeholder="1.09100" />
              </div>
              <div className="why-risk-field">
                <label>{t.riskBalance}</label>
                <input type="number" inputMode="decimal" value={answers.riskBalance ?? ""} onChange={(e) => setAnswers((p) => ({ ...p, riskBalance: e.target.value }))} placeholder="1000" />
              </div>
              <div className="why-risk-field">
                <label>{t.riskPercent}</label>
                <input type="number" inputMode="decimal" value={answers.riskPercent ?? ""} onChange={(e) => setAnswers((p) => ({ ...p, riskPercent: e.target.value }))} placeholder="1" />
              </div>
            </div>
            {riskValid ? (
              <div className="why-risk-summary">
                <div><span>{t.riskAmountLabel}</span><strong>{stopDistance.toFixed(5)}</strong></div>
                {rr !== undefined && <div><span>{t.rrLabel}</span><strong>{rr.toFixed(2)}</strong></div>}
                {positionSize !== undefined && <div><span>{t.riskCash}</span><strong>{riskCash?.toFixed(2)}</strong></div>}
                {positionSize !== undefined && <div><span>{t.positionSize}</span><strong>{positionSize.toFixed(2)}</strong></div>}
              </div>
            ) : (
              <div className="why-notice"><ShieldAlert size={17} /><div>{t.riskMissing}</div></div>
            )}
          </div>
        )}

        {current.type === "info" && (
          <div className="why-info-list">
            {contradictions.items.length === 0 ? (
              <div className="why-info-item clear"><ShieldCheck size={16} style={{ flexShrink: 0, marginTop: 1 }} />{t.contradictionsClear}</div>
            ) : (
              contradictions.items.map((c, i) => (
                <div className="why-info-item flag" key={i}><ShieldAlert size={16} style={{ flexShrink: 0, marginTop: 1 }} />{c}</div>
              ))
            )}
          </div>
        )}

        {current.id === "bias" && answers.bias === "Unknown" && (
          <div className="why-notice"><ShieldAlert size={17} /><div><strong style={{ display: "block", marginBottom: 3 }}>{t.biasWarn}</strong>{t.biasWarnSub}</div></div>
        )}
      </div>

      <div className="why-footer">
        <span style={{ fontSize: 11, color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 7 }}><Target size={13} />{t.warning}</span>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}><ArrowLeft size={15} />{t.back}</button>
          {!isLastStep ? (
            <button className="btn btn-primary" onClick={() => setStep(step + 1)} disabled={!canAdvance}>{t.next}<ArrowRight size={15} /></button>
          ) : (
            <button className="btn btn-primary" onClick={analyze} disabled={!canAdvance}>{t.finish}<Zap size={15} /></button>
          )}
        </div>
      </div>

      {calculating && (
        <div className="why-overlay">
          <div className="why-overlay-card">
            <div className="card-label">{t.analyzing}...</div>
            <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "8px 0 0" }}>{t.analyzingSub}</p>
          </div>
        </div>
      )}
    </div>
  );
}
