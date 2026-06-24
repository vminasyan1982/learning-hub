import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, ExternalLink, X, Users } from "lucide-react";
import { getTrainings, getTrainingParticipants } from "@/api";
import type { Training } from "@/types";
import Badge from "@/components/ui/Badge";
import { exportToExcel } from "@/utils/export";
import { useLang } from "@/i18n/LangContext";
import styles from "./TrainingsPage.module.css";

type Participant = { id: number; trainee: number; trainee_name: string; trainee_position: string; trainee_department: string; attended: boolean; completion_date: string | null };

const FORMAT_LABELS: Record<string, string> = {
  online: "Online", offline: "Offline", mixed: "Blended",
};

const STATUS_COLORS: Record<string, "success" | "info" | "warning"> = {
  online: "success", offline: "info", mixed: "warning",
};

const CLASSIFICATION_LABELS: Record<string, string> = {
  online_self: "Online self-study",
  online_deadline: "Online with deadline",
  online_mixed: "Online blended (LMS + workshop)",
  offline_mixed: "Offline blended",
  online_trainer: "Online training",
  offline_trainer: "Offline training",
  online_workshop: "Online workshop",
  offline_workshop: "Offline workshop",
  online_game: "Online business game",
  offline_game: "Offline business game",
  online_strategy: "Online strategy session",
  offline_strategy: "Offline strategy session",
  online_coaching: "Online coaching",
  offline_coaching: "Offline coaching",
  online_masterclass: "Online masterclass",
  offline_masterclass: "Offline masterclass",
  online_conference: "Online conference",
  offline_conference: "Offline conference",
  online_teambuilding: "Online team building",
  offline_teambuilding: "Offline team building",
};

