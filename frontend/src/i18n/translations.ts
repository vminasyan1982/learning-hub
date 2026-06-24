export type Lang = "en" | "ru";

export const translations = {
  en: {
    // Nav
    nav_dashboard: "Dashboard",
    nav_portfolio: "T&D Portfolio",
    nav_trainings: "Trainings",
    nav_registry_internal: "Internal Registry",
    nav_registry_external: "External Registry",
    nav_trainers: "Trainers",
    nav_participants: "Participants",
    nav_assessment: "Assessment",
    nav_compliance: "Compliance",
    nav_budget: "Budget",
    nav_skills: "Skills Matrix",
    nav_idp: "My IDP",
    nav_roi: "ROI",
    nav_users: "Users",
    // Common
    search: "Search…",
    export_excel: "Export Excel",
    loading: "Loading…",
    total: "Total",
    no_data: "No data",
    all: "All",
    // Dashboard
    projects_in_progress: "Projects in Progress",
    avg_nps: "Avg NPS",
    avg_csat: "Avg CSAT",
    participants_trained: "Participants Trained",
    business_value: "Business Value %",
    business_units: "Business Units",
    // Trainings
    title: "Title",
    date: "Date",
    format: "Format",
    classification: "Classification",
    trainer: "Trainer",
    participants: "Participants",
    // Trainers
    trainers: "Trainers",
    internal: "Internal",
    external: "External",
    // Portfolio
    all_languages: "All Languages",
    all_categories: "All Categories",
    search_by_name: "Search by name…",
  },
  ru: {
    // Nav
    nav_dashboard: "Дашборд",
    nav_portfolio: "T&D Портфолио",
    nav_trainings: "Тренинги",
    nav_registry_internal: "Внутренний реестр",
    nav_registry_external: "Внешний реестр",
    nav_trainers: "Тренеры",
    nav_participants: "Участники",
    nav_assessment: "Ассессмент",
    nav_compliance: "Комплаенс",
    nav_budget: "Бюджет",
    nav_skills: "Матрица навыков",
    nav_idp: "Мой ИПР",
    nav_roi: "ROI",
    nav_users: "Пользователи",
    // Common
    search: "Поиск…",
    export_excel: "Экспорт Excel",
    loading: "Загрузка…",
    total: "Всего",
    no_data: "Нет данных",
    all: "Все",
    // Dashboard
    projects_in_progress: "Проекты в работе",
    avg_nps: "Ср. NPS",
    avg_csat: "Ср. CSAT",
    participants_trained: "Участники",
    business_value: "Business Value %",
    business_units: "Бизнес-юниты",
    // Trainings
    title: "Название",
    date: "Дата",
    format: "Формат",
    classification: "Классификация",
    trainer: "Тренер",
    participants: "Участники",
    // Trainers
    trainers: "Тренеры",
    internal: "Внутренний",
    external: "Внешний",
    // Portfolio
    all_languages: "Все языки",
    all_categories: "Все категории",
    search_by_name: "Поиск по названию…",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
