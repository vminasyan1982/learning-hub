import { useEffect, useState } from "react";
import { getTrainings } from "@/api";
import type { Training } from "@/types";
import Badge from "@/components/ui/Badge";
import { exportToExcel } from "@/utils/export";
import styles from "./TrainingsPage.module.css";

const FORMAT_LABELS: Record<string, string> = {
  online: "Онлайн", offline: "Офлайн", mixed: "Смешанный",
};

const STATUS_COLORS: Record<string, "success" | "info" | "warning"> = {
  online: "success", offline: "info", mixed: "warning",
};

export default function TrainingsPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [format, setFormat] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getTrainings({ search, format: format || undefined })
      .then((r) => { setTrainings(r.data.results); setTotal(r.data.count); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, format]);

  const handleExport = () => {
    const rows = trainings.map((t) => ({
      "Название": t.title,
      "Дата": t.date,
      "Формат": FORMAT_LABELS[t.format] || t.format,
      "Бизнес-юниты": t.business_units.map((b) => b.name).join(", "),
      "NPS": t.metric?.nps_score ?? "",
      "CSAT": t.metric?.csat_score ?? "",
      "Участники": t.metric?.participants_count ?? 0,
    }));
    exportToExcel(rows, "trainings");
  };

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <input
          className={styles.search}
          placeholder="Поиск по названию…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className={styles.select} value={format} onChange={(e) => setFormat(e.target.value)}>
          <option value="">Все форматы</option>
          <option value="online">Онлайн</option>
          <option value="offline">Офлайн</option>
          <option value="mixed">Смешанный</option>
        </select>
        <button className={styles.exportBtn} onClick={handleExport}>Экспорт Excel</button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Название</th>
              <th>Дата</th>
              <th>Формат</th>
              <th>Классификация</th>
              <th>NPS</th>
              <th>CSAT</th>
              <th>Участников</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className={styles.center}>Загрузка…</td></tr>
            ) : trainings.length === 0 ? (
              <tr><td colSpan={7} className={styles.center}>Тренинги не найдены</td></tr>
            ) : trainings.map((t) => (
              <tr key={t.id}>
                <td className={styles.titleCell}>{t.title}</td>
                <td>{t.date}</td>
                <td>
                  <Badge variant={STATUS_COLORS[t.format] || "default"}>
                    {FORMAT_LABELS[t.format] || t.format}
                  </Badge>
                </td>
                <td><span className={styles.classification}>{t.classification}</span></td>
                <td>{t.metric?.nps_score ?? "—"}</td>
                <td>{t.metric?.csat_score ?? "—"}</td>
                <td>{t.metric?.participants_count ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.footer}>Всего: {total}</div>
    </div>
  );
}
