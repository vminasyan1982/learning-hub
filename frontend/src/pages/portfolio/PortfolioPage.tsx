import { useEffect, useState } from "react";
import { getPortfolio } from "@/api";
import type { PortfolioItem } from "@/types";
import styles from "./PortfolioPage.module.css";
import { X, Users, Clock, Globe, ExternalLink } from "lucide-react";
import { useLang } from "@/i18n/LangContext";

const LANGUAGES = ["Русский", "English"];

const CLASSIFICATION_LABELS: Record<string, string> = {
  online_self: "Онлайн самостоятельный",
  online_deadline: "Онлайн с дедлайном",
  online_mixed: "Онлайн смешанный",
  offline_mixed: "Офлайн смешанный",
  online_trainer: "Онлайн тренинг",
  offline_trainer: "Офлайн тренинг",
  online_workshop: "Онлайн воркшоп",
  offline_workshop: "Офлайн воркшоп",
  online_game: "Онлайн бизнес-игра",
  offline_game: "Офлайн бизнес-игра",
  online_strategy: "Онлайн стратсессия",
  offline_strategy: "Офлайн стратсессия",
  online_coaching: "Онлайн коучинг",
  offline_coaching: "Офлайн коучинг",
  online_masterclass: "Онлайн мастер-класс",
  offline_masterclass: "Офлайн мастер-класс",
  online_conference: "Онлайн конференция",
  offline_conference: "Офлайн конференция",
  online_teambuilding: "Онлайн тимбилдинг",
  offline_teambuilding: "Офлайн тимбилдинг",
};

const LANG_KEYWORDS: Record<string, string[]> = {
  "Русский": ["рус", "russian", "ru"],
  "English":  ["eng", "англ", "english", "en"],
};

export default function PortfolioPage() {
  const { t } = useLang();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PortfolioItem | null>(null);
  const [langFilter, setLangFilter] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    getPortfolio({ search: search || undefined })
      .then((r) => setItems(r.data.results))
      .finally(() => setLoading(false));
  }, [search]);

  const categories = [...new Set(items.map((i) => i.category).filter(Boolean))];

  const visible = items.filter((i) => {
    if (langFilter) {
      const lang = i.language.toLowerCase();
      const keywords = LANG_KEYWORDS[langFilter] ?? [langFilter.toLowerCase()];
      if (!keywords.some((kw) => lang.includes(kw))) return false;
    }
    if (categoryFilter && i.category !== categoryFilter) return false;
    return true;
  });

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--color-gray-500)" }}>{t("loading")}</div>;

  return (
    <>
      <div className={styles.page}>
        <div className={styles.filters}>
          {/* Search input */}
          <input
            placeholder={t("search_by_name")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 13,
              border: "1.5px solid var(--color-gray-300)", fontFamily: "inherit",
              outline: "none", minWidth: 200,
              background: "var(--color-white)", color: "var(--color-gray-700)",
            }}
          />

          {/* Category dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 13,
              border: "1.5px solid var(--color-gray-300)", fontFamily: "inherit",
              outline: "none", background: "var(--color-white)", color: "var(--color-gray-700)",
              cursor: "pointer",
            }}
          >
            <option value="">{t("all_categories")}</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Language filter buttons */}
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
                {lang || t("all_languages")}
              </button>
            );
          })}
        </div>

        <div className={styles.grid}>
          {visible.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", color: "var(--color-gray-500)", padding: 40 }}>
              {items.length === 0 ? "Portfolio is empty. Add items via Django Admin." : t("no_data")}
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
                  {item.classification && (
                    <span className={styles.chip}>{CLASSIFICATION_LABELS[item.classification] || item.classification}</span>
                  )}
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
                {selected.classification && (
                  <div className={styles.metaItem}>
                    <span>{CLASSIFICATION_LABELS[selected.classification] || selected.classification}</span>
                  </div>
                )}
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
