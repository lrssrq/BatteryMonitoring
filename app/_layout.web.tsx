import toastConfig from "@/components/ToastConfig";
import { Slot } from "expo-router";
import Head from "expo-router/head";
// import { KeyboardProvider } from "react-native-keyboard-controller";
import { AlertProvider } from "@/contexts/AlertContext";
import { BatteryDataPipelineProvider } from "@/contexts/BatteryDataPipelineContext";
import { DeviceProvider } from "@/contexts/DeviceContext";
import { ModelProvider } from "@/contexts/ModelContext";
import { MqttProvider } from "@/contexts/MqttContext";
import { SessionProvider } from "@/contexts/SessionContext";
import { SettingsProvider, useSettings } from "@/contexts/SettingsContext";
import useWebSingleTab from "@/hooks/useWebSingleTab";
import { Flex, Heading, Text, Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from "expo-router";

export default function RootLayout() {

  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <RootLayoutNav />
      </SettingsProvider>
      <Toast config={toastConfig} />
    </SafeAreaProvider>
  );
}

function RootLayoutNav() {
  const { isLoaded, darkModeEnabled } = useSettings();
  const isActiveTab = useWebSingleTab();
  if (isActiveTab === null || !isLoaded) return null;

  if (!isActiveTab) {
    return (
      <>
        <Head>
          <title>Battery Monitoring</title>
          <meta name="description" content="Battery Monitoring Web App" />
        </Head>
        <Theme appearance={darkModeEnabled ? "dark" : "light"}>
          <Flex
            direction="column"
            align="center"
            justify="center"
            gap="3"
            style={{ minHeight: "100vh", padding: "2rem" }}
          >
            <Heading size="5">
              Battery Monitoring is already open in another tab
            </Heading>
            <Text color="gray" size="2" align="center">
              Please close this tab, or close the other tab and refresh this page.
            </Text>
          </Flex>
        </Theme>
      </>
    );
  }

  return (
    <SessionProvider>
      <DeviceProvider>
        <ModelProvider>
          <MqttProvider>
            <BatteryDataPipelineProvider>
              <AlertProvider>
                <>
                  <Head>
                    <title>Battery Monitoring</title>
                    <meta name="description" content="Battery Monitoring Web App" />
                  </Head>
                  <Slot />
                </>
              </AlertProvider>
            </BatteryDataPipelineProvider>
          </MqttProvider>
        </ModelProvider>
      </DeviceProvider>
    </SessionProvider>
  );
}