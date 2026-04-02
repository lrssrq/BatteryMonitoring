import WebPageShell from "@/components/web/WebPageShell";
import { useSession } from "@/contexts/SessionContext";
import { authClient } from "@/lib/auth/auth-client";
import { Box, Button, Card, Container, Flex, Heading, Link, Section, Text, TextField } from "@radix-ui/themes";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";

export default function LoginWeb() {
  const { i18n } = useTranslation();
  const { data: session, isPending: isSessionPending } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: i18n.t("login_error_empty"),
      });
      return;
    }

    await authClient.signIn.email(
      { email, password },
      {
        onRequest: () => setIsLoading(true),
        onSuccess: (ctx) => {
          Toast.show({
            type: "success",
            text1: `${i18n.t("me_header_welcome_back")} ${ctx.data?.user?.name || "User"}`,
          });
          setIsLoading(false);
          router.replace("/me");
        },
        onError: (ctx) => {
          Toast.show({
            type: "error",
            text1: i18n.t("login_error_failed"),
            text2: ctx.error.message,
          });
          setIsLoading(false);
        },
      },
    );
  };

  return (
    <WebPageShell showBackButton backHref="/me">
      <Section size="4">
        <Container size="1">
          <Card size="4" variant="surface" style={{ maxWidth: 420, margin: "0 auto" }}>
            <Flex direction="column" gap="5" p="2">
              <Flex direction="column" gap="2" align="center">
                <Box
                  mb="2"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "var(--radius-3)",
                    background: "linear-gradient(135deg, var(--indigo-9), var(--cyan-9))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text size="5" weight="bold" style={{ color: "white" }}>B</Text>
                </Box>
                <Heading as="h1" size="7" align="center" weight="bold" style={{ letterSpacing: "-0.03em" }}>
                  {i18n.t("login_button_login")}
                </Heading>
                <Text color="gray" size="2" align="center">
                  {i18n.t("login_subtitle")}
                </Text>
              </Flex>

              <Flex direction="column" gap="2">
                <Text as="label" size="2" weight="medium" color="gray">
                  {i18n.t("common_input_email")}
                </Text>
                <TextField.Root
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isLoading}
                  autoCapitalize="none"
                  type="email"
                  size="3"
                  placeholder="you@example.com"
                  variant="surface"
                />
              </Flex>

              <Flex direction="column" gap="2">
                <Flex justify="between" align="end">
                  <Text as="label" size="2" weight="medium" color="gray">
                    {i18n.t("common_input_password")}
                  </Text>
                  <Link href="#" size="1" weight="medium">
                    {i18n.t("login_forgot_password")}
                  </Link>
                </Flex>
                <TextField.Root
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isLoading}
                  type="password"
                  size="3"
                  placeholder="••••••••"
                  variant="surface"
                />
              </Flex>

              <Button onClick={onSubmit} disabled={isLoading} size="3" variant="solid" mt="1" style={{ cursor: "pointer" }}>
                {isLoading ? i18n.t("login_loading") : i18n.t("login_button_login")}
              </Button>

              <Flex align="center" justify="center" gap="1">
                <Text size="2" color="gray">
                  {i18n.t("login_text_no_account")}
                </Text>
                <Link
                  size="2"
                  weight="medium"
                  style={{ cursor: "pointer" }}
                  onClick={() => router.navigate("/register")}
                >
                  {i18n.t("login_button_signup")}
                </Link>
              </Flex>
            </Flex>
          </Card>
        </Container>
      </Section>
    </WebPageShell>
  );
}
