import { useEffect, useState } from "react";
import { getTrainees } from "@/api";
import type { Trainee } from "@/types";
import styles from "../trainings/TrainingsPage.module.css";

export default function TraineesPage() {
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getTrainees({ search })
      .then((r) => { setTrainees(r.data.results); setTotal(r.data.count); })
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <input className={styles.search} placeholder="Search participant…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Position</th><th>Business Unit</th><th>Department</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className={styles.center}>Loading…</td></tr>
            ) : trainees.length === 0 ? (
              <tr><td colSpan={5} className={styles.center}>No participants found</td></tr>
            ) : trainees.map((t) => (
              <tr key={t.id}>
                <td className={styles.titleCell}>{t.first_name} {t.last_name}</td>
                <td>{t.email || "—"}</td>
                <td>{t.position || "—"}</td>
                <td>{t.business_unit || "—"}</td>
                <td>{t.department || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.footer}>Total: {total}</div>
    </div>
  );
}
