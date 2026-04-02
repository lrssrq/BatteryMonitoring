import WebPageShell from "@/components/web/WebPageShell";
import { useSession } from "@/contexts/SessionContext";
import { authClient } from "@/lib/auth/auth-client";
import { Button, Card, Flex, Heading, Text, TextField } from "@radix-ui/themes";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";

export default function RegisterWeb() {
  const { i18n } = useTranslation();
  const { data: session, isPending: isSessionPending } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isSessionPending) return;

    if (session?.user) {
      router.replace("/me");
    }
  }, [isSessionPending, session]);

  if (isSessionPending || session?.user) {
    return null;
  }

  const onSubmit = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: i18n.t("register_error_required"),
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: i18n.t("register_error_mismatch"),
      });
      return;
    }

    if (password.length < 8) {
      Toast.show({
        type: "error",
        text1: i18n.t("register_error_short"),
      });
      return;
    }

    await authClient.signUp.email(
      { name, email, password },
      {
        onRequest: () => setIsLoading(true),
        onSuccess: () => {
          Toast.show({
            type: "success",
            text1: i18n.t("register_success"),
          });
          setIsLoading(false);
          router.replace("/me");
        },
        onError: (ctx) => {
          Toast.show({
            type: "error",
            text1: i18n.t("register_error_failed"),
            text2: ctx.error.message,
          });
          setIsLoading(false);
        },
      },
    );
  };

  return (
    <WebPageShell showBackButton backHref="/login">
      <Flex justify="center" py="6">
        <Card size="4" variant="surface" style={{ maxWidth: 520, width: "100%" }}>
          <Flex direction="column" gap="5" p="2">
            <Flex direction="column" gap="2" align="center">
              <Heading size="7" weight="bold" style={{ letterSpacing: "-0.03em" }}>
                {i18n.t("register_header_title")}
              </Heading>
              <Text color="gray" size="2">{i18n.t("register_subtitle")}</Text>
            </Flex>

            <Flex direction="column" gap="2">
              <Text as="label" size="2" weight="medium" color="gray">
                {i18n.t("common_input_username")}
              </Text>
              <TextField.Root
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={isLoading}
                size="3"
                variant="surface"
              />
            </Flex>

            <Flex direction="column" gap="2">
              <Text as="label" size="2" weight="medium" color="gray">
                {i18n.t("common_input_email")}
              </Text>
              <TextField.Root
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isLoading}
                type="email"
                autoCapitalize="none"
                size="3"
                variant="surface"
              />
            </Flex>

            <Flex direction="column" gap="2">
              <Text as="label" size="2" weight="medium" color="gray">
                {i18n.t("common_input_password")}
              </Text>
              <TextField.Root
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isLoading}
                type="password"
                size="3"
                variant="surface"
              />
            </Flex>

            <Flex direction="column" gap="2">
              <Text as="label" size="2" weight="medium" color="gray">
                {i18n.t("register_input_confirm_password")}
              </Text>
              <TextField.Root
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                disabled={isLoading}
                type="password"
                size="3"
                variant="surface"
              />
            </Flex>

            <Button onClick={onSubmit} disabled={isLoading} size="3" style={{ cursor: "pointer" }}>
              {isLoading
                ? i18n.t("register_loading")
                : i18n.t("register_header_title")}
            </Button>
          </Flex>
        </Card>
      </Flex>
    </WebPageShell>
  );
}
