import { useState } from "react";
import styles from "./KpiCard.module.css";

interface Detail {
  label: string;
  value: string | number;
}

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: "primary" | "accent" | "info" | "warning" | "danger";
  details?: Detail[];
}

export default function KpiCard({ title, value, subtitle, icon, color = "primary", details }: KpiCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`${styles.card} ${styles[color]} ${details?.length ? styles.hasDetails : ""}`}
      onMouseEnter={() => details?.length && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={styles.top}>
        <span className={styles.title}>{title}</span>
        {icon && <span className={styles.icon}>{icon}</span>}
      </div>
      <div className={styles.value}>{value}</div>
      {subtitle && <div className={styles.subtitle}>{subtitle}</div>}

      {hovered && details && details.length > 0 && (
        <div className={styles.tooltip}>
          {details.map((d, i) => (
            <div key={i} className={styles.tooltipRow}>
              <span className={styles.tooltipLabel}>{d.label}</span>
              <span className={styles.tooltipValue}>{d.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
