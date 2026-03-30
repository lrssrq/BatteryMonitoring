import Colors from "@/constants/Colors";
import { useTheme } from "@/hooks/useTheme";
import Constants from "expo-constants";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { Card, Divider, Icon, IconButton, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HelpScreen() {
  const { i18n } = useTranslation();
  const { colors } = useTheme();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

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
          {i18n.t("help_header_title")}
        </Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Quick Start Guide */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Icon source="rocket-launch" size={24} color={colors.icon} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {i18n.t("help_header_quick_start")}
                </Text>
              </View>
              <Divider style={styles.divider} />

              <View style={styles.stepItem}>
                <View
                  style={[styles.stepNumber, { backgroundColor: colors.icon }]}
                >
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>
                    {i18n.t("help_subtitle_monitor")}
                  </Text>
                  <Text
                    style={[
                      styles.stepDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {i18n.t("help_desc_monitor")}
                  </Text>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View
                  style={[styles.stepNumber, { backgroundColor: colors.icon }]}
                >
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>
                    {i18n.t("help_subtitle_alerts")}
                  </Text>
                  <Text
                    style={[
                      styles.stepDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {i18n.t("help_desc_alerts")}
                  </Text>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View
                  style={[styles.stepNumber, { backgroundColor: colors.icon }]}
                >
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>
                    {i18n.t("help_subtitle_history")}
                  </Text>
                  <Text
                    style={[
                      styles.stepDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {i18n.t("help_desc_history")}
                  </Text>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View
                  style={[styles.stepNumber, { backgroundColor: colors.icon }]}
                >
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>
                    {i18n.t("help_subtitle_manage")}
                  </Text>
                  <Text style={styles.stepDescription}>
                    {i18n.t("help_desc_manage")}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Frequently Asked Questions */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Icon
                  source="frequently-asked-questions"
                  size={24}
                  color={colors.icon}
                />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {i18n.t("help_header_faq")}
                </Text>
              </View>
              <Divider style={styles.divider} />

              {/* FAQ 1 */}
              <View style={styles.faqItem}>
                <IconButton
                  icon={expandedFaq === 1 ? "chevron-up" : "chevron-down"}
                  size={20}
                  iconColor={colors.icon}
                  onPress={() => toggleFaq(1)}
                  style={styles.faqIcon}
                />
                <View style={styles.faqContent}>
                  <Text
                    style={[styles.faqQuestion, { color: colors.text }]}
                    onPress={() => toggleFaq(1)}
                  >
                    {i18n.t("help_faq_q1")}
                  </Text>
                  {expandedFaq === 1 && (
                    <Text
                      style={[
                        styles.faqAnswer,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {i18n.t("help_faq_a1")}
                    </Text>
                  )}
                </View>
              </View>
              <Divider />

              {/* FAQ 2 */}
              <View style={styles.faqItem}>
                <IconButton
                  icon={expandedFaq === 2 ? "chevron-up" : "chevron-down"}
                  size={20}
                  iconColor={colors.icon}
                  onPress={() => toggleFaq(2)}
                  style={styles.faqIcon}
                />
                <View style={styles.faqContent}>
                  <Text
                    style={[styles.faqQuestion, { color: colors.text }]}
                    onPress={() => toggleFaq(2)}
                  >
                    {i18n.t("help_faq_q2")}
                  </Text>
                  {expandedFaq === 2 && (
                    <Text
                      style={[
                        styles.faqAnswer,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {i18n.t("help_faq_a2")}
                    </Text>
                  )}
                </View>
              </View>
              <Divider />

              {/* FAQ 3 */}
              <View style={styles.faqItem}>
                <IconButton
                  icon={expandedFaq === 3 ? "chevron-up" : "chevron-down"}
                  size={20}
                  iconColor={colors.icon}
                  onPress={() => toggleFaq(3)}
                  style={styles.faqIcon}
                />
                <View style={styles.faqContent}>
                  <Text
                    style={[styles.faqQuestion, { color: colors.text }]}
                    onPress={() => toggleFaq(3)}
                  >
                    {i18n.t("help_faq_q3")}
                  </Text>
                  {expandedFaq === 3 && (
                    <Text
                      style={[
                        styles.faqAnswer,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {i18n.t("help_faq_a3")}
                    </Text>
                  )}
                </View>
              </View>
              <Divider />

              {/* FAQ 4 */}
              <View style={styles.faqItem}>
                <IconButton
                  icon={expandedFaq === 4 ? "chevron-up" : "chevron-down"}
                  size={20}
                  iconColor={colors.icon}
                  onPress={() => toggleFaq(4)}
                  style={styles.faqIcon}
                />
                <View style={styles.faqContent}>
                  <Text
                    style={[styles.faqQuestion, { color: colors.text }]}
                    onPress={() => toggleFaq(4)}
                  >
                    {i18n.t("help_faq_q4")}
                  </Text>
                  {expandedFaq === 4 && (
                    <Text
                      style={[
                        styles.faqAnswer,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {i18n.t("help_faq_a4")}
                    </Text>
                  )}
                </View>
              </View>
              <Divider />

              {/* FAQ 5 */}
              <View style={styles.faqItem}>
                <IconButton
                  icon={expandedFaq === 5 ? "chevron-up" : "chevron-down"}
                  size={20}
                  iconColor={colors.icon}
                  onPress={() => toggleFaq(5)}
                  style={styles.faqIcon}
                />
                <View style={styles.faqContent}>
                  <Text
                    style={[styles.faqQuestion, { color: colors.text }]}
                    onPress={() => toggleFaq(5)}
                  >
                    {i18n.t("help_faq_q5")}
                  </Text>
                  {expandedFaq === 5 && (
                    <Text
                      style={[
                        styles.faqAnswer,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {i18n.t("help_faq_a5")}
                    </Text>
                  )}
                </View>
              </View>
              <Divider />

              {/* FAQ 6 */}
              <View style={styles.faqItem}>
                <IconButton
                  icon={expandedFaq === 6 ? "chevron-up" : "chevron-down"}
                  size={20}
                  iconColor={colors.icon}
                  onPress={() => toggleFaq(6)}
                  style={styles.faqIcon}
                />
                <View style={styles.faqContent}>
                  <Text
                    style={[styles.faqQuestion, { color: colors.text }]}
                    onPress={() => toggleFaq(6)}
                  >
                    {i18n.t("help_faq_q6")}
                  </Text>
                  {expandedFaq === 6 && (
                    <Text
                      style={[
                        styles.faqAnswer,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {i18n.t("help_faq_a6")}
                    </Text>
                  )}
                </View>
              </View>
              <Divider />
            </Card.Content>
          </Card>

          {/* Contact Support */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Icon source="email" size={24} color={colors.icon} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {i18n.t("help_header_more")}
                </Text>
              </View>
              <Divider style={styles.divider} />
              <Text
                style={[styles.contactText, { color: colors.textSecondary }]}
              >
                {i18n.t("help_info_contact")}
              </Text>
              <View style={styles.contactInfo}>
                <Icon
                  source="email-outline"
                  size={20}
                  color={colors.textSecondary}
                />
                <Link
                  href={`mailto:${Constants.expoConfig?.extra?.mailAddress}`}
                  style={[styles.contactEmail, { color: colors.icon }]}
                >
                  {Constants.expoConfig?.extra?.mailAddress}
                </Link>
              </View>
              <Text
                style={[styles.responseTime, { color: colors.textSecondary }]}
              >
                {i18n.t("help_info_response")}
              </Text>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
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
  stepItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#9C27B0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  stepNumberText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  faqItem: {
    flexDirection: "row",
    paddingVertical: 8,
    alignItems: "flex-start",
  },
  faqIcon: {
    margin: 0,
  },
  faqContent: {
    flex: 1,
    paddingRight: 8,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#000",
  },
  faqAnswer: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginTop: 8,
  },
  contactText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    marginBottom: 12,
  },
  contactInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  contactEmail: {
    fontSize: 16,
    color: "#9C27B0",
    marginLeft: 8,
    fontWeight: "500",
  },
  responseTime: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
});
