import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";

import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import TrainingsPage from "@/pages/trainings/TrainingsPage";
import RegistryPage from "@/pages/registry/RegistryPage";
import TrainersPage from "@/pages/trainers/TrainersPage";
import TraineesPage from "@/pages/trainees/TraineesPage";
import PortfolioPage from "@/pages/portfolio/PortfolioPage";
import AssessmentPage from "@/pages/AssessmentPage";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import ChangePasswordPage from "@/pages/auth/ChangePasswordPage";
import ProfilePage from "@/pages/profile/ProfilePage";

export default function App() {
  const { fetchMe } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/trainings" element={<TrainingsPage />} />
            <Route path="/registry" element={<RegistryPage />} />
            <Route path="/trainers" element={<TrainersPage />} />
            <Route path="/trainees" element={<TraineesPage />} />
            <Route path="/assessment" element={<AssessmentPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
