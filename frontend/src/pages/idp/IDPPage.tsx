import { useEffect, useState } from "react";
import { getIDPPlans, updateIDPGoal } from "@/api";
import type { DevelopmentPlan, DevelopmentGoal } from "@/types";
import styles from "./IDPPage.module.css";

const STATUS_LABEL: Record<DevelopmentPlan["status"], string> = {
  active: "Active",
  completed: "Completed",
  paused: "Paused",
};

const STATUS_COLOR: Record<DevelopmentPlan["status"], string> = {
  active: "#00A958",
  completed: "#6b7280",
  paused: "#f59e0b",
};

function GoalItem({
  goal,
  onToggle,
}: {
  goal: DevelopmentGoal;
  onToggle: (id: number, completed: boolean) => void;
}) {
  const [saving, setSaving] = useState(false);

  const handleToggle = async () => {
    setSaving(true);
    await onToggle(goal.id, !goal.is_completed);
    setSaving(false);
  };

  return (
    <div className={`${styles.goal} ${goal.is_completed ? styles.goalDone : ""}`}>
      <button
        className={styles.checkbox}
        onClick={handleToggle}
        disabled={saving}
        aria-label={goal.is_completed ? "Mark incomplete" : "Mark complete"}
      >
        {goal.is_completed ? (
          <span className={styles.checkboxChecked}>✓</span>
        ) : (
          <span className={styles.checkboxUnchecked} />
        )}
      </button>
      <div className={styles.goalBody}>
        <div className={styles.goalTitle}>{goal.title}</div>
        <div className={styles.goalMeta}>
          {goal.due_date && (
            <span className={styles.goalDate}>Due: {goal.due_date}</span>
          )}
          {goal.training && (
            <span className={styles.goalTraining}>Training #{goal.training}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function PlanCard({ plan, onGoalToggle }: { plan: DevelopmentPlan; onGoalToggle: (goalId: number, completed: boolean, planId: number) => void }) {
  const [expanded, setExpanded] = useState(false);
  const completedCount = plan.goals.filter((g) => g.is_completed).length;
  const totalCount = plan.goals.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className={styles.planCard}>
      <div className={styles.planHeader} onClick={() => setExpanded((e) => !e)}>
        <div className={styles.planInfo}>
          <div className={styles.planTitle}>{plan.title}</div>
          <div className={styles.planMeta}>
            <span className={styles.planYear}>{plan.year}</span>
            <span
              className={styles.statusBadge}
              style={{
                background: STATUS_COLOR[plan.status] + "22",
                color: STATUS_COLOR[plan.status],
              }}
            >
              {STATUS_LABEL[plan.status]}
            </span>
          </div>
        </div>

        <div className={styles.planProgress}>
          <div className={styles.progressText}>
            {completedCount}/{totalCount} goals
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${progress}%`,
                background: progress === 100 ? "#00A958" : "var(--color-primary)",
              }}
            />
          </div>
          <div className={styles.progressPct}>{progress}%</div>
        </div>

        <div className={styles.expandIcon}>{expanded ? "▲" : "▼"}</div>
      </div>

      {expanded && (
        <div className={styles.planBody}>
          {plan.notes && <p className={styles.planNotes}>{plan.notes}</p>}
          {plan.goals.length === 0 ? (
            <p className={styles.noGoals}>No goals defined yet.</p>
          ) : (
            <div className={styles.goalsList}>
              {plan.goals
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((goal) => (
                  <GoalItem
                    key={goal.id}
                    goal={goal}
                    onToggle={(id, completed) => onGoalToggle(id, completed, plan.id)}
                  />
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function IDPPage() {
  const [plans, setPlans] = useState<DevelopmentPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getIDPPlans()
      .then((r) => { if (!cancelled) setPlans(r.data.results); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleGoalToggle = async (goalId: number, completed: boolean, planId: number) => {
    await updateIDPGoal(goalId, { is_completed: completed });
    setPlans((prev) =>
      prev.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              goals: plan.goals.map((g) =>
                g.id === goalId ? { ...g, is_completed: completed } : g
              ),
            }
          : plan
      )
    );
  };

  if (loading) {
    return <div className={styles.empty}>Loading…</div>;
  }

  if (plans.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🎯</div>
        <h3>No development plans yet</h3>
        <p>Ask your manager to create one in Django Admin.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.plansList}>
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} onGoalToggle={handleGoalToggle} />
        ))}
      </div>
    </div>
  );
}
