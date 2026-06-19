import { useEffect, useState } from "react";
import { getPortfolio } from "@/api";
import type { PortfolioItem } from "@/types";
import styles from "./PortfolioPage.module.css";

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPortfolio().then((r) => setItems(r.data.results)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--color-gray-500)" }}>Loading…</div>;

  return (
    <div className={styles.grid}>
      {items.length === 0 && (
        <div style={{ gridColumn: "1/-1", textAlign: "center", color: "var(--color-gray-500)", padding: 40 }}>
          Portfolio is empty. Add items via Django Admin.
        </div>
      )}
      {items.map((item) => (
        <div key={item.id} className={styles.card}>
          {item.banner && (
            <div className={styles.banner}>
              <img src={item.banner} alt={item.promo_name} />
            </div>
          )}
          <div className={styles.body}>
            <h3 className={styles.promoName}>{item.promo_name}</h3>
            <div className={styles.internalName}>{item.internal_name}</div>
            {item.skills && <div className={styles.skills}><strong>Skills:</strong> {item.skills}</div>}
            <div className={styles.meta}>
              <span>Language: {item.language}</span>
            </div>
            {item.enrollment_info && (
              <div className={styles.enroll}>
                <strong>How to enroll:</strong>
                <p>{item.enrollment_info}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
