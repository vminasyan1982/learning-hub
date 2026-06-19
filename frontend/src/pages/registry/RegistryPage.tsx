import { useEffect, useState } from "react";
import { getInternalRegistry } from "@/api";
import type { InternalRegistryEntry, RegistryStatus } from "@/types";
import Badge from "@/components/ui/Badge";
import styles from "../trainings/TrainingsPage.module.css";

const STATUS_MAP: Record<RegistryStatus, { label: string; variant: "success" | "warning" | "danger" | "info" | "neutral" | "default" }> = {
  not_started: { label: "Не начат", variant: "neutral" },
  in_progress: { label: "В работе", variant: "info" },
  on_hold: { label: "На паузе", variant: "warning" },
  completed: { label: "Завершён", variant: "success" },
  at_risk: { label: "Под риском", variant: "danger" },
  cancelled: { label: "Отменён", variant: "danger" },
  done: { label: "Выполнен", variant: "success" },
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
          placeholder="Поиск по названию, PM…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Все статусы</option>
          {Object.entries(STATUS_MAP).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Название запроса</th>
              <th>Дата</th>
              <th>Центр</th>
              <th>Статус</th>
              <th>Руководитель проекта</th>
              <th>Срок</th>
              <th>В срок</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className={styles.center}>Загрузка…</td></tr>
            ) : entries.length === 0 ? (
              <tr><td colSpan={7} className={styles.center}>Записи не найдены</td></tr>
            ) : entries.map((e) => {
              const s = STATUS_MAP[e.status] || { label: e.status, variant: "default" as const };
              return (
                <tr key={e.id}>
                  <td className={styles.titleCell}>{e.title}</td>
                  <td>{e.request_date}</td>
                  <td><Badge variant="info">{e.center === "td" ? "T&D" : "Ассессмент"}</Badge></td>
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
      <div className={styles.footer}>Всего: {total}</div>
    </div>
  );
}
