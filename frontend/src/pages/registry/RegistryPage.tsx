import { useEffect, useState } from "react";
import { getInternalRegistry } from "@/api";
import type { InternalRegistryEntry, RegistryStatus } from "@/types";
import Badge from "@/components/ui/Badge";
import styles from "../trainings/TrainingsPage.module.css";

const STATUS_MAP: Record<RegistryStatus, { label: string; variant: "success" | "warning" | "danger" | "info" | "neutral" | "default" }> = {
  not_started: { label: "Not started", variant: "neutral" },
  in_progress: { label: "In progress", variant: "info" },
  on_hold: { label: "On hold", variant: "warning" },
  completed: { label: "Completed", variant: "success" },
  at_risk: { label: "At risk", variant: "danger" },
  cancelled: { label: "Cancelled", variant: "danger" },
  done: { label: "Done", variant: "success" },
};

export default function RegistryPage() {
  const [entries, setEntries] = useState<InternalRegistryEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getInternalRegistry({ status: status || undefined, search })
      .then((r) => { setEntries(r.data.results); setTotal(r.data.count); })
      .finally(() => setLoading(false));
  }, [status, search]);

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <input
          className={styles.search}
          placeholder="Search by title, PM…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {Object.entries(STATUS_MAP).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Request title</th>
              <th>Date</th>
              <th>Center</th>
              <th>Status</th>
              <th>Project Manager</th>
              <th>Deadline</th>
              <th>On time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className={styles.center}>Loading…</td></tr>
            ) : entries.length === 0 ? (
              <tr><td colSpan={7} className={styles.center}>No records found</td></tr>
            ) : entries.map((e) => {
              const s = STATUS_MAP[e.status] || { label: e.status, variant: "default" as const };
              return (
                <tr key={e.id}>
                  <td className={styles.titleCell}>{e.title}</td>
                  <td>{e.request_date}</td>
                  <td><Badge variant="info">{e.center === "td" ? "T&D" : "Assessment"}</Badge></td>
                  <td><Badge variant={s.variant}>{s.label}</Badge></td>
                  <td>{e.project_manager || "—"}</td>
                  <td>{e.deadline || "—"}</td>
                  <td>{e.completed_on_time === null ? "—" : e.completed_on_time ? "✓" : "✗"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className={styles.footer}>Total: {total}</div>
    </div>
  );
}
