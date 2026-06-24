import api from "./client";
import type {
  AuthTokens, User, InvitationToken, RegistrationRequest,
  Training, InternalRegistryEntry, ExternalRegistryEntry, Trainer, Trainee, PortfolioItem,
  AnalyticsSummary, TrendPoint, PaginatedResponse, ComplianceSummary, BudgetSummary,
  SkillsMatrix, DevelopmentPlan, DevelopmentGoal, ROISummary,
} from "@/types";

// Auth
export const login = (username: string, password: string) =>
  api.post<AuthTokens>("/auth/login/", { username, password });

export const logout = (refresh: string) =>
  api.post("/auth/logout/", { refresh });

export const getMe = () => api.get<User>("/auth/me/");
export const updateMe = (data: object) => api.patch<User>("/auth/me/", data);

export const changePassword = (data: { old_password: string; new_password: string; new_password_confirm: string }) =>
  api.post("/auth/change-password/", data);

// Registration
export const validateToken = (token: string) =>
  api.get<{ valid: boolean; error?: string }>(`/register/validate-token/?token=${token}`);

export const getLookups = (category: "department" | "position" | "business_unit") =>
  api.get<string[]>(`/register/lookups/?category=${category}`);

export const submitRegistration = (data: object) =>
  api.post("/register/", data);

// Admin: invitations
export const getInvitations = () => api.get<PaginatedResponse<InvitationToken>>("/admin-panel/invitations/");
export const createInvitation = (data: { note?: string }) =>
  api.post<InvitationToken>("/admin-panel/invitations/", data);

// Admin: registration requests
export const getRegistrationRequests = (status?: string) =>
  api.get<PaginatedResponse<RegistrationRequest>>("/admin-panel/registrations/", { params: { status } });
export const approveRegistration = (id: number, role: string) =>
  api.post(`/admin-panel/registrations/${id}/approve/`, { role });
export const denyRegistration = (id: number, reason?: string) =>
  api.post(`/admin-panel/registrations/${id}/deny/`, { reason });

// Users
export const getUsers = (params?: object) =>
  api.get<PaginatedResponse<User>>("/users/", { params });

// Analytics
export const getAnalyticsSummary = (params?: object) =>
  api.get<AnalyticsSummary>("/analytics/summary/", { params });
export const getAnalyticsTrends = (params?: object) =>
  api.get<TrendPoint[]>("/analytics/trends/", { params });

// Trainings
export const getTrainings = (params?: object) =>
  api.get<PaginatedResponse<Training>>("/trainings/", { params });
export const getTraining = (id: number) => api.get<Training>(`/trainings/${id}/`);
export const createTraining = (data: object) => api.post<Training>("/trainings/", data);
export const updateTraining = (id: number, data: object) => api.patch<Training>(`/trainings/${id}/`, data);
export const deleteTraining = (id: number) => api.delete(`/trainings/${id}/`);

// Registry
export const getInternalRegistry = (params?: object) =>
  api.get<PaginatedResponse<InternalRegistryEntry>>("/registry/internal/", { params });
export const createInternalEntry = (data: object) =>
  api.post<InternalRegistryEntry>("/registry/internal/", data);
export const updateInternalEntry = (id: number, data: object) =>
  api.patch<InternalRegistryEntry>(`/registry/internal/${id}/`, data);
export const deleteInternalEntry = (id: number) =>
  api.delete(`/registry/internal/${id}/`);

export const getExternalRegistry = (params?: object) =>
  api.get<PaginatedResponse<ExternalRegistryEntry>>("/registry/external/", { params });

// Trainers
export const getTrainers = (params?: object) =>
  api.get<PaginatedResponse<Trainer>>("/trainers/", { params });
export const createTrainer = (data: object) => api.post<Trainer>("/trainers/", data);
export const updateTrainer = (id: number, data: object) => api.patch<Trainer>(`/trainers/${id}/`, data);

// Trainees
export const getTrainees = (params?: object) =>
  api.get<PaginatedResponse<Trainee>>("/trainees/", { params });
export const createTrainee = (data: object) => api.post<Trainee>("/trainees/", data);
export const getTrainingParticipants = (trainingId: number) =>
  api.get<PaginatedResponse<{ id: number; trainee: number; trainee_name: string; trainee_position: string; trainee_department: string; attended: boolean; completion_date: string | null }>>("/trainees/participations/", { params: { training: trainingId, page_size: 200 } });
export const getTraineeHistory = (traineeId: number) =>
  api.get<PaginatedResponse<{ id: number; training: number; training_title: string; training_date: string | null; training_format: string; attended: boolean; completion_date: string | null; notes: string }>>("/trainees/participations/", { params: { trainee: traineeId, page_size: 200 } });

// Portfolio
export const getPortfolio = (params?: object) => api.get<PaginatedResponse<PortfolioItem>>("/portfolio/", { params });
export const createPortfolioItem = (data: object) => api.post<PortfolioItem>("/portfolio/", data);
export const updatePortfolioItem = (id: number, data: object) => api.patch<PortfolioItem>(`/portfolio/${id}/`, data);

// Compliance & Budget
export const getCompliance = () => api.get<ComplianceSummary>("/analytics/compliance/");
export const getBudget = (year?: string) => api.get<BudgetSummary>("/analytics/budget/", { params: { year } });

// Skills Matrix
export const getSkillsMatrix = () => api.get<SkillsMatrix>("/skills/matrix/");

// IDP
export const getIDPPlans = (params?: object) => api.get<PaginatedResponse<DevelopmentPlan>>("/idp/", { params });
export const updateIDPGoal = (id: number, data: object) => api.patch<DevelopmentGoal>(`/idp/goals/${id}/`, data);

// ROI
export const getROI = (year?: string) => api.get<ROISummary>("/analytics/roi/", { params: { year } });

// Trainer profile
export const getTrainerProfile = (id: number) =>
  api.get<{
    id: number; first_name: string; last_name: string; email: string; phone: string;
    bio: string; trainer_types: string[]; is_internal: boolean; training_count: number;
    format_breakdown: Record<string, number>;
    history: Array<{ id: number; title: string; date: string | null; format: string; nps_percent: number | null; csat_percent: number | null; participants_count: number; business_units: string[] }>;
  }>(`/trainers/${id}/profile/`);

// Support
export const postSupport = (data: { name: string; message: string }) =>
  api.post("/support/", data);
