import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import de from "./de.json";
import en from "./en.json";
import es from "./es.json";
import fr from "./fr.json";
import it from "./it.json";
import ja from "./ja.json";
import ko from "./ko.json";
import pt from "./pt.json";
import ru from "./ru.json";
import zh from "./zh.json";

// Initialize i18next synchronously at module load time (before any components use useTranslation)
const resources = {
  de: { translation: de },
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  it: { translation: it },
  ja: { translation: ja },
  ko: { translation: ko },
  pt: { translation: pt },
  ru: { translation: ru },
  zh: { translation: zh },
};

// Initialize i18next - called by SettingsProvider
const InitI18n = async (lng: string) => {
  if (i18next.isInitialized) {
    if (lng && i18next.language !== lng) {
      await i18next.changeLanguage(lng);
    }
    return;
  }

  await i18next.use(initReactI18next).init({
    resources,
    lng: lng || "en",
    fallbackLng: "en",
    defaultNS: "translation",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    react: {
      useSuspense: false, // prevent suspense warnings
    },
  });
};

export { i18next, InitI18n };

