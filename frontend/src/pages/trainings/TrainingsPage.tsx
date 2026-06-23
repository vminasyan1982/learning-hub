import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { getTrainings } from "@/api";
import type { Training } from "@/types";
import Badge from "@/components/ui/Badge";
import { exportToExcel } from "@/utils/export";
import styles from "./TrainingsPage.module.css";

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
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [format, setFormat] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const load = () => {
    setLoading(true);
    getTrainings({ search, format: format || undefined })
      .then((r) => { setTrainings(r.data.results); setTotal(r.data.count); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, format]);

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
              <th>Title</th>
              <th>Date</th>
              <th>Format</th>
              <th>Classification</th>
              <th>NPS%</th>
              <th>CSAT%</th>
              <th>Participants</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className={styles.center}>Loading…</td></tr>
            ) : trainings.length === 0 ? (
              <tr><td colSpan={8} className={styles.center}>No trainings found</td></tr>
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
                    <td>{t.metric?.nps_percent != null ? `${t.metric.nps_percent}%` : "—"}</td>
                    <td>{t.metric?.csat_percent != null ? `${t.metric.csat_percent}%` : "—"}</td>
                    <td>{t.metric?.participants_count ?? 0}</td>
                  </tr>
                  {isOpen && (
                    <tr key={`${t.id}-detail`} className={styles.expandedRow}>
                      <td colSpan={8}>
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
  );
}
