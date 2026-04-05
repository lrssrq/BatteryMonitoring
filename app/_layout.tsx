import toastConfig from "@/components/ToastConfig";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
// import { KeyboardProvider } from "react-native-keyboard-controller";
import { AlertProvider } from "@/contexts/AlertContext";
import { BatteryDataPipelineProvider } from "@/contexts/BatteryDataPipelineContext";
import { DeviceProvider } from "@/contexts/DeviceContext";
import { ModelProvider } from "@/contexts/ModelContext";
import { MqttProvider } from "@/contexts/MqttContext";
import { SessionProvider } from "@/contexts/SessionContext";
import { SettingsProvider, useSettings } from "@/contexts/SettingsContext";
import { setStatusBarStyle } from "expo-status-bar";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from "expo-router";
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 2000,
  fade: true,
});
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <SessionProvider>
          <DeviceProvider>
            <ModelProvider>
              <MqttProvider>
                <BatteryDataPipelineProvider>
                  <AlertProvider>
                    <ThemedPaperProvider>
                      {/* <KeyboardProvider> */}
                      {/* <ThemeProvider
                        value={
                          colorScheme === "dark" ? DarkTheme : DefaultTheme
                        }
                      > */}
                      <GestureHandlerRootView>
                        <RootLayoutNav />
                      </GestureHandlerRootView>
                      {/* </ThemeProvider> */}
                      {/* </KeyboardProvider> */}
                    </ThemedPaperProvider>
                  </AlertProvider>
                </BatteryDataPipelineProvider>
              </MqttProvider>
            </ModelProvider>
          </DeviceProvider>
        </SessionProvider>
      </SettingsProvider>
      <Toast config={toastConfig} />
    </SafeAreaProvider>
  );
}

function ThemedPaperProvider({ children }: { children: React.ReactNode }) {
  const { darkModeEnabled } = useSettings();
  return (
    <PaperProvider theme={darkModeEnabled ? MD3DarkTheme : MD3LightTheme}>
      {children}
    </PaperProvider>
  );
}

function RootLayoutNav() {
  const { isLoaded, darkModeEnabled } = useSettings();

  useEffect(() => {
    if (isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoaded]);

  setStatusBarStyle(darkModeEnabled ? "light" : "dark");

  if (!isLoaded) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      <Stack.Screen name="(otherscreens)" options={{ headerShown: false }} />
    </Stack>
  );
}
