import { createContext, useContext, useState, type ReactNode } from "react";
import { translations, type Lang, type TranslationKey } from "./translations";

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LangContext = createContext<LangContextValue>({
  lang: "ru",
  setLang: () => {},
  t: (key) => translations.ru[key],
});

export function LangProvider({ children }: { children: ReactNode }) {
  const stored = (localStorage.getItem("lang") as Lang) || "ru";
  const [lang, setLangState] = useState<Lang>(stored);

  const setLang = (l: Lang) => {
    localStorage.setItem("lang", l);
    setLangState(l);
  };

  const t = (key: TranslationKey): string => translations[lang][key] ?? translations.en[key];

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
