import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { validateToken, submitRegistration, getLookups } from "@/api";
import { Zap, CheckCircle, XCircle } from "lucide-react";
import styles from "./AuthPage.module.css";

const ROLES = [
  { value: "viewer", label: "View only" },
  { value: "td_team", label: "T&D Team" },
  { value: "manager", label: "Manager" },
];

export default function RegisterPage() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";

  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenError, setTokenError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [departments, setDepartments] = useState<string[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [businessUnits, setBusinessUnits] = useState<string[]>([]);

  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "",
    position: "", department: "", business_unit: "", requested_role: "viewer",
  });

  useEffect(() => {
    if (!token) { setTokenError("The link does not contain an invitation token."); setTokenValid(false); return; }
    validateToken(token)
      .then(() => setTokenValid(true))
      .catch((err) => {
        setTokenValid(false);
        setTokenError(err.response?.data?.error || "The link is invalid or has expired.");
      });
  }, [token]);

  useEffect(() => {
    getLookups("department").then((r) => setDepartments(r.data)).catch(() => {});
    getLookups("position").then((r) => setPositions(r.data)).catch(() => {});
    getLookups("business_unit").then((r) => setBusinessUnits(r.data)).catch(() => {});
  }, []);

  const set = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await submitRegistration({ ...form, token });
      setSubmitted(true);
    } catch (err: any) {
      const data = err.response?.data;
      let msg = "An error occurred. Please try again.";
      if (data && typeof data === "object") {
        msg = Object.values(data).flat().join(" ");
      } else if (err.response?.status === 429) {
        msg = "Too many attempts. Please try again in an hour.";
      } else if (err.response?.status === 403) {
        msg = "Access denied. Please try again later.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <CheckCircle size={48} color="var(--color-accent)" style={{ margin: "0 auto 16px" }} />
          <h2 style={{ textAlign: "center", marginBottom: 8 }}>Request submitted!</h2>
          <p style={{ textAlign: "center", color: "var(--color-gray-600)", fontSize: 14 }}>
            An administrator will review your request and notify you by email.
          </p>
        </div>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <XCircle size={48} color="var(--color-danger)" style={{ margin: "0 auto 16px" }} />
          <h2 style={{ textAlign: "center", marginBottom: 8 }}>Invalid link</h2>
          <p style={{ textAlign: "center", color: "var(--color-gray-600)", fontSize: 14 }}>
            {tokenError}
          </p>
        </div>
      </div>
    );
  }

  if (tokenValid === null) {
    return (
      <div className={styles.page}>
        <div className={styles.card} style={{ textAlign: "center" }}>
          Verifying invitation link…
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={`${styles.card} ${styles.cardWide}`}>
        <div className={styles.logo}>
          <Zap size={28} color="var(--color-accent)" />
          <h1>Learning Hub</h1>
        </div>
        <p className={styles.subtitle}>Fill in the form to request access</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label>First name *</label>
              <input required value={form.first_name} onChange={(e) => set("first_name", e.target.value)} placeholder="First name" />
            </div>
            <div className={styles.field}>
              <label>Last name *</label>
              <input required value={form.last_name} onChange={(e) => set("last_name", e.target.value)} placeholder="Last name" />
            </div>
          </div>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label>Email *</label>
              <input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="email@company.com" />
            </div>
            <div className={styles.field}>
              <label>Phone</label>
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+374 XX XXX XXX" />
            </div>
          </div>
          <div className={styles.field}>
            <label>Position *</label>
            {positions.length > 0 ? (
              <select required value={form.position} onChange={(e) => set("position", e.target.value)}>
                <option value="">— select position —</option>
                {positions.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            ) : (
              <input required value={form.position} onChange={(e) => set("position", e.target.value)} placeholder="Your position" />
            )}
          </div>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label>Department *</label>
              {departments.length > 0 ? (
                <select required value={form.department} onChange={(e) => set("department", e.target.value)}>
                  <option value="">— select department —</option>
                  {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              ) : (
                <input required value={form.department} onChange={(e) => set("department", e.target.value)} placeholder="Department" />
              )}
            </div>
            <div className={styles.field}>
              <label>Business unit *</label>
              {businessUnits.length > 0 ? (
                <select required value={form.business_unit} onChange={(e) => set("business_unit", e.target.value)}>
                  <option value="">— select business unit —</option>
                  {businessUnits.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              ) : (
                <input required value={form.business_unit} onChange={(e) => set("business_unit", e.target.value)} placeholder="Business unit" />
              )}
            </div>
          </div>
          <div className={styles.field}>
            <label>Requested role</label>
            <select value={form.requested_role} onChange={(e) => set("requested_role", e.target.value)}>
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? "Submitting…" : "Submit request"}
          </button>
        </form>
      </div>
    </div>
  );
}
