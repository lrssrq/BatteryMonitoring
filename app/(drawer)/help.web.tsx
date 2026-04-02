import WebPageShell from "@/components/web/WebPageShell";
import {
    Card,
    Container,
    Flex,
    Heading,
    Text,
} from "@radix-ui/themes";
import Constants from "expo-constants";
import { Link } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { useWindowDimensions } from "react-native";

export default function HelpWeb() {
  const { i18n } = useTranslation();
  const { width } = useWindowDimensions();
  const desktop = width >= 1080;

  const quickStartItems = [
    {
      title: i18n.t("help_subtitle_monitor"),
      description: i18n.t("help_desc_monitor"),
    },
    {
      title: i18n.t("help_subtitle_alerts"),
      description: i18n.t("help_desc_alerts"),
    },
    {
      title: i18n.t("help_subtitle_history"),
      description: i18n.t("help_desc_history"),
    },
    {
      title: i18n.t("help_subtitle_manage"),
      description: i18n.t("help_desc_manage"),
    },
  ];

  const faqIndexes = [1, 2, 3, 4, 5, 6];

  return (
    <WebPageShell>
      <Container p="4">
        <Flex direction="column" gap="4">
          <Flex direction={desktop ? "row" : "column"} gap="4">
            {/* Quick Start Section */}
            <Card variant="surface" style={{ flex: 1 }}>
              <Heading size="6" mb="4">
                {i18n.t("help_header_quick_start")}
              </Heading>
              <Flex direction="column" gap="3">
                {quickStartItems.map((item) => (
                  <Card key={item.title} variant="surface">
                    <Heading size="4" mb="2">
                      {item.title}
                    </Heading>
                    <Text color="gray" size="2" style={{ lineHeight: 1.5 }}>
                      {item.description}
                    </Text>
                  </Card>
                ))}
              </Flex>
            </Card>

            {/* FAQ Section */}
            <Card variant="surface" style={{ flex: 1.1 }}>
              <Heading size="6" mb="4">
                {i18n.t("help_header_faq")}
              </Heading>
              <Flex direction="column" gap="3">
                {faqIndexes.map((index) => (
                  <Card key={index} variant="surface">
                    <Flex direction="row" gap="2" align="start" mb="2">
                      <Text color="gray" weight="bold" size="3">
                        ?
                      </Text>
                      <Heading size="4">
                        {i18n.t(`help_faq_q${index}`)}
                      </Heading>
                    </Flex>
                    <Text color="gray" size="2" style={{ lineHeight: 1.5 }}>
                      {i18n.t(`help_faq_a${index}`)}
                    </Text>
                  </Card>
                ))}
              </Flex>
            </Card>
          </Flex>

          {/* Contact Section */}
          <Card variant="surface">
            <Heading size="6" mb="3">
              {i18n.t("help_header_more")}
            </Heading>
            <Text color="gray" size="3" mb="2">
              {i18n.t("help_info_contact")}
            </Text>
            <Link href={`mailto:${Constants.expoConfig?.extra?.mailAddress}`}>
              <Text
                size="3"
                style={{
                  color: "var(--indigo-11)",
                  textDecoration: "underline",
                  display: "inline-block",
                }}
              >
                {Constants.expoConfig?.extra?.mailAddress}
              </Text>
            </Link>
            <Text color="gray" size="3" mt="2">
              {i18n.t("help_info_response")}
            </Text>
          </Card>
        </Flex>
      </Container>
    </WebPageShell>
  );
}
