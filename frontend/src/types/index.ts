export type UserRole = "admin" | "manager" | "td_team" | "viewer";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  department: string;
  business_unit: string;
  position: string;
  phone: string;
  is_active: boolean;
  date_joined: string;
  must_change_password: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface InvitationToken {
  id: number;
  token: string;
  note: string;
  is_used: boolean;
  is_valid: boolean;
  expires_at: string;
  created_at: string;
  invite_url: string;
  created_by: { id: number; first_name: string; last_name: string; email: string; role: UserRole };
}

export interface RegistrationRequest {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  business_unit: string;
  requested_role: UserRole;
  status: "pending" | "approved" | "denied";
  denial_reason: string;
  created_at: string;
}

export type TrainingFormat = "online" | "offline" | "mixed";

export interface BusinessUnit {
  id: number;
  name: string;
}

export interface TrainingMetric {
  id: number;
  nps_score: number | null;
  nps_percent: number | null;
  csat_score: number | null;
  csat_percent: number | null;
  business_value: number | null;
  lh_standards_score: number | null;
  trainer_rating: number | null;
  discipline_ok: boolean;
  participants_count: number;
  notes: string;
}

export interface Training {
  id: number;
  title: string;
  date: string;
  end_date: string | null;
  location: string;
  format: TrainingFormat;
  classification: string;
  business_units: BusinessUnit[];
  description: string;
  lms_url: string;
  asana_url: string;
  drive_url: string;
  feedback_url: string;
  is_internal: boolean;
  metric: TrainingMetric | null;
  created_at: string;
}

export type RegistryStatus = "not_started" | "in_progress" | "on_hold" | "completed" | "at_risk" | "cancelled" | "done";
export type RegistryCenter = "td" | "assessment";

export interface ExternalRegistryEntry {
  id: number;
  title: string;
  provider: string;
  date: string | null;
  cost: number | null;
  currency: string;
  notes: string;
  created_at: string;
}

export interface InternalRegistryEntry {
  id: number;
  request_date: string;
  center: RegistryCenter;
  format: string;
  title: string;
  asana_url: string;
  project_manager: string;
  developers: string;
  deadline: string | null;
  status: RegistryStatus;
  completed_on_time: boolean | null;
  materials_url: string;
  comments: string;
  created_at: string;
}

export interface Trainer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  bio: string;
  photo: string | null;
  trainer_types: string[];
  is_internal: boolean;
  is_active: boolean;
  avg_nps: number;
  avg_csat: number;
  training_count: number;
  created_at: string;
}

export interface Trainee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  position: string;
  department: string;
  business_unit: string;
  is_active: boolean;
}

export interface PortfolioItem {
  id: number;
  promo_name: string;
  internal_name: string;
  banner: string | null;
  skills: string;
  language: string;
  enrollment_info: string;
  description: string;
  duration: string;
  lms_url: string;
  participants_count: number;
  is_active: boolean;
  order: number;
}

export interface AnalyticsSummary {
  total_trainings: number;
  online_count: number;
  offline_count: number;
  mixed_count: number;
  avg_nps: number;
  avg_nps_pct: number;
  nps_target_met: number;
  avg_csat: number;
  avg_csat_pct: number;
  csat_target_met: number;
  avg_lh_standards: number;
  avg_trainer_rating: number;
  trainer_rating_met: number;
  total_participants: number;
  avg_participants_per_training: number;
  total_trainers: number;
  internal_trainers: number;
  external_trainers: number;
  total_metrics: number;
  business_value_pct: number;
  projects_in_progress: number;
  bu_breakdown: Array<{ name: string; project_count: number }>;
}

export interface TrendPoint {
  period: string;
  avg_nps: number;
  avg_csat: number;
  count: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ComplianceTraining {
  id: number;
  title: string;
  deadline: string | null;
  completed: number;
  total: number;
  compliance_pct: number;
  status: "green" | "yellow" | "red";
}

export interface ComplianceSummary {
  total_mandatory: number;
  overall_compliance_pct: number;
  total_trainees: number;
  trainings: ComplianceTraining[];
}

export interface BudgetQuarter {
  quarter: string;
  planned: number;
  actual: number;
}

export interface BudgetSummary {
  year: string;
  total_planned: number;
  total_actual: number;
  variance: number;
  by_quarter: BudgetQuarter[];
}

export interface Skill {
  id: number;
  name: string;
  category: string;
  description: string;
  order: number;
  is_active: boolean;
}

export interface SkillEmployee {
  id: number;
  name: string;
  department: string;
  skill_levels: Record<string, number>; // skill_id → level (0-4)
}

export interface SkillsMatrix {
  skills: Skill[];
  employees: SkillEmployee[];
}

export interface DevelopmentGoal {
  id: number;
  title: string;
  description: string;
  training: number | null;
  due_date: string | null;
  is_completed: boolean;
  completed_at: string | null;
  order: number;
}

export interface DevelopmentPlan {
  id: number;
  employee: number;
  title: string;
  year: number;
  status: "active" | "completed" | "paused";
  notes: string;
  goals: DevelopmentGoal[];
  created_at: string;
}

export interface ROISummary {
  year: string;
  total_cost: number;
  total_participants: number;
  total_trainings: number;
  cost_per_participant: number;
  avg_nps: number;
  avg_csat: number;
  nps_benchmark: number;
  csat_benchmark: number;
}
