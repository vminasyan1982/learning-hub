import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, ClipboardList, Users, UserCheck,
  Briefcase, BarChart3, Settings, LogOut, Zap,
} from "lucide-react";
import styles from "./Sidebar.module.css";
import { useAuthStore } from "@/store/authStore";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Дашборд" },
  { to: "/portfolio", icon: Briefcase, label: "T&D Portfolio" },
  { to: "/trainings", icon: BookOpen, label: "Тренинги" },
  { to: "/registry", icon: ClipboardList, label: "Реестры" },
  { to: "/trainers", icon: Users, label: "Тренеры" },
  { to: "/trainees", icon: UserCheck, label: "Участники" },
  { to: "/assessment", icon: BarChart3, label: "Ассессмент" },
];

const adminItems = [
  { to: "/admin/users", icon: Settings, label: "Пользователи" },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <Zap size={24} className={styles.logoIcon} />
        <span className={styles.logoText}>Learning Hub</span>
      </div>

      <nav className={styles.nav}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}

        {user?.role === "admin" && (
          <>
            <div className={styles.divider} />
            {adminItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                }
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div className={styles.userMeta}>
            <div className={styles.userName}>{user?.first_name} {user?.last_name}</div>
            <div className={styles.userRole}>{user?.role}</div>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={() => logout()} title="Выход">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
