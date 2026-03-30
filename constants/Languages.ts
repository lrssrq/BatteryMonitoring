import { i18next } from "@/locales/i18n";
import { getLocales } from "expo-localization";

console.log("System locale:", getLocales()[0]);

export const allSupportedLanguageCodes = [
  "de",
  "en",
  "es",
  "fr",
  "it",
  "ja",
  "ko",
  "pt",
  "ru",
  "zh",
] as const;

export type LanguageCode = (typeof allSupportedLanguageCodes)[number];

const deviceLanguage = getLocales()[0].languageCode;
const validDeviceLanguage = allSupportedLanguageCodes.includes(
  deviceLanguage as LanguageCode,
)
  ? (deviceLanguage as LanguageCode)
  : "en";

// Language codes and display names mapping
export interface LanguageInfo {
  code: LanguageCode;
  i18nkey: string;
  nativeName: string;
}

export const LANGUAGES: LanguageInfo[] = [
  { code: "zh", i18nkey: "language_name_zh", nativeName: "中文" },
  { code: "en", i18nkey: "language_name_en", nativeName: "English" },
  { code: "fr", i18nkey: "language_name_fr", nativeName: "Français" },
  { code: "ja", i18nkey: "language_name_ja", nativeName: "日本語" },
  { code: "de", i18nkey: "language_name_de", nativeName: "Deutsch" },
  { code: "es", i18nkey: "language_name_es", nativeName: "Español" },
  { code: "it", i18nkey: "language_name_it", nativeName: "Italiano" },
  { code: "ko", i18nkey: "language_name_ko", nativeName: "한국어" },
  { code: "pt", i18nkey: "language_name_pt", nativeName: "Português" },
  { code: "ru", i18nkey: "language_name_ru", nativeName: "Русский" },
];

// Helper function to get language display name by code
export const getLanguageName = (code: LanguageCode): string => {
  const language = LANGUAGES.find((lang) => lang.code === code);
  return language ? i18next.t(language.i18nkey) : i18next.t("language_name_en");
};

// Helper function to get native language name by code
export const getLanguageNativeName = (code: LanguageCode): string => {
  const language = LANGUAGES.find((lang) => lang.code === code);
  return language ? language.nativeName : "English";
};

// Default language
export const DEFAULT_LANGUAGE: LanguageCode = validDeviceLanguage;
