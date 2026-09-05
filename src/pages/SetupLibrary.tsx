import { useNavigate } from "react-router-dom";
import { Trash2, PlayCircle, Layers } from "lucide-react";
import type { Lang, UserProfile } from "../lib/types";
import { setPendingPrefill } from "../lib/storage";
import { useSetups } from "../lib/useSetups";

const copy = {
  en: {
    title: "Setup Library", empty: "No saved setups yet. Finish a WHY run and hit \"Save as Setup\" on the result screen to build your first one.",
    use: "Use this setup", delete: "Delete", created: "Created",
  },
  tr: {
    title: "Setup Library", empty: "Henüz kayıtlı setup yok. Bir WHY analizini bitirip sonuç ekranında \"Setup Olarak Kaydet\"e bas, ilkini oluştur.",
    use: "Bu setup'ı kullan", delete: "Sil", created: "Oluşturulma",
  },
};

export default function SetupLibrary({ profile }: { profile: UserProfile }) {
  const navigate = useNavigate();
  const lang: Lang = profile.lang;
  const t = copy[lang];
  const { setups, remove } = useSetups();
  const use = (setupId: string) => {
    const setup = setups.find((s) => s.id === setupId);
    if (!setup) return;
    setPendingPrefill(setup.prefill, setup.pair);
    navigate("/why");
  };

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, marginTop: 0 }}>{t.title}</h1>
      {setups.length === 0 ? (
        <div className="card"><p style={{ margin: 0, color: "var(--text-muted)", fontSize: 13.5 }}>{t.empty}</p></div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
          {setups.map((s) => (
            <div className="card bracket" key={s.id} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Layers size={14} color="var(--accent)" />
                <strong style={{ fontSize: 14 }}>{s.name}</strong>
              </div>
              <div style={{ fontSize: 11.5, color: "var(--text-faint)" }}>{s.pair} · {t.created} {new Date(s.createdAt).toLocaleDateString()}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {Object.entries(s.prefill).filter(([, v]) => v).map(([k, v]) => (
                  <span key={k} className="pill pill-neutral" style={{ fontFamily: "var(--font-body)" }}>{v.split(",")[0]}{v.split(",").length > 1 ? ` +${v.split(",").length - 1}` : ""}</span>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button className="btn btn-primary btn-sm" onClick={() => use(s.id)} style={{ flex: 1 }}><PlayCircle size={14} />{t.use}</button>
                <button className="btn btn-ghost btn-sm" onClick={() => remove(s.id)}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
