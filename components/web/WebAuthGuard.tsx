import { useSession } from "@/contexts/SessionContext";
import { Box, Button, Card, Flex, Heading, Text } from "@radix-ui/themes";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import WebPageShell from "./WebPageShell";

export default function WebAuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const { i18n } = useTranslation();

  if (isPending) {
    return (
      <WebPageShell>
        <Flex justify="center" align="center" style={{ flex: 1 }}>
          <Text color="gray">Loading...</Text>
        </Flex>
      </WebPageShell>
    );
  }

  if (!session?.user) {
    return (
      <WebPageShell>
        <Flex justify="center" align="center" style={{ flex: 1, width: "100%" }}>
          <Card variant="surface" style={{ maxWidth: 480, width: "100%" }}>
            <Flex direction="column" gap="4" align="center" p="4">
              <Box
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--indigo-9), var(--cyan-9))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text size="5" weight="bold" style={{ color: "white" }}>!</Text>
              </Box>
              <Heading size="6" align="center">
                {i18n.t("me_header_welcome")}
              </Heading>
              <Text align="center" color="gray" size="2">
                {i18n.t("me_dialog_must_login")}
              </Text>
              <Button
                size="3"
                onClick={() => router.navigate("/login")}
                style={{ cursor: "pointer" }}
              >
                {i18n.t("me_button_login_register")}
              </Button>
            </Flex>
          </Card>
        </Flex>
      </WebPageShell>
    );
  }

  return <>{children}</>;
}
