import WebPageShell from "@/components/web/WebPageShell";
import { SESSION_CACHE_KEY } from "@/constants/AsyncStorageKeys";
import { useSession } from "@/contexts/SessionContext";
import { authClient } from "@/lib/auth/auth-client";
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Text,
} from "@radix-ui/themes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useWindowDimensions } from "react-native";

export default function MeWeb() {
  const { i18n } = useTranslation();
  const { data: session, isPending } = useSession();
  const { width } = useWindowDimensions();
  const desktop = width >= 1120;
  const mobile = width < 760;
  const [cachedUser, setCachedUser] = useState<{
    name: string;
    email: string;
    createdAt: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SESSION_CACHE_KEY).then((raw) => {
      if (raw) setCachedUser(JSON.parse(raw));
    });
  }, []);

  useEffect(() => {
    if (isPending) return;

    if (session?.user) {
      const userData = {
        name: session.user.name,
        email: session.user.email,
        createdAt: String(session.user.createdAt),
      };
      AsyncStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(userData));
      setCachedUser(userData);
      return;
    }

    AsyncStorage.removeItem(SESSION_CACHE_KEY);
    setCachedUser(null);
  }, [session, isPending]);

  const user = session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
        createdAt: String(session.user.createdAt),
      }
    : isPending
      ? cachedUser
      : null;

  return (
    <WebPageShell>
      <Flex
        justify="center"
        align="center"
        style={{
          flex: 1,
          paddingBottom: mobile ? 28 : 16,
          width: "100%",
        }}
      >
        {!user ? (
          <Card
            variant="surface"
            style={{
              maxWidth: 480,
              width: "100%",
            }}
          >
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
                <Text size="5" weight="bold" style={{ color: "white" }}>U</Text>
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
                disabled={isPending}
                style={{ cursor: "pointer" }}
              >
                {i18n.t("me_button_login_register")}
              </Button>
            </Flex>
          </Card>
        ) : (
          <Flex
            direction={desktop ? "row" : "column"}
            gap="4"
            style={{
              width: "100%",
              maxWidth: 1180,
              alignItems: "stretch",
              justifyContent: "center",
            }}
          >
            {/* Profile Card */}
            <Card variant="surface" style={{ flex: desktop ? 2 : undefined }}>
              <Flex direction="column" gap="5" p="2">
                <Flex gap="4" align="center">
                  <Box
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, var(--indigo-9), var(--cyan-9))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Text size="5" weight="bold" style={{ color: "white" }}>
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </Text>
                  </Box>
                  <Flex direction="column" gap="1">
                    <Heading size="5">{user.name}</Heading>
                    <Text size="2" color="gray">{user.email}</Text>
                  </Flex>
                </Flex>

                <Flex direction="column" gap="3">
                  <Flex direction="column" gap="1">
                    <Text size="1" color="gray" weight="medium">{i18n.t("me_info_username")}</Text>
                    <Text size="3">{user.name}</Text>
                  </Flex>
                  <Flex direction="column" gap="1">
                    <Text size="1" color="gray" weight="medium">{i18n.t("me_info_email")}</Text>
                    <Text size="3">{user.email}</Text>
                  </Flex>
                  <Flex direction="column" gap="1">
                    <Text size="1" color="gray" weight="medium">{i18n.t("me_info_created_at")}</Text>
                    <Text size="3">{new Date(user.createdAt).toLocaleString()}</Text>
                  </Flex>
                </Flex>
              </Flex>
            </Card>

            {/* Actions Card */}
            <Flex direction="column" gap="4" style={{ flex: desktop ? 1 : undefined }}>
              <Card variant="surface">
                <Flex direction="column" gap="3" p="1">
                  <Heading size="4">{i18n.t("me_actions")}</Heading>
                  <Button
                    variant="soft"
                    size="3"
                    onClick={() => router.navigate("/deviceManagement")}
                    style={{ cursor: "pointer", justifyContent: "flex-start" }}
                  >
                    {i18n.t("device_management_title")}
                  </Button>
                  <Button
                    variant="soft"
                    size="3"
                    onClick={() => router.navigate("/settings")}
                    style={{ cursor: "pointer", justifyContent: "flex-start" }}
                  >
                    {i18n.t("settings_header_title")}
                  </Button>
                  <Button
                    variant="outline"
                    color="red"
                    size="3"
                    onClick={async () => {
                      await authClient.signOut(
                        {},
                        {
                          onRequest: () => setIsLoading(true),
                          onSuccess: () => {
                            setIsLoading(false);
                            router.replace("/me");
                          },
                          onError: () => setIsLoading(false),
                        },
                      );
                    }}
                    disabled={isLoading}
                    style={{ cursor: "pointer" }}
                  >
                    {isLoading ? "Loading..." : i18n.t("me_button_logout")}
                  </Button>
                </Flex>
              </Card>

              <Card variant="surface">
                <Flex direction="column" gap="2" p="1">
                  <Heading size="4">{i18n.t("me_tips")}</Heading>
                  <Text size="2" color="gray" style={{ lineHeight: 1.6 }}>
                    {i18n.t("me_tip_text")}
                  </Text>
                </Flex>
              </Card>
            </Flex>
          </Flex>
        )}
      </Flex>
    </WebPageShell>
  );
}

