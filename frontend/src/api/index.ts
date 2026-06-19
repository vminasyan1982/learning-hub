import api from "./client";
import type {
  AuthTokens, User, InvitationToken, RegistrationRequest,
  Training, InternalRegistryEntry, Trainer, Trainee, PortfolioItem,
  AnalyticsSummary, TrendPoint, PaginatedResponse,
} from "@/types";

// Auth
export const login = (username: string, password: string) =>
  api.post<AuthTokens>("/auth/login/", { username, password });

export const logout = (refresh: string) =>
  api.post("/auth/logout/", { refresh });

export const getMe = () => api.get<User>("/auth/me/");

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

// Trainers
export const getTrainers = (params?: object) =>
  api.get<PaginatedResponse<Trainer>>("/trainers/", { params });
export const createTrainer = (data: object) => api.post<Trainer>("/trainers/", data);
export const updateTrainer = (id: number, data: object) => api.patch<Trainer>(`/trainers/${id}/`, data);

// Trainees
export const getTrainees = (params?: object) =>
  api.get<PaginatedResponse<Trainee>>("/trainees/", { params });
export const createTrainee = (data: object) => api.post<Trainee>("/trainees/", data);

// Portfolio
export const getPortfolio = () => api.get<PaginatedResponse<PortfolioItem>>("/portfolio/");
export const createPortfolioItem = (data: object) => api.post<PortfolioItem>("/portfolio/", data);
export const updatePortfolioItem = (id: number, data: object) => api.patch<PortfolioItem>(`/portfolio/${id}/`, data);
