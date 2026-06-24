import { useEffect, useState } from "react";
import { getTrainers, getTrainerProfile } from "@/api";
import type { Trainer } from "@/types";
import Badge from "@/components/ui/Badge";
import styles from "../trainings/TrainingsPage.module.css";
import cardStyles from "./TrainersPage.module.css";
import { X } from "lucide-react";

type TrainerProfile = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  bio: string;
  trainer_types: string[];
  is_internal: boolean;
  training_count: number;
  format_breakdown: Record<string, number>;
  history: Array<{
    id: number;
    title: string;
    date: string | null;
    format: string;
    nps_percent: number | null;
    csat_percent: number | null;
    participants_count: number;
    business_units: string[];
  }>;
};

const FORMAT_COLORS: Record<string, string> = {
  online: "#2563eb",
  offline: "#16a34a",
  mixed: "#9333ea",
};

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getTrainers({ search })
      .then((r) => setTrainers(r.data.results))
      .finally(() => setLoading(false));
  }, [search]);

  const openProfile = async (id: number) => {
    setProfileLoading(true);
    setProfile(null);
    try {
      const res = await getTrainerProfile(id);
      setProfile(res.data);
    } catch {
      // ignore
    } finally {
      setProfileLoading(false);
    }
  };

  const initials = (p: TrainerProfile) =>
    `${p.first_name?.[0] || ""}${p.last_name?.[0] || ""}`.toUpperCase() || "?";

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <input className={styles.search} placeholder="Search trainer…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className={styles.center}>Loading…</div>
      ) : (
        <div className={cardStyles.grid}>
          {trainers.map((t) => (
            <div
              key={t.id}
              className={cardStyles.card}
              onClick={() => openProfile(t.id)}
              style={{ cursor: "pointer" }}
            >
              <div className={cardStyles.avatar}>
                {t.photo ? <img src={t.photo} alt={t.last_name} /> : <span>{t.first_name[0]}{t.last_name[0]}</span>}
              </div>
              <div className={cardStyles.name}>{t.first_name} {t.last_name}</div>
              <Badge variant={t.is_internal ? "success" : "info"}>{t.is_internal ? "Internal" : "External"}</Badge>
              <div className={cardStyles.metrics}>
                <div><strong>NPS:</strong> {t.avg_nps || "—"}</div>
                <div><strong>CSAT:</strong> {t.avg_csat || "—"}</div>
              </div>
              {t.email && <div className={cardStyles.email}>{t.email}</div>}
            </div>
          ))}
          {trainers.length === 0 && <div className={styles.center}>No trainers found</div>}
        </div>
      )}

      {/* Profile Modal */}
      {(profileLoading || profile) && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 800,
            background: "rgba(0,0,0,0.45)", display: "flex",
            alignItems: "center", justifyContent: "center", padding: 24,
          }}
          onClick={() => { setProfile(null); setProfileLoading(false); }}
        >
          <div
            style={{
              background: "var(--color-white)", borderRadius: 16,
              width: "100%", maxWidth: 700, maxHeight: "90vh",
              overflowY: "auto", position: "relative",
              boxShadow: "0 8px 40px rgba(0,0,0,0.22)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => { setProfile(null); setProfileLoading(false); }}
              style={{
                position: "absolute", top: 14, right: 14, zIndex: 10,
                background: "var(--color-gray-100)", border: "none", borderRadius: 8,
                cursor: "pointer", padding: 6, display: "flex", alignItems: "center",
              }}
            >
              <X size={18} />
            </button>

            {profileLoading && (
              <div style={{ padding: 60, textAlign: "center", color: "var(--color-gray-500)" }}>
                Loading profile…
              </div>
            )}

            {profile && (
              <>
                {/* Modal Header */}
                <div style={{
                  background: "linear-gradient(135deg, var(--color-primary) 0%, #1d4ed8 100%)",
                  padding: "28px 28px 24px",
                  display: "flex", alignItems: "center", gap: 20,
                }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: "50%",
                    background: "rgba(255,255,255,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, fontWeight: 700, color: "#fff", flexShrink: 0,
                  }}>
                    {initials(profile)}
                  </div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>
                      {profile.first_name} {profile.last_name}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                      <span style={{
                        background: profile.is_internal ? "#16a34a" : "#2563eb",
                        color: "#fff", borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 600,
                      }}>
                        {profile.is_internal ? "Internal" : "External"}
                      </span>
                      {profile.trainer_types.map((type) => (
                        <span key={type} style={{
                          background: "rgba(255,255,255,0.2)", color: "#fff",
                          borderRadius: 6, padding: "2px 10px", fontSize: 12,
                        }}>
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Info cards */}
                <div style={{ padding: "20px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {profile.email && (
                      <div style={{ background: "var(--color-gray-50)", borderRadius: 10, padding: "12px 16px" }}>
                        <div style={{ fontSize: 11, color: "var(--color-gray-500)", fontWeight: 600, marginBottom: 4 }}>EMAIL</div>
                        <div style={{ fontSize: 13, color: "var(--color-gray-800)" }}>{profile.email}</div>
                      </div>
                    )}
                    {profile.phone && (
                      <div style={{ background: "var(--color-gray-50)", borderRadius: 10, padding: "12px 16px" }}>
                        <div style={{ fontSize: 11, color: "var(--color-gray-500)", fontWeight: 600, marginBottom: 4 }}>PHONE</div>
                        <div style={{ fontSize: 13, color: "var(--color-gray-800)" }}>{profile.phone}</div>
                      </div>
                    )}
                    <div style={{ background: "var(--color-gray-50)", borderRadius: 10, padding: "12px 16px" }}>
                      <div style={{ fontSize: 11, color: "var(--color-gray-500)", fontWeight: 600, marginBottom: 4 }}>TRAININGS</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-primary)" }}>{profile.training_count}</div>
                    </div>
                    {Object.keys(profile.format_breakdown).length > 0 && (
                      <div style={{ background: "var(--color-gray-50)", borderRadius: 10, padding: "12px 16px" }}>
                        <div style={{ fontSize: 11, color: "var(--color-gray-500)", fontWeight: 600, marginBottom: 6 }}>FORMAT BREAKDOWN</div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {Object.entries(profile.format_breakdown).map(([fmt, cnt]) => (
                            <span key={fmt} style={{
                              background: FORMAT_COLORS[fmt] || "#6b7280",
                              color: "#fff", borderRadius: 6, padding: "2px 8px", fontSize: 12, fontWeight: 600,
                            }}>
                              {fmt}: {cnt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {profile.bio && (
                    <div style={{ background: "var(--color-gray-50)", borderRadius: 10, padding: "12px 16px" }}>
                      <div style={{ fontSize: 11, color: "var(--color-gray-500)", fontWeight: 600, marginBottom: 6 }}>BIO</div>
                      <div style={{ fontSize: 13, color: "var(--color-gray-700)", lineHeight: 1.6 }}>{profile.bio}</div>
                    </div>
                  )}

                  {/* Training history */}
                  {profile.history.length > 0 && (
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-gray-800)", marginBottom: 10 }}>
                        Training History
                      </div>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                          <thead>
                            <tr style={{ background: "var(--color-gray-50)" }}>
                              {["Title", "Date", "Format", "BU", "NPS%", "CSAT%", "Participants"].map((col) => (
                                <th key={col} style={{
                                  padding: "8px 10px", textAlign: "left",
                                  color: "var(--color-gray-500)", fontWeight: 600,
                                  borderBottom: "1px solid var(--color-gray-200)",
                                  whiteSpace: "nowrap",
                                }}>
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {profile.history.map((row) => (
                              <tr key={row.id} style={{ borderBottom: "1px solid var(--color-gray-100)" }}>
                                <td style={{ padding: "8px 10px", color: "var(--color-gray-800)", maxWidth: 180 }}>
                                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={row.title}>
                                    {row.title}
                                  </div>
                                </td>
                                <td style={{ padding: "8px 10px", color: "var(--color-gray-600)", whiteSpace: "nowrap" }}>
                                  {row.date ? new Date(row.date).toLocaleDateString() : "—"}
                                </td>
                                <td style={{ padding: "8px 10px" }}>
                                  <span style={{
                                    background: FORMAT_COLORS[row.format] || "#6b7280",
                                    color: "#fff", borderRadius: 4, padding: "1px 7px", fontSize: 11, fontWeight: 600,
                                  }}>
                                    {row.format}
                                  </span>
                                </td>
                                <td style={{ padding: "8px 10px", color: "var(--color-gray-600)", fontSize: 11 }}>
                                  {row.business_units.join(", ") || "—"}
                                </td>
                                <td style={{ padding: "8px 10px", color: "var(--color-gray-700)", textAlign: "center" }}>
                                  {row.nps_percent != null ? `${row.nps_percent}%` : "—"}
                                </td>
                                <td style={{ padding: "8px 10px", color: "var(--color-gray-700)", textAlign: "center" }}>
                                  {row.csat_percent != null ? `${row.csat_percent}%` : "—"}
                                </td>
                                <td style={{ padding: "8px 10px", color: "var(--color-gray-700)", textAlign: "center" }}>
                                  {row.participants_count}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
