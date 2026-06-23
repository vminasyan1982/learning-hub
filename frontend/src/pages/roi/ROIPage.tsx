import { useEffect, useState } from "react";
import { getROI } from "@/api";
import type { ROISummary } from "@/types";
import styles from "./ROIPage.module.css";

const YEARS = ["2024", "2025", "2026", "2027"];

const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmtDec = (n: number) => n.toFixed(2);

export default function ROIPage() {
  const [year, setYear] = useState("2026");
  const [data, setData] = useState<ROISummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getROI(year)
      .then((r) => { if (!cancelled) setData(r.data); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [year]);

  const npsBenchmark = data?.nps_benchmark ?? 3.0;
  const csatBenchmark = data?.csat_benchmark ?? 4.3;
  const avgNps = data?.avg_nps ?? 0;
  const avgCsat = data?.avg_csat ?? 0;

  const npsPct = Math.min(100, (avgNps / 5) * 100);
  const csatPct = Math.min(100, (avgCsat / 5) * 100);
  const npsBenchmarkPct = Math.min(100, (npsBenchmark / 5) * 100);
  const csatBenchmarkPct = Math.min(100, (csatBenchmark / 5) * 100);

  const npsMet = avgNps >= npsBenchmark;
  const csatMet = avgCsat >= csatBenchmark;

  return (
    <div className={styles.page}>
      {/* Year selector */}
      <div className={styles.toolbar}>
        <select
          className={styles.select}
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* KPI cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Total L&D Investment</div>
          <div className={styles.kpiValue}>
            {loading ? "—" : `$${fmt(data?.total_cost ?? 0)}`}
          </div>
          <div className={styles.kpiSub}>Total spend for {year}</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Participants Trained</div>
          <div className={styles.kpiValue} style={{ color: "var(--color-info)" }}>
            {loading ? "—" : fmt(data?.total_participants ?? 0)}
          </div>
          <div className={styles.kpiSub}>Unique attendees</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Cost per Participant</div>
          <div className={styles.kpiValue} style={{ color: "var(--color-accent)" }}>
            {loading ? "—" : `$${fmt(data?.cost_per_participant ?? 0)}`}
          </div>
          <div className={styles.kpiSub}>Average per person</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Trainings Delivered</div>
          <div className={styles.kpiValue} style={{ color: "var(--color-warning)" }}>
            {loading ? "—" : fmt(data?.total_trainings ?? 0)}
          </div>
          <div className={styles.kpiSub}>Sessions in {year}</div>
        </div>
      </div>

      {/* Benchmark cards */}
      <div className={styles.benchmarkGrid}>
        {/* NPS benchmark card */}
        <div className={styles.benchmarkCard}>
          <div className={styles.benchmarkHeader}>
            <div className={styles.benchmarkTitle}>NPS Score</div>
            <div
              className={styles.benchmarkBadge}
              style={{
                background: npsMet ? "#00A95822" : "#ED484E22",
                color: npsMet ? "#00A958" : "#ED484E",
              }}
            >
              {npsMet ? "Meets benchmark" : "Below benchmark"}
            </div>
          </div>

          <div className={styles.benchmarkValue}>
            {loading ? "—" : fmtDec(avgNps)}
            <span className={styles.benchmarkScale}> / 5.0</span>
          </div>

          <div className={styles.benchmarkBarWrap}>
            <div className={styles.benchmarkBar}>
              <div
                className={styles.benchmarkFill}
                style={{
                  width: `${npsPct}%`,
                  background: npsMet ? "#00A958" : "#ED484E",
                }}
              />
              {/* Benchmark marker */}
              <div
                className={styles.benchmarkMarker}
                style={{ left: `${npsBenchmarkPct}%` }}
                title={`Benchmark: ${npsBenchmark}`}
              />
            </div>
          </div>

          <div className={styles.benchmarkFooter}>
            <span>0</span>
            <span>Benchmark: {npsBenchmark}</span>
            <span>5.0</span>
          </div>
        </div>

        {/* CSAT benchmark card */}
        <div className={styles.benchmarkCard}>
          <div className={styles.benchmarkHeader}>
            <div className={styles.benchmarkTitle}>CSAT Score</div>
            <div
              className={styles.benchmarkBadge}
              style={{
                background: csatMet ? "#00A95822" : "#ED484E22",
                color: csatMet ? "#00A958" : "#ED484E",
              }}
            >
              {csatMet ? "Meets benchmark" : "Below benchmark"}
            </div>
          </div>

          <div className={styles.benchmarkValue}>
            {loading ? "—" : fmtDec(avgCsat)}
            <span className={styles.benchmarkScale}> / 5.0</span>
          </div>

          <div className={styles.benchmarkBarWrap}>
            <div className={styles.benchmarkBar}>
              <div
                className={styles.benchmarkFill}
                style={{
                  width: `${csatPct}%`,
                  background: csatMet ? "#00A958" : "#ED484E",
                }}
              />
              <div
                className={styles.benchmarkMarker}
                style={{ left: `${csatBenchmarkPct}%` }}
                title={`Benchmark: ${csatBenchmark}`}
              />
            </div>
          </div>

          <div className={styles.benchmarkFooter}>
            <span>0</span>
            <span>Benchmark: {csatBenchmark}</span>
            <span>5.0</span>
          </div>
        </div>
      </div>

      {/* Note */}
      <div className={styles.note}>
        Cost data comes from External Registry entries. Add training costs there to see ROI calculations.
      </div>
    </div>
  );
}
