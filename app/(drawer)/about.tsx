import Colors from "@/constants/Colors";
import { useTheme } from "@/hooks/useTheme";
import Constants from "expo-constants";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, StyleSheet, View } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { Card, Divider, Icon, IconButton, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function AboutScreen() {
  const { i18n } = useTranslation();
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [contentPresentedOnModal, setContentPresentedOnModal] =
    useState<React.ReactNode>(null);
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
          }}
        />
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {i18n.t("about_header_title")}
        </Text>
        <View style={{ width: 48 }} />
      </View>
      <View style={styles.content}>
        <Card
          style={[styles.card, { backgroundColor: colors.whiteBackground }]}
        >
          <Card.Content>
            <View style={styles.iconContainer}>
              <Icon source="battery-charging" size={60} color={colors.icon} />
            </View>
            <Text style={[styles.appName, { color: colors.text }]}>
              {i18n.t("about_info_app_name")}
            </Text>
            <Text style={[styles.version, { color: colors.textSecondary }]}>
              {i18n.t("common_info_version", {
                appVersion: Constants.expoConfig?.version,
              })}
            </Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {i18n.t("about_info_desc")}
            </Text>
          </Card.Content>
        </Card>

        <View style={{ width: "100%", marginBottom: 16 }}>
          <Divider />
          <RectButton
            style={{ minHeight: 50 }}
            onPress={() => {
              setContentPresentedOnModal(keyFeatures(i18n, colors));
              setModalVisible(true);
            }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.text }}>
                {i18n.t("about_header_features")}
              </Text>
              <Icon source="chevron-right" size={24} color={colors.iconLight} />
            </View>
          </RectButton>
          <Divider />
          <RectButton
            style={{ minHeight: 50 }}
            onPress={() => {
              setContentPresentedOnModal(developerInfo(i18n, colors));
              setModalVisible(true);
            }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.text }}>
                {i18n.t("about_button_contact")}
              </Text>
              <Icon source="chevron-right" size={24} color={colors.iconLight} />
            </View>
          </RectButton>
          <Divider />
          <RectButton
            style={{ minHeight: 50 }}
            onPress={() => {
              Toast.show({
                type: "info",
                text1: "still working on it",
                position: "bottom",
              });
            }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.text }}>
                {i18n.t("about_button_update")}
              </Text>
              <Icon source="chevron-right" size={24} color={colors.iconLight} />
            </View>
          </RectButton>
          <Divider />
        </View>
      </View>
      <View
        style={{
          position: "absolute",
          width: "90%",
          bottom: 0,
          alignSelf: "center",
          paddingBottom: 20,
        }}
      >
        <Divider style={styles.divider} />
        <Text style={[styles.legalText, { color: colors.textSecondary }]}>
          {i18n.t("common_info_copyrght", {
            author: Constants.expoConfig?.owner,
          })}
        </Text>
        <Text style={[styles.legalText, { color: colors.textSecondary }]}>
          {i18n.t("about_info_privacy")}
        </Text>
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          // Alert.alert("Modal has been closed.");
          setModalVisible(false);
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
              }}
              style={{ position: "absolute", top: 0, right: 0 }}
            />
            {contentPresentedOnModal}
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
    alignItems: "center",
  },
  card: {
    width: "100%",
    marginBottom: 16,
    elevation: 2,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  version: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: "#444",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  divider: {
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    color: "#444",
    flex: 1,
  },
  legalText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
    lineHeight: 18,
  },
  linkText: { color: "#9C27B0", textDecorationLine: "underline" },
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
});

const keyFeatures = (i18n: any, colors: any) => (
  <>
    <Text style={[styles.sectionTitle, { color: colors.text }]}>
      {i18n.t("about_header_features")}
    </Text>
    <Divider style={styles.divider} />
    <View style={styles.featureItem}>
      <IconButton icon="chart-line" size={24} iconColor={colors.icon} />
      <Text style={[styles.featureText, { color: colors.text }]}>
        {i18n.t("about_feature_realtime")}
      </Text>
    </View>
    <View style={styles.featureItem}>
      <IconButton icon="bell-alert" size={24} iconColor={colors.icon} />
      <Text style={[styles.featureText, { color: colors.text }]}>
        {i18n.t("about_feature_alerts")}
      </Text>
    </View>
    <View style={styles.featureItem}>
      <IconButton icon="history" size={24} iconColor={colors.icon} />
      <Text style={[styles.featureText, { color: colors.text }]}>
        {i18n.t("about_feature_history")}
      </Text>
    </View>
    <View style={styles.featureItem}>
      <IconButton icon="devices" size={24} iconColor={colors.icon} />
      <Text style={[styles.featureText, { color: colors.text }]}>
        {i18n.t("about_feature_multidevice")}
      </Text>
    </View>
  </>
);

const developerInfo = (i18n: any, colors: any) => (
  <>
    <Text style={[styles.sectionTitle, { color: colors.text }]}>
      {i18n.t("about_header_contact")}
    </Text>
    <Divider style={styles.divider} />
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.text }]}>
        {i18n.t("about_info_developer")}
      </Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>
        {Constants.expoConfig?.owner}
      </Text>
    </View>
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.text }]}>
        {i18n.t("about_info_bug_report")}
      </Text>
      <Link
        href={`mailto:${Constants.expoConfig?.extra?.mailAddress}`}
        style={[styles.linkText, { color: colors.icon }]}
      >
        {Constants.expoConfig?.extra?.mailAddress}
      </Link>
    </View>
  </>
);
