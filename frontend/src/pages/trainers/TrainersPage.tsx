import { useEffect, useState } from "react";
import { getTrainers } from "@/api";
import type { Trainer } from "@/types";
import Badge from "@/components/ui/Badge";
import styles from "../trainings/TrainingsPage.module.css";
import cardStyles from "./TrainersPage.module.css";

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getTrainers({ search })
      .then((r) => setTrainers(r.data.results))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <input className={styles.search} placeholder="Поиск тренера…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className={styles.center}>Загрузка…</div>
      ) : (
        <div className={cardStyles.grid}>
          {trainers.map((t) => (
            <div key={t.id} className={cardStyles.card}>
              <div className={cardStyles.avatar}>
                {t.photo ? <img src={t.photo} alt={t.last_name} /> : <span>{t.first_name[0]}{t.last_name[0]}</span>}
              </div>
              <div className={cardStyles.name}>{t.first_name} {t.last_name}</div>
              <Badge variant={t.is_internal ? "success" : "info"}>{t.is_internal ? "Внутренний" : "Внешний"}</Badge>
              <div className={cardStyles.metrics}>
                <div><strong>NPS:</strong> {t.avg_nps || "—"}</div>
                <div><strong>CSAT:</strong> {t.avg_csat || "—"}</div>
              </div>
              {t.email && <div className={cardStyles.email}>{t.email}</div>}
            </div>
          ))}
          {trainers.length === 0 && <div className={styles.center}>Тренеры не найдены</div>}
        </div>
      )}
    </div>
  );
}
