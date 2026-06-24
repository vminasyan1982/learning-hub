import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import styles from "./Layout.module.css";
import { useAuthStore } from "@/store/authStore";
import { Navigate } from "react-router-dom";
import SupportWidget from "@/components/support/SupportWidget";

export default function Layout() {
  const { user } = useAuthStore();

  if (user?.must_change_password) {
    return <Navigate to="/change-password" replace />;
  }

  return (
    <div className={styles.root}>
      <Sidebar />
      <div className={styles.main}>
        <Header />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
      <SupportWidget />
    </div>
  );
}
