import { useEffect, useState } from "react";
import { getCompliance } from "@/api";
import type { ComplianceSummary } from "@/types";
import styles from "../trainings/TrainingsPage.module.css";
import pageStyles from "./CompliancePage.module.css";

const STATUS_COLOR = {
  green: "#00A958",
  yellow: "#FF6D66",
  red: "#ED484E",
};

const STATUS_LABEL = {
  green: "On track",
  yellow: "At risk",
  red: "Behind",
};

export default function CompliancePage() {
  const [data, setData] = useState<ComplianceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCompliance().then((r) => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--color-gray-500)" }}>Loading…</div>;

  if (!data || data.total_mandatory === 0) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--color-gray-500)" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h3>No mandatory trainings set</h3>
        <p style={{ marginTop: 8, fontSize: 13 }}>Mark trainings as mandatory in Django Admin → Trainings → is_mandatory</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={pageStyles.summary}>
        <div className={pageStyles.scoreCard}>
          <div className={pageStyles.scoreValue} style={{ color: data.overall_compliance_pct >= 90 ? "#00A958" : data.overall_compliance_pct >= 70 ? "#FF6D66" : "#ED484E" }}>
            {data.overall_compliance_pct}%
          </div>
          <div className={pageStyles.scoreLabel}>Overall Compliance</div>
        </div>
        <div className={pageStyles.statRow}>
          <div className={pageStyles.stat}><span className={pageStyles.statNum}>{data.total_mandatory}</span><span className={pageStyles.statLabel}>Mandatory trainings</span></div>
          <div className={pageStyles.stat}><span className={pageStyles.statNum}>{data.total_trainees}</span><span className={pageStyles.statLabel}>Active participants</span></div>
          <div className={pageStyles.stat}><span className={pageStyles.statNum}>{data.trainings.filter(t => t.status === "green").length}</span><span className={pageStyles.statLabel}>On track</span></div>
          <div className={pageStyles.stat}><span className={pageStyles.statNum}>{data.trainings.filter(t => t.status !== "green").length}</span><span className={pageStyles.statLabel}>Need attention</span></div>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Training</th>
              <th>Deadline</th>
              <th>Completed</th>
              <th>Progress</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.trainings.map((t) => (
              <tr key={t.id}>
                <td className={styles.titleCell}>{t.title}</td>
                <td>{t.deadline || "—"}</td>
                <td>{t.completed} / {t.total}</td>
                <td style={{ minWidth: 140 }}>
                  <div className={pageStyles.progressBar}>
                    <div
                      className={pageStyles.progressFill}
                      style={{ width: `${t.compliance_pct}%`, background: STATUS_COLOR[t.status] }}
                    />
                  </div>
                  <span style={{ fontSize: 11, color: "var(--color-gray-600)", marginLeft: 6 }}>{t.compliance_pct}%</span>
                </td>
                <td>
                  <span className={pageStyles.badge} style={{ background: STATUS_COLOR[t.status] + "22", color: STATUS_COLOR[t.status] }}>
                    {STATUS_LABEL[t.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
