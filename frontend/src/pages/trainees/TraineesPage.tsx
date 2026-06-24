import { useEffect, useState } from "react";
import { X, Mail, Briefcase, Building2, BookOpen } from "lucide-react";
import { getTrainees, getTraineeHistory } from "@/api";
import type { Trainee } from "@/types";
import Badge from "@/components/ui/Badge";
import { useLang } from "@/i18n/LangContext";
import styles from "../trainings/TrainingsPage.module.css";

type HistoryEntry = {
  id: number;
  training: number;
  training_title: string;
  training_date: string | null;
  training_format: string;
  attended: boolean;
  completion_date: string | null;
  notes: string;
};

const FORMAT_LABELS: Record<string, string> = {
  online: "Online", offline: "Offline", mixed: "Blended",
};
const FORMAT_COLORS: Record<string, "success" | "info" | "warning"> = {
  online: "success", offline: "info", mixed: "warning",
};

export default function TraineesPage() {
  const { t } = useLang();
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ trainee: Trainee; history: HistoryEntry[] } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getTrainees({ search: search || undefined })
      .then((r) => { if (!cancelled) { setTrainees(r.data.results); setTotal(r.data.count); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [search]);

  const openProfile = (trainee: Trainee) => {
    setProfile({ trainee, history: [] });
    setProfileLoading(true);
    getTraineeHistory(trainee.id)
      .then((r) => setProfile({ trainee, history: r.data.results }))
      .finally(() => setProfileLoading(false));
  };

  const attended = profile?.history.filter((h) => h.attended).length ?? 0;
  const total_h = profile?.history.length ?? 0;

  return (
    <>
      <div className={styles.page}>
        <div className={styles.toolbar}>
          <input
            className={styles.search}
            placeholder="Поиск участника…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t("name")}</th>
                <th>{t("email")}</th>
                <th>{t("position")}</th>
                <th>{t("business_unit")}</th>
                <th>{t("department")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className={styles.center}>Загрузка…</td></tr>
              ) : trainees.length === 0 ? (
                <tr><td colSpan={5} className={styles.center}>Участники не найдены</td></tr>
              ) : trainees.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => openProfile(t)}
                  style={{ cursor: "pointer" }}
                  title="Открыть профиль"
                >
                  <td className={styles.titleCell} style={{ color: "var(--color-primary)", fontWeight: 600 }}>
                    {t.first_name} {t.last_name}
                  </td>
                  <td>{t.email || "—"}</td>
                  <td>{t.position || "—"}</td>
                  <td>{t.business_unit || "—"}</td>
                  <td>{t.department || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.footer}>Всего: {total}</div>
      </div>

      {profile && (
        <div
          onClick={() => setProfile(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
            zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--color-white)", borderRadius: 14, width: "100%", maxWidth: 640,
              maxHeight: "88vh", display: "flex", flexDirection: "column",
              boxShadow: "0 24px 64px rgba(0,0,0,0.28)",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "22px 24px 18px", borderBottom: "1px solid var(--color-gray-100)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%", background: "var(--color-primary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 700, fontSize: 18, flexShrink: 0,
                }}>
                  {profile.trainee.first_name[0]}{profile.trainee.last_name[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 17, color: "var(--color-gray-900)" }}>
                    {profile.trainee.first_name} {profile.trainee.last_name}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--color-gray-500)", marginTop: 2 }}>
                    {profile.trainee.position || "—"}
                  </div>
                </div>
              </div>
              <button onClick={() => setProfile(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-gray-400)", padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            {/* Info cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "16px 24px", borderBottom: "1px solid var(--color-gray-100)" }}>
              {[
                { icon: <Mail size={13} />, label: "Email", value: profile.trainee.email || "—" },
                { icon: <Building2 size={13} />, label: "Бизнес-юнит", value: profile.trainee.business_unit || "—" },
                { icon: <Briefcase size={13} />, label: "Отдел", value: profile.trainee.department || "—" },
                { icon: <BookOpen size={13} />, label: "Тренингов пройдено", value: `${attended} из ${total_h}` },
              ].map(({ icon, label, value }) => (
                <div key={label} style={{ background: "var(--color-gray-50)", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: "var(--color-primary)", marginTop: 1 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--color-gray-400)", marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-gray-800)" }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Training history */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              <div style={{ padding: "14px 24px 6px", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-gray-400)" }}>
                {t("training_history")}
              </div>
              {profileLoading ? (
                <div style={{ padding: 32, textAlign: "center", color: "var(--color-gray-400)" }}>Загрузка…</div>
              ) : profile.history.length === 0 ? (
                <div style={{ padding: 32, textAlign: "center", color: "var(--color-gray-400)" }}>Тренинги не найдены</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "var(--color-gray-50)" }}>
                      {[t("title"), t("date"), t("format"), t("status")].map((h) => (
                        <th key={h} style={{ padding: "8px 16px", textAlign: "left", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-gray-500)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {profile.history.map((h, i) => (
                      <tr key={h.id} style={{ borderTop: "1px solid var(--color-gray-100)", background: i % 2 === 1 ? "var(--color-gray-50)" : undefined }}>
                        <td style={{ padding: "10px 16px", fontWeight: 500, color: "var(--color-gray-800)" }}>{h.training_title}</td>
                        <td style={{ padding: "10px 16px", color: "var(--color-gray-500)", whiteSpace: "nowrap" }}>{h.training_date || "—"}</td>
                        <td style={{ padding: "10px 16px" }}>
                          <Badge variant={FORMAT_COLORS[h.training_format] || "default"}>
                            {FORMAT_LABELS[h.training_format] || h.training_format}
                          </Badge>
                        </td>
                        <td style={{ padding: "10px 16px" }}>
                          <span style={{ fontWeight: 700, color: h.attended ? "var(--color-success)" : "var(--color-danger)" }}>
                            {h.attended ? "✓ Прошёл" : "✗ Не прошёл"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ padding: "12px 24px", borderTop: "1px solid var(--color-gray-100)", fontSize: 12, color: "var(--color-gray-400)" }}>
              {t("completed")}: {attended} · {t("not_completed")}: {total_h - attended} · {t("total")}: {total_h}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
