import { useEffect, useState } from "react";
import { getSkillsMatrix } from "@/api";
import type { SkillsMatrix, Skill } from "@/types";
import styles from "./SkillsMatrixPage.module.css";

const LEVEL_COLORS: Record<number, string> = {
  0: "#e5e7eb",
  1: "#dbeafe",
  2: "#93c5fd",
  3: "#3b82f6",
  4: "#1d4ed8",
};

const LEVEL_LABELS: Record<number, string> = {
  0: "—",
  1: "Basic",
  2: "Mid",
  3: "Adv",
  4: "Expert",
};

const LEVEL_TEXT_COLORS: Record<number, string> = {
  0: "#9ca3af",
  1: "#1e40af",
  2: "#1e40af",
  3: "#ffffff",
  4: "#ffffff",
};

export default function SkillsMatrixPage() {
  const [data, setData] = useState<SkillsMatrix | null>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("all");
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getSkillsMatrix()
      .then((r) => { if (!cancelled) setData(r.data); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return <div className={styles.empty}>Loading…</div>;
  }

  if (!data || data.skills.length === 0 || data.employees.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>📊</div>
        <h3>No data yet</h3>
        <p>Add skills and assessments in Django Admin</p>
      </div>
    );
  }

  const categories = ["all", ...Array.from(new Set(data.skills.map((s) => s.category)))];

  const filteredSkills: Skill[] = category === "all"
    ? data.skills
    : data.skills.filter((s) => s.category === category);

  // Group filtered skills by category for column headers
  const categoryGroups = filteredSkills.reduce<Record<string, Skill[]>>((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  return (
    <div className={styles.page}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <select
          className={styles.select}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>
          ))}
        </select>

        {/* Legend */}
        <div className={styles.legend}>
          {[0, 1, 2, 3, 4].map((lvl) => (
            <div key={lvl} className={styles.legendItem}>
              <span
                className={styles.legendSwatch}
                style={{ background: LEVEL_COLORS[lvl], border: lvl === 0 ? "1px solid #d1d5db" : "none" }}
              />
              <span className={styles.legendLabel}>{LEVEL_LABELS[lvl]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            {/* Category row */}
            <tr>
              <th className={styles.nameHeader} rowSpan={2}>Employee</th>
              {Object.entries(categoryGroups).map(([cat, skills]) => (
                <th key={cat} className={styles.categoryHeader} colSpan={skills.length}>
                  {cat}
                </th>
              ))}
            </tr>
            {/* Skill name row */}
            <tr>
              {filteredSkills.map((skill) => (
                <th key={skill.id} className={styles.skillHeader} title={skill.description}>
                  {skill.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.employees.map((emp) => (
              <tr key={emp.id}>
                <td className={styles.nameCell}>
                  <div className={styles.empName}>{emp.name}</div>
                  <div className={styles.empDept}>{emp.department}</div>
                </td>
                {filteredSkills.map((skill) => {
                  const level = emp.skill_levels[String(skill.id)] ?? 0;
                  return (
                    <td key={skill.id} className={styles.cell}>
                      <div
                        className={styles.levelBox}
                        style={{
                          background: LEVEL_COLORS[level],
                          color: LEVEL_TEXT_COLORS[level],
                          border: level === 0 ? "1px solid #d1d5db" : "none",
                        }}
                        onMouseEnter={(e) => {
                          const rect = (e.target as HTMLElement).getBoundingClientRect();
                          setTooltip({
                            text: `${emp.name} — ${skill.name}: ${LEVEL_LABELS[level]}`,
                            x: rect.left + rect.width / 2,
                            y: rect.top - 8,
                          });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      >
                        {LEVEL_LABELS[level]}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className={styles.tooltip}
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
