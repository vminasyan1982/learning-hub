import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePassword } from "@/api";
import { useAuthStore } from "@/store/authStore";
import styles from "./AuthPage.module.css";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { fetchMe } = useAuthStore();
  const [form, setForm] = useState({ old_password: "", new_password: "", new_password_confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.new_password !== form.new_password_confirm) {
      setError("Новые пароли не совпадают.");
      return;
    }
    setLoading(true);
    try {
      await changePassword(form);
      await fetchMe();
      navigate("/");
    } catch (err: any) {
      const data = err.response?.data;
      setError(typeof data === "object" ? Object.values(data).flat().join(" ") : "Ошибка смены пароля.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h2 style={{ textAlign: "center", marginBottom: 8, color: "var(--color-primary)" }}>Смена пароля</h2>
        <p className={styles.subtitle}>Для безопасности смените временный пароль</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Текущий пароль</label>
            <input type="password" value={form.old_password} onChange={(e) => setForm({ ...form, old_password: e.target.value })} required />
          </div>
          <div className={styles.field}>
            <label>Новый пароль</label>
            <input type="password" value={form.new_password} onChange={(e) => setForm({ ...form, new_password: e.target.value })} required />
          </div>
          <div className={styles.field}>
            <label>Подтвердите новый пароль</label>
            <input type="password" value={form.new_password_confirm} onChange={(e) => setForm({ ...form, new_password_confirm: e.target.value })} required />
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? "Сохраняем…" : "Сохранить пароль"}
          </button>
        </form>
      </div>
    </div>
  );
}
