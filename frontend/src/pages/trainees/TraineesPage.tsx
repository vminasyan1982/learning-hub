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
        <input className={styles.search} placeholder="Поиск участника…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr><th>ФИО</th><th>Email</th><th>Должность</th><th>Бизнес-юнит</th><th>Отдел</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className={styles.center}>Загрузка…</td></tr>
            ) : trainees.length === 0 ? (
              <tr><td colSpan={5} className={styles.center}>Участники не найдены</td></tr>
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
      <div className={styles.footer}>Всего: {total}</div>
    </div>
  );
}
