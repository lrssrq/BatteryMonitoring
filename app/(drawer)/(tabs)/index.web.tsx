import WebPageShell from "@/components/web/WebPageShell";
import { useBatteryDataPipeline } from "@/contexts/BatteryDataPipelineContext";
import { useDevice } from "@/contexts/DeviceContext";
import { useSession } from "@/contexts/SessionContext";
import {
  Box,
  Button,
  Card,
  Container,
  Flex,
  Grid,
  Heading,
  Popover,
  ScrollArea,
  Section,
  Text
} from "@radix-ui/themes";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useWindowDimensions } from "react-native";
import Toast from "react-native-toast-message";

export default function IndexWeb() {
  const { i18n } = useTranslation();
  const { data: session, isPending } = useSession();
  const { mqttStatus, lastSyncTime, remainingPower } = useBatteryDataPipeline();
  const { devices, selectedDevice, setSelectedDevice } = useDevice();
  const { width, height } = useWindowDimensions();
  const desktop = width >= 1180;
  const splitCardsDesktop = width >= 1380;
  const [isDeviceDialogVisible, setIsDeviceDialogVisible] = useState(false);
  const deviceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    setIsTouch(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const enterDevice = useCallback(() => {
    if (isTouch) return;
    clearTimeout(deviceTimer.current);
    setIsDeviceDialogVisible(true);
  }, [isTouch]);
  const leaveDevice = useCallback(() => {
    if (isTouch) return;
    deviceTimer.current = setTimeout(() => setIsDeviceDialogVisible(false), 200);
  }, [isTouch]);

  const handleQuickAccess = (
    path: "/analysis" | "/dataHistory" | "/deviceManagement",
  ) => {
    if (path !== "/deviceManagement") {
      router.navigate(path);
      return;
    }

    if (isPending) return;

    if (!session?.user) {
      Toast.show({
        type: "info",
        text1: i18n.t("me_dialog_must_login"),
      });
      setTimeout(() => router.replace("/"), 400);
      return;
    }

    router.navigate(path);
  };

  const metricCards = [
    {
      title: i18n.t("home_info_mqtt_server"),
      value: translateMqttStatus(i18n, mqttStatus),
    },
    {
      title: i18n.t("home_info_battery_remaining"),
      value:
        remainingPower === null || remainingPower < 0
          ? i18n.t("home_info_unavailable")
          : `${remainingPower}%`,
    },
    {
      title: i18n.t("home_info_last_synced"),
      value: lastSyncTime || i18n.t("home_info_unavailable"),
    },
  ];

  return (
    <WebPageShell>
      <Container size="4">
        <Section size={desktop ? "3" : "2"} pb="0">
          <Heading as="h1" size="8" align="left" mb="2" weight="bold" style={{ letterSpacing: "-0.03em" }}>
            {i18n.t("home_device_overview")}
          </Heading>
          <Text size="3" color="gray">
            {i18n.t("home_device_overview_description")}
          </Text>
        </Section>

        <Section size={desktop ? "3" : "2"}>
          <Grid columns={{ initial: "1", md: "3" }} gap="4" width="auto">
            {metricCards.map((item) => (
              <Card key={item.title} size="3" variant="surface">
                <Flex direction="column" justify="between" height="100%">
                  <Text size="2" color="gray" weight="medium" mb="4">
                    {item.title}
                  </Text>
                  <Heading as="h3" size="7" mb="1">
                    {item.value}
                  </Heading>
                </Flex>
              </Card>
            ))}
          </Grid>
        </Section>

        <Section size="1" pt="0">
          <Grid columns={{ initial: "1", lg: splitCardsDesktop ? "3" : "1" }} gap="4" style={{ gridTemplateColumns: splitCardsDesktop ? "2fr 1fr" : "1fr" }}>
            <Card size="4" variant="surface">
              {devices.length === 0 ? (
                <Flex direction="column" justify="center" align="center" py="8" px="4">
                  <Heading size="4" color="gray" align="center" mb="1">{i18n.t("common_list_no_devices")}</Heading>
                  <Text color="gray" align="center" mb="4" size="2">
                    {i18n.t("home_device_overview_no_devices")}
                  </Text>
                  {session?.user &&
                  <Button size="3" variant="solid" onClick={() => handleQuickAccess("/deviceManagement")}>
                    {i18n.t("home_button_select_device")}
                  </Button>}
                </Flex>
              ) : (
                <Flex direction="column" gap="4">
                  <Flex direction="column" gap="3">
                    <Flex justify="between" align="center" gap="4" wrap="wrap">
                      <Heading size="6" weight="bold">{i18n.t("home_info_current_device_name")}</Heading>
                      <Text size="3">{selectedDevice?.deviceName || i18n.t("home_info_no_device_selected")}</Text>
                    </Flex>
                    <Flex justify="between" align="center" gap="4" wrap="wrap">
                      <Heading size="6" weight="bold">{i18n.t("home_info_current_device_sn")}</Heading>
                      <Text size="2" color="gray" style={{ fontFamily: "monospace" }}>{selectedDevice?.deviceSN || i18n.t("home_info_no_device_selected")}</Text>
                    </Flex>
                  </Flex>
                  
                  <Flex mt="4">
                    <Popover.Root open={isDeviceDialogVisible} onOpenChange={setIsDeviceDialogVisible}>
                      <Popover.Trigger>
                        <Button
                          size="3"
                          variant="solid"
                          onPointerEnter={enterDevice}
                          onPointerLeave={leaveDevice}
                          style={{ cursor: "pointer" }}
                        >
                          {i18n.t("home_button_select_device")}
                        </Button>
                      </Popover.Trigger>
                      <Popover.Content
                        sideOffset={8}
                        align="start"
                        onPointerEnter={enterDevice}
                        onPointerLeave={leaveDevice}
                        style={{
                          width: 360,
                          padding: 0,
                          overflow: "hidden",
                          borderRadius: "var(--radius-3)",
                        }}
                      >
                        {/* Header with gradient */}
                        <Box
                          style={{
                            background: "linear-gradient(135deg, var(--indigo-9), var(--violet-9), var(--cyan-9))",
                            padding: "16px 20px 14px",
                          }}
                        >
                          <Text size="3" weight="bold" style={{ color: "white" }}>
                            {i18n.t("home_button_select_device")}
                          </Text>
                          <Text size="1" style={{ color: "rgba(255,255,255,0.75)", display: "block", marginTop: 2 }}>
                            {devices.length > 0
                              ? `${i18n.t("device_total_devices")}: ${devices.length}`
                              : i18n.t("common_list_no_devices")}
                          </Text>
                        </Box>

                        {/* Device list */}
                        <Box style={{ padding: "12px 16px 16px" }}>
                          {devices.length === 0 ? (
                            <Flex direction="column" align="center" py="4" gap="2">
                              <Text color="gray" size="2">{i18n.t("common_list_no_devices")}</Text>
                            </Flex>
                          ) : (
                            <ScrollArea
                              type="auto"
                              scrollbars="vertical"
                              style={{ maxHeight: 280 }}
                            >
                              <Flex direction="column" gap="2" pr="2">
                                {devices.map((device) => {
                                  const selected = selectedDevice?.deviceSN === device.deviceSN;
                                  return (
                                    <Box
                                      key={device.deviceSN}
                                      onClick={() => {
                                        setSelectedDevice(device);
                                        setIsDeviceDialogVisible(false);
                                      }}
                                      style={{
                                        padding: "10px 14px",
                                        borderRadius: "var(--radius-3)",
                                        border: selected
                                          ? "2px solid var(--indigo-9)"
                                          : "1px solid var(--gray-a4)",
                                        backgroundColor: selected
                                          ? "var(--indigo-a2)"
                                          : "var(--gray-a2)",
                                        cursor: "pointer",
                                        transition: "all 0.15s ease",
                                      }}
                                    >
                                      <Flex justify="between" align="center" gap="3">
                                        <Flex direction="column" gap="1" style={{ minWidth: 0 }}>
                                          <Text size="2" weight="bold" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {device.deviceName || i18n.t("home_modal_unnamed_device")}
                                          </Text>
                                          <Text size="1" color="gray" style={{ fontFamily: "monospace" }}>
                                            {device.deviceSN}
                                          </Text>
                                        </Flex>
                                        <Box
                                          style={{
                                            width: 18,
                                            height: 18,
                                            borderRadius: "50%",
                                            border: selected ? "none" : "2px solid var(--gray-a6)",
                                            background: selected
                                              ? "linear-gradient(135deg, var(--indigo-9), var(--cyan-9))"
                                              : "transparent",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                          }}
                                        >
                                          {selected && (
                                            <svg width="10" height="10" viewBox="0 0 15 15" fill="none">
                                              <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3354 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.5553 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="white" fillRule="evenodd" clipRule="evenodd" />
                                            </svg>
                                          )}
                                        </Box>
                                      </Flex>
                                    </Box>
                                  );
                                })}
                              </Flex>
                            </ScrollArea>
                          )}
                        </Box>
                      </Popover.Content>
                    </Popover.Root>
                  </Flex>
                </Flex>
              )}
            </Card>

            {session?.user && (
            <Card size="3" variant="surface">
              <Flex direction="column" gap="3" height="100%">
                <Heading size="4" mb="2">{i18n.t("home_quick_access")}</Heading>
                <Button size="3" variant="soft" onClick={() => handleQuickAccess("/analysis")} style={{ justifyContent: "flex-start", cursor: "pointer" }}> 
                  {i18n.t("analysis_header_title")}
                </Button>
                <Button size="3" variant="soft" onClick={() => handleQuickAccess("/dataHistory")} style={{ justifyContent: "flex-start", cursor: "pointer" }}> 
                  {i18n.t("history_header_title")}
                </Button>
                <Button size="3" variant="soft" onClick={() => handleQuickAccess("/deviceManagement")} style={{ justifyContent: "flex-start", cursor: "pointer" }}> 
                  {i18n.t("device_management_title")}
                </Button>
              </Flex>
            </Card>
            )}
          </Grid>
        </Section>
      </Container>
    </WebPageShell>
  );
}

const translateMqttStatus = (i18n: any, status: string) => {
  switch (status) {
    case "Connected":
      return i18n.t("usemqtt_status_connected") + "🟢";
    case "Disconnected":
      return i18n.t("usemqtt_status_disconnected") + "🔴";
    case "Offline":
      return i18n.t("usemqtt_status_offline") + "🟡";
    case "Reconnecting":
      return i18n.t("usemqtt_status_reconnecting") + "🔄";
    case "Error":
      return i18n.t("usemqtt_status_error") + "❌";
    default:
      return status;
  }
};
