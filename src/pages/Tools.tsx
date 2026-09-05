import { useMemo, useState } from "react";
import { Check, Plus, RotateCcw, Trash2 } from "lucide-react";
import type { Lang, UserProfile } from "../lib/types";
import { useChecklist } from "../lib/useChecklist";

const copy = {
  en: {
    title: "Tools", calc: "Risk Calculator", balance: "Account balance", riskPct: "Risk %", entry: "Entry price",
    stop: "Stop price", riskAmount: "Risk amount", positionSize: "Position size (units)", rr: "Target R:R", target: "Target price",
    checklist: "Pre-Trade Checklist", checklistSub: "A fast pass before you touch the platform — independent of the full WHY protocol.",
    addPlaceholder: "Add a check item...", resetAll: "Reset all", progress: "complete",
  },
  tr: {
    title: "Tools", calc: "Risk Hesaplayıcı", balance: "Hesap bakiyesi", riskPct: "Risk %", entry: "Entry fiyatı",
    stop: "Stop fiyatı", riskAmount: "Risk miktarı", positionSize: "Pozisyon büyüklüğü (unit)", rr: "Hedef R:R", target: "Target fiyatı",
    checklist: "Pre-Trade Checklist", checklistSub: "Platforma dokunmadan önce hızlı bir kontrol — tam WHY protokolünden bağımsız.",
    addPlaceholder: "Kontrol maddesi ekle...", resetAll: "Hepsini sıfırla", progress: "tamamlandı",
  },
};

export default function Tools({ profile }: { profile: UserProfile }) {
  const lang: Lang = profile.lang;
  const t = copy[lang];
  const [balance, setBalance] = useState(1000);
  const [riskPct, setRiskPct] = useState(1);
  const [entry, setEntry] = useState(1.085);
  const [stop, setStop] = useState(1.08);
  const [rr, setRr] = useState(2);

  const riskAmount = (balance * riskPct) / 100;
  const stopDistance = Math.abs(entry - stop);
  const positionSize = stopDistance > 0 ? riskAmount / stopDistance : 0;
  const direction = entry >= stop ? 1 : -1;
  const target = entry + direction * stopDistance * rr;

  const { items, persist } = useChecklist();
  const [newItem, setNewItem] = useState("");
  const doneCount = useMemo(() => items.filter((i) => i.checked).length, [items]);

  const toggle = (id: string) => persist(items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));
  const remove = (id: string) => persist(items.filter((i) => i.id !== id));
  const add = () => {
    if (!newItem.trim()) return;
    persist([...items, { id: crypto.randomUUID(), label: newItem.trim(), checked: false }]);
    setNewItem("");
  };
  const resetAll = () => persist(items.map((i) => ({ ...i, checked: false })));

  const field = (label: string, value: number, onChange: (v: number) => void, step = 0.0001) => (
    <div>
      <div className="card-label">{label}</div>
      <input type="number" step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ width: "100%", height: 40, borderRadius: 10, border: "1px solid var(--border)", background: "var(--card-soft)", color: "var(--text)", padding: "0 12px", fontSize: 13.5 }} />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, margin: 0 }}>{t.title}</h1>

      <div className="card" style={{ maxWidth: 640 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div className="card-label" style={{ marginBottom: 4 }}>{t.checklist}</div>
            <p style={{ margin: "0 0 14px", fontSize: 12, color: "var(--text-muted)" }}>{t.checklistSub}</p>
          </div>
          <span className="pill pill-neutral" style={{ fontFamily: "var(--font-mono)" }}>{doneCount}/{items.length}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
          {items.map((item) => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 4px", borderBottom: "1px solid var(--border)" }}>
              <button
                onClick={() => toggle(item.id)}
                style={{
                  width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${item.checked ? "var(--positive)" : "var(--border-strong)"}`,
                  background: item.checked ? "var(--positive)" : "transparent", display: "grid", placeItems: "center", flexShrink: 0, padding: 0,
                }}
              >
                {item.checked && <Check size={13} color="#fff" strokeWidth={3} />}
              </button>
              <span style={{ fontSize: 13, flex: 1, textDecoration: item.checked ? "line-through" : "none", color: item.checked ? "var(--text-faint)" : "var(--text)" }}>
                {item.label}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={() => remove(item.id)} style={{ padding: 6 }}><Trash2 size={12} /></button>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder={t.addPlaceholder}
            style={{ flex: 1, height: 36, borderRadius: 9, border: "1px solid var(--border)", background: "var(--card-soft)", color: "var(--text)", padding: "0 12px", fontSize: 12.5 }}
          />
          <button className="btn btn-secondary btn-sm" onClick={add}><Plus size={14} /></button>
          <button className="btn btn-ghost btn-sm" onClick={resetAll}><RotateCcw size={13} />{t.resetAll}</button>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 520 }}>
        <div className="card-label">{t.calc}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
          {field(t.balance, balance, setBalance, 10)}
          {field(t.riskPct, riskPct, setRiskPct, 0.1)}
          {field(t.entry, entry, setEntry)}
          {field(t.stop, stop, setStop)}
          {field(t.rr, rr, setRr, 0.1)}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span style={{ color: "var(--text-muted)" }}>{t.riskAmount}</span><strong>{riskAmount.toFixed(2)}</strong></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span style={{ color: "var(--text-muted)" }}>{t.positionSize}</span><strong>{positionSize.toFixed(2)}</strong></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span style={{ color: "var(--text-muted)" }}>{t.target}</span><strong>{target.toFixed(5)}</strong></div>
        </div>
      </div>
    </div>
  );
}
