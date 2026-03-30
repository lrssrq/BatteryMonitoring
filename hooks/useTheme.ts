import Colors from "@/constants/Colors";
import { useSettings } from "@/contexts/SettingsContext";
import { useMemo } from "react";

export const useTheme = () => {
  const { darkModeEnabled } = useSettings();

  const theme = useMemo(() => {
    return darkModeEnabled ? "dark" : "light";
  }, [darkModeEnabled]);

  const colors = useMemo(() => {
    return Colors[theme];
  }, [theme]);

  return { theme, colors };
};
