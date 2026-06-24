import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, ClipboardList, Users, UserCheck,
  Briefcase, BarChart3, Settings, LogOut, Zap, ShieldCheck, DollarSign,
  Grid, Target, TrendingUp,
} from "lucide-react";
import styles from "./Sidebar.module.css";
import { useAuthStore } from "@/store/authStore";
import { useLang } from "@/i18n/LangContext";

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { t } = useLang();

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: t("nav_dashboard") },
    { to: "/portfolio", icon: Briefcase, label: t("nav_portfolio") },
    { to: "/trainings", icon: BookOpen, label: t("nav_trainings") },
    { to: "/registry/internal", icon: ClipboardList, label: t("nav_registry_internal") },
    { to: "/registry/external", icon: ClipboardList, label: t("nav_registry_external") },
    { to: "/trainers", icon: Users, label: t("nav_trainers") },
    { to: "/trainees", icon: UserCheck, label: t("nav_participants") },
    { to: "/assessment", icon: BarChart3, label: t("nav_assessment") },
    { to: "/compliance", icon: ShieldCheck, label: t("nav_compliance") },
    { to: "/budget", icon: DollarSign, label: t("nav_budget") },
    { to: "/skills", icon: Grid, label: t("nav_skills") },
    { to: "/idp", icon: Target, label: t("nav_idp") },
    { to: "/roi", icon: TrendingUp, label: t("nav_roi") },
  ];

  const adminItems = [
    { to: "/admin/users", icon: Settings, label: t("nav_users") },
  ];

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
        <button className={styles.logoutBtn} onClick={() => logout()} title="Log out">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
