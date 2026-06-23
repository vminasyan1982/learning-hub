import { useEffect, useState } from "react";
import { getBudget } from "@/api";
import type { BudgetSummary } from "@/types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import styles from "../trainings/TrainingsPage.module.css";
import pageStyles from "./BudgetPage.module.css";

const YEARS = ["2024", "2025", "2026", "2027"];

const CURRENCIES = [
  { value: "USD", symbol: "$" },
  { value: "EUR", symbol: "€" },
];

const fmt = (n: number) => n.toLocaleString("en-US");

export default function BudgetPage() {
  const [year, setYear] = useState("2026");
  const [currency, setCurrency] = useState("USD");
  const [data, setData] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getBudget(year).then((r) => setData(r.data)).finally(() => setLoading(false));
  }, [year]);

  const currSymbol = CURRENCIES.find((c) => c.value === currency)?.symbol ?? currency;
  const variance = data ? data.total_planned - data.total_actual : 0;

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <select className={styles.select} value={year} onChange={(e) => setYear(e.target.value)}>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select className={styles.select} value={currency} onChange={(e) => setCurrency(e.target.value)}>
          {CURRENCIES.map((c) => (
            <option key={c.value} value={c.value}>{c.symbol} {c.value}</option>
          ))}
        </select>
      </div>

      <div className={pageStyles.cards}>
        <div className={pageStyles.card}>
          <div className={pageStyles.cardLabel}>Total Planned</div>
          <div className={pageStyles.cardValue}>{data ? fmt(data.total_planned) : "—"}</div>
          <div className={pageStyles.cardSub}>{currency}</div>
        </div>
        <div className={pageStyles.card}>
          <div className={pageStyles.cardLabel}>Total Actual</div>
          <div className={pageStyles.cardValue} style={{ color: "var(--color-info)" }}>
            {data ? fmt(data.total_actual) : "—"}
          </div>
          <div className={pageStyles.cardSub}>{currency}</div>
        </div>
        <div className={pageStyles.card}>
          <div className={pageStyles.cardLabel}>Variance</div>
          <div className={pageStyles.cardValue} style={{ color: variance >= 0 ? "var(--color-accent)" : "var(--color-danger)" }}>
            {data ? (variance >= 0 ? "+" : "") + fmt(variance) : "—"}
          </div>
          <div className={pageStyles.cardSub}>
            {data && data.total_planned > 0 ? `${Math.round((1 - data.total_actual / data.total_planned) * 100)}% remaining` : ""}
          </div>
        </div>
      </div>

      {!loading && data && (
        <div className={pageStyles.chartCard}>
          <h3>Planned vs Actual by Quarter</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.by_quarter} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-200)" />
              <XAxis dataKey="quarter" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => currSymbol + (v / 1000).toFixed(0) + "K"} />
              <Tooltip formatter={(v: number) => `${currSymbol}${fmt(v)}`} />
              <Legend />
              <Bar dataKey="planned" name="Planned" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" name="Actual" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p style={{ fontSize: 12, color: "var(--color-gray-500)", marginTop: 8 }}>
            Actual spend is calculated from External Registry entries. Add quarterly budget plans in Django Admin → Budget Plans.
          </p>
        </div>
      )}
    </div>
  );
}
