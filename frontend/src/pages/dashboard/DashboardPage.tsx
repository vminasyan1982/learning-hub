import { useEffect, useState } from "react";
import { Layers, Users, UserCheck, TrendingUp, Star, BarChart3 } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";
import KpiCard from "@/components/ui/KpiCard";
import { getAnalyticsSummary, getAnalyticsTrends } from "@/api";
import type { AnalyticsSummary, TrendPoint } from "@/types";
import styles from "./DashboardPage.module.css";

const YEARS = ["2025", "2026", "2027"];

export default function DashboardPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [year, setYear] = useState("");
  const [granularity, setGranularity] = useState<"month" | "quarter">("month");

  useEffect(() => {
    getAnalyticsSummary({ period: year || undefined })
      .then((r) => setSummary(r.data))
      .catch(() => {});
  }, [year]);

  useEffect(() => {
    getAnalyticsTrends({ granularity, year: year || undefined })
      .then((r) => setTrends(r.data))
      .catch(() => {});
  }, [granularity, year]);

  const pct = (part: number, total: number) =>
    total ? `${Math.round((part / total) * 100)}%` : "—";

  return (
    <div className={styles.page}>
      <div className={styles.kpiGrid}>
        <KpiCard
          title="Projects in Progress"
          value={summary?.projects_in_progress ?? "—"}
          icon={<Layers size={18} />}
          color="primary"
          details={summary ? [
            { label: "Total trainings", value: summary.total_trainings },
            { label: "Online", value: summary.online_count },
            { label: "Offline", value: summary.offline_count },
            { label: "Blended", value: summary.mixed_count },
          ] : undefined}
        />
        <KpiCard
          title="Avg NPS"
          value={summary ? `${summary.avg_nps_pct}%` : "—"}
          subtitle="Target ≥ 60%"
          icon={<TrendingUp size={18} />}
          color="accent"
          details={summary ? [
            { label: "Score", value: summary.avg_nps },
            { label: "Meeting target (≥60%)", value: `${summary.nps_target_met} / ${summary.total_metrics}` },
            { label: "Pass rate", value: pct(summary.nps_target_met, summary.total_metrics) },
          ] : undefined}
        />
        <KpiCard
          title="Avg CSAT"
          value={summary ? `${summary.avg_csat_pct}%` : "—"}
          subtitle="Target ≥ 80%"
          icon={<Star size={18} />}
          color="info"
          details={summary ? [
            { label: "Score", value: summary.avg_csat },
            { label: "Meeting target (≥80%)", value: `${summary.csat_target_met} / ${summary.total_metrics}` },
            { label: "Pass rate", value: pct(summary.csat_target_met, summary.total_metrics) },
          ] : undefined}
        />
        <KpiCard
          title="Participants Trained"
          value={summary?.total_participants ?? "—"}
          icon={<UserCheck size={18} />}
          color="warning"
          details={summary ? [
            { label: "Avg per training", value: summary.avg_participants_per_training },
            { label: "Trainings with data", value: summary.total_metrics },
          ] : undefined}
        />
        <KpiCard
          title="Business Value %"
          value={summary ? `${summary.business_value_pct}%` : "—"}
          subtitle="Target ≥ 70%"
          icon={<BarChart3 size={18} />}
          color="danger"
          details={summary ? [
            { label: "LH Standards avg", value: summary.avg_lh_standards },
            { label: "Trainer rating avg", value: summary.avg_trainer_rating },
          ] : undefined}
        />
        <KpiCard
          title="Business Units"
          value={summary ? summary.bu_breakdown.length : "—"}
          subtitle="Active BUs"
          icon={<Users size={18} />}
          color="primary"
          details={summary?.bu_breakdown.length
            ? summary.bu_breakdown.map((b) => ({ label: b.name, value: `${b.project_count} trainings` }))
            : undefined}
        />
      </div>

      <div className={styles.charts}>
        <div className={styles.chartCard}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h3>NPS & CSAT Trends</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <select
                style={{ fontSize: 12, padding: "3px 8px", borderRadius: 6, border: "1px solid var(--color-gray-300)", background: "var(--color-white)", color: "var(--color-gray-700)" }}
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                <option value="">All years</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <select
                style={{ fontSize: 12, padding: "3px 8px", borderRadius: 6, border: "1px solid var(--color-gray-300)", background: "var(--color-white)", color: "var(--color-gray-700)" }}
                value={granularity}
                onChange={(e) => setGranularity(e.target.value as "month" | "quarter")}
              >
                <option value="month">Monthly</option>
                <option value="quarter">Quarterly</option>
              </select>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trends} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-200)" />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="avg_nps" name="NPS" stroke="var(--color-accent)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="avg_csat" name="CSAT" stroke="var(--color-info)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <h3>Trainings by Period</h3>
          </div>
          <div style={{ fontSize: 12, color: "var(--color-gray-500)", marginBottom: 12 }}>
            Number of trainings with metrics · filtered by the year selector above
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={trends} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-200)" />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" name="Trainings" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
