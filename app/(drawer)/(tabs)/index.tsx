import PercentageCircle from "@/components/PercentageCircle";
import Colors from "@/constants/Colors";
import { useBatteryDataPipeline } from "@/contexts/BatteryDataPipelineContext";
import { useDevice } from "@/contexts/DeviceContext";
import { useTheme } from "@/hooks/useTheme";
import { DrawerActions } from "@react-navigation/native";
import { router, useNavigation } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, StyleSheet, View } from "react-native";
import { Button, Card, Chip, IconButton, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function Index() {
  const { i18n } = useTranslation();
  const { colors } = useTheme();
  const { mqttStatus, lastSyncTime, remainingPower } = useBatteryDataPipeline();
  const { devices, selectedDevice, setSelectedDevice } = useDevice();
  const [isDeviceDialogVisible, setIsDeviceDialogVisible] = useState(false);
  const navigation = useNavigation();
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View style={styles.header}>
        <IconButton
          icon="menu"
          size={24}
          iconColor={colors.icon}
          animated={true}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        />
        <Text style={[styles.serverText, { color: colors.text }]}>
          {i18n.t("home_info_mqtt_server")}{" "}
          {translateMqttStatus(i18n, mqttStatus)}
        </Text>
        <IconButton
          icon="bell"
          size={24}
          iconColor={colors.icon}
          onPress={() => {
            router.navigate("/alert");
          }}
        />
      </View>
      <View style={styles.content}>
        <Card
          style={[styles.card, { backgroundColor: colors.whiteBackground }]}
        >
          <Card.Content style={styles.cardContent}>
            <Text
              style={{ fontSize: 16, marginBottom: 10, color: colors.text }}
            >
              {i18n.t("home_info_last_synced")}
              {lastSyncTime ? lastSyncTime : i18n.t("home_info_unavailable")}
            </Text>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                marginBottom: 10,
                color: colors.text,
              }}
            >
              {i18n.t("home_info_battery_remaining")}
            </Text>
            <PercentageCircle
              radius={60}
              borderWidth={5}
              percent={remainingPower || 0}
            />
            <Text style={{ fontSize: 12, marginTop: 10, color: colors.text }}>
              {i18n.t("home_info_current_device_name")}{" "}
              {selectedDevice?.deviceName ||
                i18n.t("home_info_no_device_selected")}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              {i18n.t("home_info_current_device_sn")}{" "}
              {selectedDevice?.deviceSN ||
                i18n.t("home_info_no_device_selected")}
            </Text>
          </Card.Content>
        </Card>
        {devices.length === 0 || devices.length === 1 ? null : (
          <Button
            mode="contained"
            style={styles.switchDeviceButton}
            onPress={() => setIsDeviceDialogVisible(true)}
            disabled={devices.length === 0}
          >
            {i18n.t("home_button_select_device")}
          </Button>
        )}
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isDeviceDialogVisible}
        onRequestClose={() => setIsDeviceDialogVisible(false)}
      >
        <View
          style={[
            styles.centeredView,
            { backgroundColor: colors.overlayBackground },
          ]}
        >
          <View
            style={[
              styles.modalView,
              { backgroundColor: colors.whiteBackground },
            ]}
          >
            <IconButton
              icon="close"
              mode="outlined"
              size={20}
              iconColor={colors.icon}
              onPress={() => setIsDeviceDialogVisible(false)}
              style={styles.modalCloseButton}
            />
            {devices.length === 0 ? (
              <Text style={{ color: colors.text }}>
                {i18n.t("common_list_no_devices")}
              </Text>
            ) : (
              devices.map((device) => (
                <Chip
                  key={device.deviceSN}
                  mode={
                    selectedDevice?.deviceSN === device.deviceSN
                      ? "flat"
                      : "outlined"
                  }
                  style={styles.deviceOptionChip}
                  onPress={() => {
                    setSelectedDevice(device);
                    setIsDeviceDialogVisible(false);
                  }}
                  onLongPress={() =>
                    Toast.show({
                      type: "info",
                      text1: `Device SN: ${device.deviceSN}`,
                      text2: `Bound At: ${device.boundAt.toLocaleString()}`,
                    })
                  }
                >
                  {device.deviceName || i18n.t("home_modal_unnamed_device")} (
                  {device.deviceSN})
                </Chip>
              ))
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: 50,
    paddingHorizontal: 8,
  },
  serverText: {
    fontSize: 16,
    flex: 1,
    textAlign: "center",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 100,
  },
  cardContent: {
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    width: 400,
    height: 200,
  },
  card: {
    width: "90%",
    height: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  switchDeviceButton: {
    marginTop: 14,
  },
  deviceOptionButton: {
    marginBottom: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  modalView: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 20,
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 14,
    alignItems: "stretch",
    elevation: 5,
  },
  modalCloseButton: {
    position: "absolute",
    top: 4,
    right: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  deviceOptionChip: {
    marginTop: 15,
    marginHorizontal: 8,
  },
  modalActions: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});

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
