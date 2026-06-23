import { useEffect, useState } from "react";
import { getExternalRegistry } from "@/api";
import { exportToExcel } from "@/utils/export";
import type { ExternalRegistryEntry } from "@/types";
import styles from "../trainings/TrainingsPage.module.css";

export default function ExternalRegistryPage() {
  const [entries, setEntries] = useState<ExternalRegistryEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getExternalRegistry({ search })
      .then((r) => { setEntries(r.data.results); setTotal(r.data.count); })
      .finally(() => setLoading(false));
  }, [search]);

  const handleExport = () => {
    const rows = entries.map((e) => ({
      "Title": e.title,
      "Provider": e.provider,
      "Date": e.date || "",
      "Cost": e.cost != null ? `${e.cost} ${e.currency}` : "",
      "Notes": e.notes,
    }));
    exportToExcel(rows, "external-registry");
  };

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <input
          className={styles.search}
          placeholder="Search by title, provider…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className={styles.exportBtn} onClick={handleExport}>Export Excel</button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Provider</th>
              <th>Date</th>
              <th>Cost</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className={styles.center}>Loading…</td></tr>
            ) : entries.length === 0 ? (
              <tr><td colSpan={5} className={styles.center}>No external registry records found</td></tr>
            ) : entries.map((e) => (
              <tr key={e.id}>
                <td className={styles.titleCell}>{e.title}</td>
                <td>{e.provider || "—"}</td>
                <td>{e.date || "—"}</td>
                <td>{e.cost != null ? `${e.cost} ${e.currency}` : "—"}</td>
                <td className={styles.classification}>{e.notes || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.footer}>Total: {total}</div>
    </div>
  );
}
