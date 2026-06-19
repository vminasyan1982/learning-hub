import { useEffect, useState } from "react";
import { BookOpen, Users, UserCheck, TrendingUp, Star, Award } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";
import KpiCard from "@/components/ui/KpiCard";
import { getAnalyticsSummary, getAnalyticsTrends } from "@/api";
import type { AnalyticsSummary, TrendPoint } from "@/types";
import styles from "./DashboardPage.module.css";

export default function DashboardPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);

  useEffect(() => {
    getAnalyticsSummary().then((r) => setSummary(r.data)).catch(() => {});
    getAnalyticsTrends({ granularity: "month" }).then((r) => setTrends(r.data)).catch(() => {});
  }, []);

  const pct = (part: number, total: number) =>
    total ? `${Math.round((part / total) * 100)}%` : "—";

  return (
    <div className={styles.page}>
      <div className={styles.kpiGrid}>
        <KpiCard
          title="Total Trainings"
          value={summary?.total_trainings ?? "—"}
          icon={<BookOpen size={18} />}
          color="primary"
          details={summary ? [
            { label: "Online", value: summary.online_count },
            { label: "Offline", value: summary.offline_count },
            { label: "Blended", value: summary.mixed_count },
          ] : undefined}
        />
        <KpiCard
          title="Avg NPS"
          value={summary ? `${summary.avg_nps}` : "—"}
          subtitle="Target ≥ 3.0"
          icon={<TrendingUp size={18} />}
          color="accent"
          details={summary ? [
            { label: "Meeting target (≥3.0)", value: `${summary.nps_target_met} / ${summary.total_metrics}` },
            { label: "Pass rate", value: pct(summary.nps_target_met, summary.total_metrics) },
          ] : undefined}
        />
        <KpiCard
          title="Avg CSAT"
          value={summary ? `${summary.avg_csat}` : "—"}
          subtitle="Target ≥ 4.3"
          icon={<Star size={18} />}
          color="info"
          details={summary ? [
            { label: "Meeting target (≥4.3)", value: `${summary.csat_target_met} / ${summary.total_metrics}` },
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
          title="Trainer Rating"
          value={summary ? `${summary.avg_trainer_rating}` : "—"}
          subtitle="Target ≥ 4.5"
          icon={<Award size={18} />}
          color="danger"
          details={summary ? [
            { label: "Rating ≥ 4.5", value: `${summary.trainer_rating_met} / ${summary.total_metrics}` },
            { label: "Internal trainers", value: summary.internal_trainers },
            { label: "External trainers", value: summary.external_trainers },
          ] : undefined}
        />
        <KpiCard
          title="LH Standards"
          value={summary ? `${summary.avg_lh_standards}` : "—"}
          subtitle="Target ≥ 4.5"
          icon={<Users size={18} />}
          color="primary"
          details={summary ? [
            { label: "Total active trainers", value: summary.total_trainers },
            { label: "Internal", value: summary.internal_trainers },
            { label: "External", value: summary.external_trainers },
          ] : undefined}
        />
      </div>

      <div className={styles.charts}>
        <div className={styles.chartCard}>
          <h3>NPS & CSAT Trends</h3>
          <ResponsiveContainer width="100%" height={260}>
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
          <h3>Trainings by Period</h3>
          <ResponsiveContainer width="100%" height={260}>
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
