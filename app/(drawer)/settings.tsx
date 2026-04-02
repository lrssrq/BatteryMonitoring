import { AlertMethod, AlertMethods } from "@/constants/AlertMethods";
import Colors from "@/constants/Colors";
import {
  getLanguageName,
  LanguageCode,
  LANGUAGES,
} from "@/constants/Languages";
import { useSettings } from "@/contexts/SettingsContext";
import { useTheme } from "@/hooks/useTheme";
import Slider from "@react-native-community/slider";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, ScrollView, StyleSheet, View } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import {
  Button,
  Divider,
  Icon,
  IconButton,
  RadioButton,
  Switch,
  Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
export default function SettingsScreen() {
  const { i18n } = useTranslation();
  const { colors } = useTheme();
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

  const [contentPresentedOnModal, setContentPresentedOnModal] = useState<
    "language" | "alertMethod"
  >("language");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [selectedAlertMethod, setSelectedAlertMethod] =
    useState<AlertMethod>(alertMethod);

  const [sliderVisible, setSliderVisible] = useState(false);
  const [tempThreshold, setTempThreshold] = useState(alertThreshold);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setSliderVisible(false);
      };
    }, []),
  );
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor={colors.icon}
          animated={true}
          onPress={() => {
            router.canGoBack() ? router.back() : router.dismissTo("/");
            setSliderVisible(false);
          }}
        />
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {i18n.t("settings_header_title")}
        </Text>
        <View style={{ width: 48 }} />
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {i18n.t("settings_toggle_auto_sync")}
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: colors.textSecondary },
                ]}
              >
                {i18n.t("settings_desc_auto_sync")}
              </Text>
            </View>
            <Switch
              value={autoSyncEnabled}
              onValueChange={setAutoSync}
              color={colors.icon}
            />
          </View>
          <View style={styles.sectionHeader}>
            <Icon source="bell" size={24} color={colors.icon} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {i18n.t("settings_header_notifications")}
            </Text>
          </View>
          <Divider style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {i18n.t("settings_toggle_notifications")}
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: colors.textSecondary },
                ]}
              >
                {i18n.t("settings_desc_notifications")}
              </Text>
            </View>
            <Switch
              value={notificationEnabled}
              onValueChange={setNotification}
              color={colors.icon}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {i18n.t("settings_toggle_battery_alerts")}
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: colors.textSecondary },
                ]}
              >
                {i18n.t("settings_desc_battery_alerts")}
              </Text>
            </View>
            <Switch
              value={inAppAlertsEnabled}
              onValueChange={setInAppAlerts}
              disabled={true}
              color={colors.icon}
            />
          </View>

          <RectButton
            style={styles.settingButton}
            onPress={() => {
              setSliderVisible(!sliderVisible);
            }}
          >
            <Text style={[styles.settingButtonText, { color: colors.text }]}>
              {i18n.t("settings_label_alert_threshold")}
            </Text>
            <View style={styles.settingValue}>
              <Text
                style={[
                  styles.settingValueText,
                  { color: colors.textSecondary },
                ]}
              >
                {tempThreshold}%
              </Text>
              <Icon source="chevron-down" size={24} color={colors.iconLight} />
            </View>
          </RectButton>
          <View
            style={
              sliderVisible
                ? styles.sliderContainer
                : styles.sliderContainerHidden
            }
          >
            <Slider
              minimumValue={10}
              maximumValue={80}
              step={1}
              value={tempThreshold}
              onValueChange={(val) => setTempThreshold(val)}
              onSlidingComplete={(val) => setAlertThreshold(val)}
              minimumTrackTintColor={colors.icon}
              thumbTintColor={colors.icon}
            />
          </View>
          <RectButton
            style={styles.settingButton}
            onPress={() => {
              setContentPresentedOnModal("alertMethod");
              setSelectedAlertMethod(alertMethod);
              setModalVisible(true);
            }}
          >
            <Text style={[styles.settingButtonText, { color: colors.text }]}>
              {i18n.t("settings_label_alert_method")}
            </Text>
            <View style={styles.settingValue}>
              <Text
                style={[
                  styles.settingValueText,
                  { color: colors.textSecondary },
                ]}
              >
                {alertMethod}
              </Text>
              <Icon source="chevron-right" size={24} color={colors.iconLight} />
            </View>
          </RectButton>

          <View style={styles.sectionHeader}>
            <Icon source="palette" size={24} color={colors.icon} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {i18n.t("settings_header_appearance")}
            </Text>
          </View>
          <Divider style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {i18n.t("settings_toggle_dark_mode")}
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: colors.textSecondary },
                ]}
              >
                {i18n.t("settings_desc_dark_mode")}
              </Text>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkMode}
              color={colors.icon}
            />
          </View>

          <RectButton
            style={styles.settingButton}
            onPress={() => {
              setContentPresentedOnModal("language");
              setSelectedLanguage(language);
              setModalVisible(true);
            }}
          >
            <Text style={[styles.settingButtonText, { color: colors.text }]}>
              {i18n.t("settings_label_language")}
            </Text>
            <View style={styles.settingValue}>
              <Text
                style={[
                  styles.settingValueText,
                  { color: colors.textSecondary },
                ]}
              >
                {getLanguageName(language)}
              </Text>
              <Icon source="chevron-right" size={24} color={colors.iconLight} />
            </View>
          </RectButton>
        </View>
      </ScrollView>
      <Modal
        animationType={"fade"}
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          // Alert.alert("Modal has been closed.");
          setModalVisible(false);
          if (contentPresentedOnModal === "language") {
            setSelectedLanguage(language); // when modal is closed, reset the selection to current setting
          } else if (contentPresentedOnModal === "alertMethod") {
            setSelectedAlertMethod(alertMethod);
          }
        }}
      >
        <View style={styles.centeredView}>
          <View
            style={[styles.modalView, { backgroundColor: colors.background }]}
          >
            <IconButton
              icon="close"
              mode="outlined"
              size={20}
              iconColor={colors.icon}
              onPress={() => {
                setModalVisible(false);
                if (contentPresentedOnModal === "language") {
                  setSelectedLanguage(language);
                } else if (contentPresentedOnModal === "alertMethod") {
                  setSelectedAlertMethod(alertMethod);
                }
              }}
              style={{ position: "absolute", top: 0, right: 0 }}
            />
            <RadioButton.Group
              onValueChange={(newValue) => {
                if (contentPresentedOnModal === "language") {
                  if (newValue === selectedLanguage) return;
                  setSelectedLanguage(newValue as LanguageCode);
                } else {
                  if (newValue === selectedAlertMethod) return;
                  setSelectedAlertMethod(newValue as AlertMethod);
                }
              }}
              value={
                contentPresentedOnModal === "language"
                  ? selectedLanguage
                  : selectedAlertMethod
              }
            >
              {contentPresentedOnModal === "language"
                ? LANGUAGES.map((lang) => (
                    <View key={lang.code} style={styles.option}>
                      <RadioButton value={lang.code} />
                      <Text style={{ color: colors.text }}>
                        {i18n.t(lang.i18nkey)}
                      </Text>
                      <Text
                        style={[
                          styles.languageNativeName,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {" "}
                        ({lang.nativeName})
                      </Text>
                    </View>
                  ))
                : AlertMethods.map((method) => (
                    <View key={method} style={styles.option}>
                      <RadioButton value={method} />
                      <Text style={{ color: colors.text }}>
                        {method === "local" ? "Local Alert" : "Remote Alert"}
                      </Text>
                    </View>
                  ))}
            </RadioButton.Group>

            <Button
              mode="contained"
              // disabled={
              //   contentPresentedOnModal === "language"
              //     ? selectedLanguage === language
              //     : selectedAlertMethod === alertMethod
              // }
              disabled={contentPresentedOnModal === "alertMethod"}
              onPress={() => {
                if (contentPresentedOnModal === "language") {
                  setLanguage(selectedLanguage);
                } else if (contentPresentedOnModal === "alertMethod") {
                  setAlertMethod(selectedAlertMethod);
                }
                setModalVisible(false);
              }}
              style={styles.modalSaveButton}
            >
              {i18n.t("common_button_save")}
            </Button>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    width: "100%",
    marginBottom: 16,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  divider: {
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    minHeight: 60,
  },
  settingInfo: {
    flex: 1,
    paddingRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: "#666",
  },
  settingButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    minHeight: 50,
  },
  settingButtonText: {
    fontSize: 16,
    flex: 1,
    color: "#000",
  },
  settingValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  sliderContainer: {
    overflow: "hidden",
  },
  sliderContainerHidden: {
    height: 0,
    overflow: "hidden",
  },
  settingValueText: {
    fontSize: 14,
    color: "#666",
    marginRight: 4,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    margin: 20,
    backgroundColor: Colors.light.background,
    borderRadius: 20,
    padding: 20,
    alignItems: "flex-start",
    minWidth: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  languageNativeName: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  modalSaveButton: {
    marginTop: 15,
    alignSelf: "flex-end",
  },
});
