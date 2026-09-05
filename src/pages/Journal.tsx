import { useState } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import type { Lang, UserProfile } from "../lib/types";
import { useDecisions } from "../lib/useDecisions";

const copy = {
  en: { title: "Decision Journal", empty: "No decisions yet. Every WHY run lands here automatically.", all: "All", result: "Result", pending: "Pending", win: "Win", loss: "Loss", breakeven: "BE", delete: "Delete" },
  tr: { title: "Decision Journal", empty: "Henüz karar yok. Her WHY çalıştırması otomatik buraya düşer.", all: "Tümü", result: "Sonuç", pending: "Beklemede", win: "Kazandı", loss: "Kaybetti", breakeven: "BE", delete: "Sil" },
};

export default function Journal({ profile }: { profile: UserProfile }) {
  const lang: Lang = profile.lang;
  const t = copy[lang];
  const { decisions, setResult, remove } = useDecisions();
  const [filterDecision, setFilterDecision] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = decisions.filter((d) => filterDecision === "all" || d.decision === filterDecision);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, margin: 0 }}>{t.title}</h1>
        <div style={{ display: "flex", gap: 6 }}>
          {["all", "ready", "pause", "unclear", "invalid"].map((f) => (
            <button key={f} className={`btn btn-sm ${filterDecision === f ? "btn-primary" : "btn-secondary"}`} onClick={() => setFilterDecision(f)}>
              {f === "all" ? t.all : f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card"><p style={{ color: "var(--text-muted)", margin: 0, fontSize: 13.5 }}>{t.empty}</p></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((d) => {
            const open = openId === d.id;
            return (
              <div className="card" key={d.id} style={{ padding: 0, overflow: "hidden" }}>
                <button
                  onClick={() => setOpenId(open ? null : d.id)}
                  style={{ width: "100%", display: "grid", gridTemplateColumns: "120px 1fr 90px 90px 70px 24px", gap: 12, alignItems: "center", padding: "14px 18px", background: "transparent", border: "none", textAlign: "left" }}
                >
                  <strong style={{ fontSize: 13.5 }}>{d.pair}</strong>
                  <span style={{ fontSize: 12, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>{new Date(d.createdAt).toLocaleString()}</span>
                  <span className={`pill ${d.decision === "ready" ? "pill-positive" : d.decision === "unclear" ? "pill-warning" : "pill-negative"}`}>{d.decision.toUpperCase()}</span>
                  <span className={`pill ${d.result === "win" ? "pill-positive" : d.result === "loss" ? "pill-negative" : "pill-neutral"}`}>
                    {d.result === "pending" ? t.pending : d.result === "win" ? t.win : d.result === "loss" ? t.loss : t.breakeven}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 13, fontFamily: "var(--font-mono)" }}>{d.score}</span>
                  <ChevronDown size={16} style={{ transform: open ? "rotate(180deg)" : "none", transition: ".15s", justifySelf: "end" }} />
                </button>
                {open && (
                  <div style={{ padding: "0 18px 18px", borderTop: "1px solid var(--border)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 16 }}>
                      <div>
                        <div className="card-label">{lang === "en" ? "Why" : "Neden"}</div>
                        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "var(--text-muted)", whiteSpace: "pre-wrap" }}>{d.reasoning || "—"}</p>
                      </div>
                      <div>
                        <div className="card-label">{lang === "en" ? "Invalidation" : "Invalidation"}</div>
                        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "var(--text-muted)", whiteSpace: "pre-wrap" }}>{d.invalidation || "—"}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span style={{ fontSize: 11, color: "var(--text-faint)", alignSelf: "center", marginRight: 4 }}>{t.result}:</span>
                        <button className="btn btn-sm btn-secondary" onClick={() => setResult(d.id, "win")}>{t.win}</button>
                        <button className="btn btn-sm btn-secondary" onClick={() => setResult(d.id, "loss")}>{t.loss}</button>
                        <button className="btn btn-sm btn-secondary" onClick={() => setResult(d.id, "breakeven")}>{t.breakeven}</button>
                      </div>
                      <button className="btn btn-sm btn-ghost" onClick={() => remove(d.id)}><Trash2 size={13} />{t.delete}</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
