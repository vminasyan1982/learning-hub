import { useLocation } from "react-router-dom";
import styles from "./Header.module.css";

const titles: Record<string, string> = {
  "/": "Главный дашборд",
  "/portfolio": "T&D Portfolio",
  "/trainings": "Тренинги",
  "/registry": "Реестры",
  "/trainers": "Тренеры",
  "/trainees": "Участники",
  "/assessment": "Ассессмент-центр",
  "/admin/users": "Управление пользователями",
  "/change-password": "Смена пароля",
};

export default function Header() {
  const { pathname } = useLocation();
  const title = titles[pathname] || "Learning Hub";

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
    </header>
  );
}
