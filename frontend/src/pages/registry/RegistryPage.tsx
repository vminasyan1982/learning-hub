import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { getInternalRegistry } from "@/api";
import { exportToExcel } from "@/utils/export";
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
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getInternalRegistry({ status: status || undefined, search: search || undefined })
      .then((r) => { if (!cancelled) { setEntries(r.data.results); setTotal(r.data.count); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [status, search]);

  const toggle = (id: number) => setExpanded((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const handleExport = () => {
    const rows = entries.map((e) => ({
      "Title": e.title,
      "Date": e.request_date,
      "Center": e.center === "td" ? "T&D" : "Assessment",
      "Format": e.format,
      "Status": STATUS_MAP[e.status]?.label || e.status,
      "Project Manager": e.project_manager,
      "Developers": e.developers,
      "Deadline": e.deadline || "",
      "On time": e.completed_on_time === null ? "" : e.completed_on_time ? "Yes" : "No",
      "Comments": e.comments,
      "Asana": e.asana_url,
      "Materials": e.materials_url,
    }));
    exportToExcel(rows, "internal-registry");
  };

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
        <button className={styles.exportBtn} onClick={handleExport}>Export Excel</button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: 24 }} />
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
              <tr><td colSpan={8} className={styles.center}>Loading…</td></tr>
            ) : entries.length === 0 ? (
              <tr><td colSpan={8} className={styles.center}>No records found</td></tr>
            ) : entries.map((e) => {
              const s = STATUS_MAP[e.status] || { label: e.status, variant: "default" as const };
              const isOpen = expanded.has(e.id);
              return (
                <>
                  <tr key={e.id} onClick={() => toggle(e.id)} style={{ cursor: "pointer" }}>
                    <td>
                      {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </td>
                    <td className={styles.titleCell}>{e.title}</td>
                    <td>{e.request_date}</td>
                    <td><Badge variant="info">{e.center === "td" ? "T&D" : "Assessment"}</Badge></td>
                    <td><Badge variant={s.variant}>{s.label}</Badge></td>
                    <td>{e.project_manager || "—"}</td>
                    <td>{e.deadline || "—"}</td>
                    <td>{e.completed_on_time === null ? "—" : e.completed_on_time ? "✓" : "✗"}</td>
                  </tr>
                  {isOpen && (
                    <tr key={`${e.id}-detail`} className={styles.expandedRow}>
                      <td colSpan={8}>
                        <div className={styles.expandedContent}>
                          {e.format && (
                            <div className={styles.expandedSection}>
                              <span className={styles.expandedLabel}>Format:</span>
                              <span className={styles.expandedText}>{e.format}</span>
                            </div>
                          )}
                          {e.developers && (
                            <div className={styles.expandedSection}>
                              <span className={styles.expandedLabel}>Developers / Responsible:</span>
                              <span className={styles.expandedText}>{e.developers}</span>
                            </div>
                          )}
                          {e.comments && (
                            <div className={styles.expandedSection}>
                              <span className={styles.expandedLabel}>Comments:</span>
                              <span className={styles.expandedText}>{e.comments}</span>
                            </div>
                          )}
                          <div className={styles.expandedLinks}>
                            {e.asana_url && <a href={e.asana_url} target="_blank" rel="noreferrer" className={styles.link}><ExternalLink size={12} /> Asana</a>}
                            {e.materials_url && <a href={e.materials_url} target="_blank" rel="noreferrer" className={styles.link}><ExternalLink size={12} /> Materials</a>}
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
