import { AlertMethod } from "@/constants/AlertMethods";
import { SETTINGS_STORAGE_KEY } from "@/constants/AsyncStorageKeys";
import {
  allSupportedLanguageCodes,
  DEFAULT_LANGUAGE,
  LanguageCode,
} from "@/constants/Languages";
import { i18next, InitI18n } from "@/locales/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";

interface SettingsState {
  autoSyncEnabled: boolean;
  notificationEnabled: boolean;
  inAppAlertsEnabled: boolean;
  alertThreshold: number;
  alertMethod: AlertMethod;
  darkModeEnabled: boolean;
  language: LanguageCode;
  isLoaded: boolean;
}

interface SettingsContextType extends SettingsState {
  setAutoSync: (value: boolean) => void;
  setNotification: (value: boolean) => void;
  setInAppAlerts: (value: boolean) => void;
  setDarkMode: (value: boolean) => void;
  setAlertThreshold: (threshold: number) => void;
  setAlertMethod: (method: AlertMethod) => void;
  setLanguage: (language: LanguageCode) => void;
}

type SettingsAction =
  | { type: "LOAD_SETTINGS"; payload: Partial<SettingsState> }
  | { type: "SET_AUTO_SYNC"; payload: boolean }
  | { type: "SET_NOTIFICATION"; payload: boolean }
  | { type: "SET_IN_APP_ALERTS"; payload: boolean }
  | { type: "SET_ALERT_THRESHOLD"; payload: number }
  | { type: "SET_ALERT_METHOD"; payload: AlertMethod }
  | { type: "SET_DARK_MODE"; payload: boolean }
  | { type: "SET_LANGUAGE"; payload: LanguageCode };

const initialState: SettingsState = {
  autoSyncEnabled: false,
  notificationEnabled: false,
  inAppAlertsEnabled: false,
  alertThreshold: 20,
  alertMethod: "local",
  darkModeEnabled: false,
  language: DEFAULT_LANGUAGE,
  isLoaded: false,
};

function settingsReducer(
  state: SettingsState,
  action: SettingsAction,
): SettingsState {
  switch (action.type) {
    case "LOAD_SETTINGS":
      return { ...state, ...action.payload, isLoaded: true };
    case "SET_AUTO_SYNC":
      return { ...state, autoSyncEnabled: action.payload };
    case "SET_NOTIFICATION":
      return { ...state, notificationEnabled: action.payload };
    case "SET_IN_APP_ALERTS":
      return { ...state, inAppAlertsEnabled: action.payload };
    case "SET_ALERT_THRESHOLD":
      return { ...state, alertThreshold: action.payload };
    case "SET_ALERT_METHOD":
      return { ...state, alertMethod: action.payload };
    case "SET_DARK_MODE":
      return { ...state, darkModeEnabled: action.payload };
    case "SET_LANGUAGE":
      return { ...state, language: action.payload };
    default:
      return state;
  }
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(settingsReducer, initialState);
  const [i18nReady, setI18nReady] = useState(false);

  // Load settings from storage and initialize i18n BEFORE rendering children
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        let loadedSettings: Partial<SettingsState> = {};

        if (saved) {
          try {
            loadedSettings = JSON.parse(saved);
          } catch (e) {
            console.error("Settings JSON parse error:", e);
          }
        }

        const language = allSupportedLanguageCodes.includes(
          loadedSettings.language as LanguageCode,
        )
          ? (loadedSettings.language as LanguageCode)
          : DEFAULT_LANGUAGE;

        // Initialize i18n with the correct language BEFORE dispatching settings
        await InitI18n(language);

        dispatch({
          type: "LOAD_SETTINGS",
          payload: { ...loadedSettings, language },
        });

        setI18nReady(true);
      } catch (error) {
        console.error("load settings error:", error);
        // Initialize with default language on error
        await InitI18n(DEFAULT_LANGUAGE);
        dispatch({ type: "LOAD_SETTINGS", payload: {} });
        setI18nReady(true);
      }
    };
    loadSettings();
  }, []);

  // Sync language changes to i18next after initial setup
  useEffect(() => {
    if (!i18nReady || !state.language) return;
    if (i18next.language !== state.language) {
      InitI18n(state.language).catch((err) =>
        console.error("Language change failed:", err),
      );
    }
  }, [state.language, i18nReady]);

  // Debounce auto save, start listening only after loading is complete
  useEffect(() => {
    if (!state.isLoaded) return;

    const saveTimeout = setTimeout(async () => {
      try {
        const { isLoaded, ...settingsToSave } = state;
        await AsyncStorage.setItem(
          SETTINGS_STORAGE_KEY,
          JSON.stringify(settingsToSave),
        );
      } catch (error) {
        console.error("Failed to save settings:", error);
      }
    }, 500);

    return () => clearTimeout(saveTimeout);
  }, [state]);

  const contextValue = useMemo<SettingsContextType>(
    () => ({
      ...state,
      setAutoSync: (value: boolean) =>
        dispatch({ type: "SET_AUTO_SYNC", payload: value }),
      setNotification: (value: boolean) =>
        dispatch({ type: "SET_NOTIFICATION", payload: value }),
      setInAppAlerts: (value: boolean) =>
        dispatch({ type: "SET_IN_APP_ALERTS", payload: value }),
      setAlertThreshold: (value: number) =>
        dispatch({ type: "SET_ALERT_THRESHOLD", payload: value }),
      setAlertMethod: (value: AlertMethod) =>
        dispatch({ type: "SET_ALERT_METHOD", payload: value }),
      setDarkMode: (value: boolean) =>
        dispatch({ type: "SET_DARK_MODE", payload: value }),
      setLanguage: (value: LanguageCode) =>
        dispatch({ type: "SET_LANGUAGE", payload: value }),
    }),
    [state],
  );

  return (
    <SettingsContext.Provider value={contextValue}>
      {i18nReady && children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
