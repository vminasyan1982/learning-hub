import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sun, Moon, User, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import styles from "./Header.module.css";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/portfolio": "T&D Portfolio",
  "/trainings": "Trainings",
  "/registry/internal": "Internal Registry",
  "/registry/external": "External Registry",
  "/trainers": "Trainers",
  "/trainees": "Participants",
  "/assessment": "Assessment",
  "/compliance": "Compliance",
  "/budget": "Budget",
  "/skills": "Skills Matrix",
  "/idp": "My Development Plan",
  "/roi": "ROI Calculator",
  "/admin/users": "User Management",
  "/change-password": "Change Password",
  "/profile": "My Profile",
};

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, toggle } = useThemeStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const title = titles[pathname] || "Learning Hub";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = `${user?.first_name?.[0] || ""}${user?.last_name?.[0] || ""}` || user?.username?.[0]?.toUpperCase() || "?";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>

      <div className={styles.right} ref={ref}>
        <button className={styles.themeBtn} onClick={toggle} title={theme === "dark" ? "Switch to light" : "Switch to dark"}>
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button className={styles.avatar} onClick={() => setOpen((o) => !o)}>
          {initials}
        </button>

        {open && (
          <div className={styles.dropdown}>
            <div className={styles.dropdownHeader}>
              <div className={styles.dropdownName}>{user?.first_name} {user?.last_name}</div>
              <div className={styles.dropdownRole}>{user?.role}</div>
            </div>
            <div className={styles.dropdownDivider} />
            <button className={styles.dropdownItem} onClick={() => { navigate("/profile"); setOpen(false); }}>
              <User size={14} /> My Profile
            </button>
            <button className={styles.dropdownItem} onClick={() => { toggle(); setOpen(false); }}>
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
            <div className={styles.dropdownDivider} />
            <button className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`} onClick={handleLogout}>
              <LogOut size={14} /> Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
