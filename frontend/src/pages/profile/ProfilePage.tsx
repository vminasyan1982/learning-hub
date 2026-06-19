import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { updateMe } from "@/api";
import styles from "../auth/AuthPage.module.css";

export default function ProfilePage() {
  const { user, fetchMe } = useAuthStore();
  const [form, setForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    position: user?.position || "",
    department: user?.department || "",
    business_unit: user?.business_unit || "",
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess(false); setLoading(true);
    try {
      await updateMe(form);
      await fetchMe();
      setSuccess(true);
    } catch (err: any) {
      const data = err.response?.data;
      setError(data && typeof data === "object" ? Object.values(data).flat().join(" ") : "Update failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "32px 16px" }}>
      <h2 style={{ marginBottom: 24, color: "var(--color-primary)" }}>My Profile</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.grid2}>
          <div className={styles.field}>
            <label>First name</label>
            <input value={form.first_name} onChange={(e) => set("first_name", e.target.value)} />
          </div>
          <div className={styles.field}>
            <label>Last name</label>
            <input value={form.last_name} onChange={(e) => set("last_name", e.target.value)} />
          </div>
        </div>
        <div className={styles.grid2}>
          <div className={styles.field}>
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div className={styles.field}>
            <label>Phone</label>
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
        </div>
        <div className={styles.field}>
          <label>Position</label>
          <input value={form.position} onChange={(e) => set("position", e.target.value)} />
        </div>
        <div className={styles.grid2}>
          <div className={styles.field}>
            <label>Department</label>
            <input value={form.department} onChange={(e) => set("department", e.target.value)} />
          </div>
          <div className={styles.field}>
            <label>Business unit</label>
            <input value={form.business_unit} onChange={(e) => set("business_unit", e.target.value)} />
          </div>
        </div>
        {error && <div className={styles.error}>{error}</div>}
        {success && <div style={{ color: "var(--color-accent)", fontSize: 13 }}>✓ Profile updated successfully</div>}
        <button type="submit" className={styles.btn} disabled={loading}>
          {loading ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