export default function TrainingsPage() {
  const { t } = useLang();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [format, setFormat] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [participantsModal, setParticipantsModal] = useState<{ title: string; list: Participant[] } | null>(null);
  const [participantsLoading, setParticipantsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getTrainings({
      search: search || undefined,
      format: format || undefined,
    })
      .then((r) => {
        if (!cancelled) {
          setTrainings(r.data.results);
          setTotal(r.data.count);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [search, format]);

  const openParticipants = (e: React.MouseEvent, training: Training) => {
    e.stopPropagation();
    if (!training.metric?.participants_count) return;
    setParticipantsLoading(true);
    setParticipantsModal({ title: training.title, list: [] });
    getTrainingParticipants(training.id)
      .then((r) => setParticipantsModal({ title: training.title, list: r.data.results }))
      .finally(() => setParticipantsLoading(false));
  };

  const toggle = (id: number) => setExpanded((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const handleExport = () => {
    const rows = trainings.map((t) => ({
      "Title": t.title,
      "Date": t.date,
      "Format": FORMAT_LABELS[t.format] || t.format,
      "Classification": CLASSIFICATION_LABELS[t.classification] || t.classification,
      "Business Units": t.business_units.map((b) => b.name).join(", "),
      "NPS %": t.metric?.nps_percent ?? "",
      "CSAT %": t.metric?.csat_percent ?? "",
      "Participants": t.metric?.participants_count ?? 0,
      "LMS": t.lms_url,
      "Asana": t.asana_url,
    }));
    exportToExcel(rows, "trainings");
  };

  return (
    <>
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <input
          className={styles.search}
          placeholder="Search by title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className={styles.select} value={format} onChange={(e) => setFormat(e.target.value)}>
          <option value="">All formats</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="mixed">Blended</option>
        </select>
        <button className={styles.exportBtn} onClick={handleExport}>Export Excel</button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: 24 }} />
              <th>{t("title")}</th>
              <th>{t("date")}</th>
              <th>{t("format")}</th>
              <th>{t("classification")}</th>
              <th>{t("trainer")}</th>
              <th>{t("nps_pct")}</th>
              <th>{t("csat_pct")}</th>
              <th>{t("participants")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className={styles.center}>Loading…</td></tr>
            ) : trainings.length === 0 ? (
              <tr><td colSpan={9} className={styles.center}>No trainings found</td></tr>
            ) : trainings.map((t) => {
              const isOpen = expanded.has(t.id);
              return (
                <>
                  <tr key={t.id} onClick={() => toggle(t.id)} style={{ cursor: "pointer" }}>
                    <td>
                      {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </td>
                    <td className={styles.titleCell}>{t.title}</td>
                    <td>{t.date}</td>
                    <td>
                      <Badge variant={STATUS_COLORS[t.format] || "default"}>
                        {FORMAT_LABELS[t.format] || t.format}
                      </Badge>
                    </td>
                    <td><span className={styles.classification}>{CLASSIFICATION_LABELS[t.classification] || t.classification}</span></td>
                    <td>
                      {t.trainers && t.trainers.length > 0
                        ? t.trainers.map((tr) => `${tr.first_name} ${tr.last_name}`).join(", ")
                        : "—"}
                    </td>
                    <td>{t.metric?.nps_percent != null ? `${t.metric.nps_percent}%` : "—"}</td>
                    <td>{t.metric?.csat_percent != null ? `${t.metric.csat_percent}%` : "—"}</td>
                    <td>
                      {(t.metric?.participants_count ?? 0) > 0 ? (
                        <span
                          onClick={(e) => openParticipants(e, t)}
                          style={{ cursor: "pointer", color: "var(--color-primary)", fontWeight: 600, textDecoration: "underline" }}
                          title="Click to view participants"
                        >
                          {t.metric!.participants_count}
                        </span>
                      ) : 0}
                    </td>
                  </tr>
                  {isOpen && (
                    <tr key={`${t.id}-detail`} className={styles.expandedRow}>
                      <td colSpan={9}>
                        <div className={styles.expandedContent}>
                          {t.business_units.length > 0 && (
                            <div className={styles.expandedSection}>
                              <span className={styles.expandedLabel}>Business Units:</span>
                              {t.business_units.map((b) => (
                                <Badge key={b.id} variant="neutral">{b.name}</Badge>
                              ))}
                            </div>
                          )}
                          {t.description && (
                            <div className={styles.expandedSection}>
                              <span className={styles.expandedLabel}>Description:</span>
                              <span className={styles.expandedText}>{t.description}</span>
                            </div>
                          )}
                          {t.metric?.notes && (
                            <div className={styles.expandedSection}>
                              <span className={styles.expandedLabel}>Notes:</span>
                              <span className={styles.expandedText}>{t.metric.notes}</span>
                            </div>
                          )}
                          <div className={styles.expandedLinks}>
                            {t.lms_url && <a href={t.lms_url} target="_blank" rel="noreferrer" className={styles.link}><ExternalLink size={12} /> LMS</a>}
                            {t.asana_url && <a href={t.asana_url} target="_blank" rel="noreferrer" className={styles.link}><ExternalLink size={12} /> Asana</a>}
                            {t.drive_url && <a href={t.drive_url} target="_blank" rel="noreferrer" className={styles.link}><ExternalLink size={12} /> Drive</a>}
                            {t.feedback_url && <a href={t.feedback_url} target="_blank" rel="noreferrer" className={styles.link}><ExternalLink size={12} /> Feedback</a>}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className={styles.footer}>Total: {total}</div>
    </div>

    {participantsModal && (
      <div
        onClick={() => setParticipantsModal(null)}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
          zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "var(--color-white)", borderRadius: 12, width: "100%", maxWidth: 560,
            maxHeight: "80vh", display: "flex", flexDirection: "column",
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid var(--color-gray-100)" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "var(--color-gray-900)" }}>
                <Users size={15} style={{ marginRight: 6, verticalAlign: "middle" }} />
                Участники
              </div>
              <div style={{ fontSize: 12, color: "var(--color-gray-500)", marginTop: 2 }}>{participantsModal.title}</div>
            </div>
            <button onClick={() => setParticipantsModal(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-gray-500)", padding: 4 }}>
              <X size={20} />
            </button>
          </div>

          <div style={{ overflowY: "auto", flex: 1 }}>
            {participantsLoading ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--color-gray-400)" }}>Загрузка…</div>
            ) : participantsModal.list.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--color-gray-400)" }}>Список участников не заполнен в системе</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--color-gray-50)" }}>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "var(--color-gray-600)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>#</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "var(--color-gray-600)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("name")}</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "var(--color-gray-600)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("position")}</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "var(--color-gray-600)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("department")}</th>
                    <th style={{ padding: "10px 16px", textAlign: "center", fontWeight: 600, color: "var(--color-gray-600)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("attended")}</th>
                  </tr>
                </thead>
                <tbody>
                  {participantsModal.list.map((p, i) => (
                    <tr key={p.id} style={{ borderTop: "1px solid var(--color-gray-100)", background: i % 2 === 1 ? "var(--color-gray-50)" : undefined }}>
                      <td style={{ padding: "10px 16px", color: "var(--color-gray-400)" }}>{i + 1}</td>
                      <td style={{ padding: "10px 16px", fontWeight: 500 }}>{p.trainee_name}</td>
                      <td style={{ padding: "10px 16px", color: "var(--color-gray-600)" }}>{p.trainee_position || "—"}</td>
                      <td style={{ padding: "10px 16px", color: "var(--color-gray-600)" }}>{p.trainee_department || "—"}</td>
                      <td style={{ padding: "10px 16px", textAlign: "center", color: p.attended ? "var(--color-success)" : "var(--color-danger)", fontWeight: 700 }}>
                        {p.attended ? "✓" : "✗"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ padding: "12px 24px", borderTop: "1px solid var(--color-gray-100)", fontSize: 12, color: "var(--color-gray-400)" }}>
            Всего: {participantsModal.list.length} участников
          </div>
        </div>
      </div>
    )}
    </>
  );
}
