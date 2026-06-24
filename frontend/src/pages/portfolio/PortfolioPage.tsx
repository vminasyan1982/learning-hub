import { useEffect, useState } from "react";
import { getPortfolio } from "@/api";
import type { PortfolioItem } from "@/types";
import styles from "./PortfolioPage.module.css";
import { X, Users, Clock, Globe, ExternalLink } from "lucide-react";

const LANGUAGES = ["Русский", "English"];

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PortfolioItem | null>(null);
  const [langFilter, setLangFilter] = useState("");

  useEffect(() => {
    getPortfolio().then((r) => setItems(r.data.results)).finally(() => setLoading(false));
  }, []);

  const visible = langFilter
    ? items.filter((i) => i.language.toLowerCase().includes(langFilter.toLowerCase()))
    : items;

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--color-gray-500)" }}>Loading…</div>;

  return (
    <>
      <div className={styles.page}>
      <div className={styles.filters}>
        {["", ...LANGUAGES].map((lang) => {
          const active = langFilter === lang;
          return (
            <button
              key={lang}
              onClick={() => setLangFilter(lang)}
              style={{
                padding: "6px 18px", borderRadius: 20, fontFamily: "inherit",
                fontSize: 13, cursor: "pointer", transition: "all 0.15s",
                border: active ? "1.5px solid var(--color-primary)" : "1.5px solid var(--color-gray-400)",
                background: active ? "var(--color-primary)" : "transparent",
                color: active ? "#fff" : "var(--color-gray-700)",
                fontWeight: active ? 600 : 400,
              }}
            >
              {lang || "Все языки"}
            </button>
          );
        })}
      </div>
      <div className={styles.grid}>
        {visible.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", color: "var(--color-gray-500)", padding: 40 }}>
            {items.length === 0 ? "Portfolio is empty. Add items via Django Admin." : "No courses match the selected language."}
          </div>
        )}
        {visible.map((item) => (
          <div key={item.id} className={styles.card} onClick={() => setSelected(item)}>
            {item.banner && (
              <div className={styles.banner}>
                <img src={item.banner} alt={item.promo_name} />
              </div>
            )}
            {!item.banner && (
              <div className={styles.bannerPlaceholder}>
                <Globe size={32} color="var(--color-gray-300)" />
              </div>
            )}
            <div className={styles.body}>
              <h3 className={styles.promoName}>{item.promo_name}</h3>
              <div className={styles.internalName}>{item.internal_name}</div>
              <div className={styles.chips}>
                {item.duration && (
                  <span className={styles.chip}><Clock size={11} /> {item.duration}</span>
                )}
                <span className={styles.chip}><Globe size={11} /> {item.language}</span>
                {item.participants_count > 0 && (
                  <span className={styles.chip}><Users size={11} /> {item.participants_count}</span>
                )}
              </div>
              {item.skills && (
                <div className={styles.skills}>{item.skills}</div>
              )}
              <div className={styles.clickHint}>Click to view details →</div>
            </div>
          </div>
        ))}
      </div>
      </div>

      {selected && (
        <div className={styles.overlay} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelected(null)}>
              <X size={20} />
            </button>

            {selected.banner && (
              <div className={styles.modalBanner}>
                <img src={selected.banner} alt={selected.promo_name} />
              </div>
            )}

            <div className={styles.modalBody}>
              <h2 className={styles.modalTitle}>{selected.promo_name}</h2>
              <div className={styles.modalSub}>{selected.internal_name}</div>

              <div className={styles.modalMeta}>
                {selected.duration && (
                  <div className={styles.metaItem}>
                    <Clock size={14} />
                    <span>{selected.duration}</span>
                  </div>
                )}
                <div className={styles.metaItem}>
                  <Globe size={14} />
                  <span>{selected.language}</span>
                </div>
                {selected.participants_count > 0 && (
                  <div className={styles.metaItem}>
                    <Users size={14} />
                    <span>{selected.participants_count} participants enrolled</span>
                  </div>
                )}
              </div>

              {selected.description && (
                <div className={styles.section}>
                  <div className={styles.sectionLabel}>About the course</div>
                  <p className={styles.sectionText}>{selected.description}</p>
                </div>
              )}

              {selected.skills && (
                <div className={styles.section}>
                  <div className={styles.sectionLabel}>Skills developed</div>
                  <div className={styles.skillTags}>
                    {selected.skills.split(",").map((s) => (
                      <span key={s} className={styles.skillTag}>{s.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              {selected.enrollment_info && (
                <div className={styles.section}>
                  <div className={styles.sectionLabel}>How to enroll</div>
                  <p className={styles.sectionText}>{selected.enrollment_info}</p>
                </div>
              )}

              {selected.lms_url && (
                <a
                  href={selected.lms_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.lmsBtn}
                >
                  <ExternalLink size={14} />
                  Go to Course
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
