import WebAuthGuard from "@/components/web/WebAuthGuard";
import WebPageShell from "@/components/web/WebPageShell";
import { AlertMethod, AlertMethods } from "@/constants/AlertMethods";
import { LanguageCode, LANGUAGES } from "@/constants/Languages";
import { useSettings } from "@/contexts/SettingsContext";
import {
  Button,
  Card,
  Flex,
  Heading,
  Switch,
  Text
} from "@radix-ui/themes";
import Slider from "@react-native-community/slider";
import React from "react";
import { useTranslation } from "react-i18next";
import { useWindowDimensions } from "react-native";

function Toggle({
  value,
  onChange,
  disabled,
}: {
  value: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <Switch
      checked={value}
      onCheckedChange={onChange}
      disabled={disabled}
    />
  );
}

export default function SettingsWeb() {
  const { i18n } = useTranslation();
  const { width } = useWindowDimensions();
  const desktop = width >= 1080;
  const {
    autoSyncEnabled,
    notificationEnabled,
    inAppAlertsEnabled,
    alertThreshold,
    setAutoSync,
    setNotification,
    setInAppAlerts,
    setDarkMode,
    setAlertThreshold,
    alertMethod,
    setAlertMethod,
    darkModeEnabled,
    language,
    setLanguage,
  } = useSettings();

  return (
    <WebAuthGuard>
    <WebPageShell>
      <Flex direction={desktop ? "row" : "column"} gap="4">
        {/* Settings Section */}
        <Card variant="surface" style={{ flex: 1 }}>
          <Heading size="6" mb="4">
            {i18n.t("settings_header_title")}
          </Heading>

          <Flex direction="column" gap="3">
            {/* Auto Sync Toggle */}
            <Flex justify="between" align="center">
              <Flex direction="column" gap="1" style={{ flex: 1 }}>
                <Text size="3" weight="bold">
                  {i18n.t("settings_toggle_auto_sync")}
                </Text>
                <Text size="2" color="gray">
                  {i18n.t("settings_desc_auto_sync")}
                </Text>
              </Flex>
              <Toggle value={autoSyncEnabled} onChange={setAutoSync} />
            </Flex>

            {/* Dark Mode Toggle */}
            <Flex justify="between" align="center">
              <Flex direction="column" gap="1" style={{ flex: 1 }}>
                <Text size="3" weight="bold">
                  {i18n.t("settings_toggle_dark_mode")}
                </Text>
                <Text size="2" color="gray">
                  {i18n.t("settings_desc_dark_mode")}
                </Text>
              </Flex>
              <Toggle value={darkModeEnabled} onChange={setDarkMode} />
            </Flex>

            {/* Language Selector */}
            <Flex direction="column" gap="2" mt="2">
              <Text weight="bold">
                {i18n.t("settings_label_language")}
              </Text>
              <Flex gap="2" wrap="wrap">
                {LANGUAGES.map((item) => (
                  <Button
                    key={item.code}
                    variant={language === item.code ? "solid" : "surface"}
                    color={language === item.code ? "indigo" : "gray"}
                    size="2"
                    onClick={() => setLanguage(item.code as LanguageCode)}
                    style={{ cursor: "pointer" }}
                  >
                    {item.nativeName}
                  </Button>
                ))}
              </Flex>
            </Flex>
          </Flex>
        </Card>

        {/* Notifications Section */}
        <Card variant="surface" style={{ flex: 1.2 }}>
          <Heading size="6" mb="4">
            {i18n.t("settings_toggle_notifications")}
          </Heading>

          <Flex direction="column" gap="3">
            {/* Notifications Toggle */}
            <Flex justify="between" align="center">
              <Flex direction="column" gap="1" style={{ flex: 1 }}>
                <Text size="3" weight="bold">
                  {i18n.t("settings_toggle_notifications")}
                </Text>
                <Text size="2" color="gray">
                  {i18n.t("settings_desc_notifications")}
                </Text>
              </Flex>
              <Toggle value={notificationEnabled} onChange={setNotification} />
            </Flex>

            {/* Battery Alerts Toggle */}
            <Flex justify="between" align="center">
              <Flex direction="column" gap="1" style={{ flex: 1 }}>
                <Text size="3" weight="bold">
                  {i18n.t("settings_toggle_battery_alerts")}
                </Text>
                <Text size="2" color="gray">
                  {i18n.t("settings_desc_battery_alerts")}
                </Text>
              </Flex>
              <Toggle value={inAppAlertsEnabled} onChange={setInAppAlerts} disabled={true} />
            </Flex>

            {/* Alert Threshold Slider */}
            <Flex direction="column" gap="2" mt="2">
              <Text weight="bold">
                {i18n.t("settings_label_alert_threshold")}
              </Text>
              <div style={{ width: "100%" }}>
                <Slider
                  minimumValue={10}
                  maximumValue={80}
                  step={1}
                  value={alertThreshold}
                  onValueChange={(next) => setAlertThreshold(next)}
                  minimumTrackTintColor="var(--indigo-9)"
                  thumbTintColor="var(--indigo-9)"
                />
              </div>
              <Text align="center" weight="bold">
                {alertThreshold}%
              </Text>
            </Flex>

            {/* Alert Method */}
            <Flex direction="column" gap="2">
              <Text weight="bold">
                {i18n.t("settings_label_alert_method")}
              </Text>
              <Flex gap="2" wrap="wrap">
                {AlertMethods.map((method) => (
                  <Button
                    key={method}
                    variant={alertMethod === method ? "solid" : "surface"}
                    color={alertMethod === method ? "indigo" : "gray"}
                    size="2"
                    disabled={method === "remote"}
                    onClick={() => setAlertMethod(method as AlertMethod)}
                    style={{ cursor: "pointer" }}
                  >
                    {method}
                  </Button>
                ))}
              </Flex>
            </Flex>
          </Flex>
        </Card>
      </Flex>
    </WebPageShell>
    </WebAuthGuard>
  );
}
