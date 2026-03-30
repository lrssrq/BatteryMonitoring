import PaperDialog, { PaperDialogRef } from "@/components/PaperDialog";
import { SESSION_CACHE_KEY } from "@/constants/AsyncStorageKeys";
import { useSession } from "@/contexts/SessionContext";
import { useTheme } from "@/hooks/useTheme";
import { authClient } from "@/lib/auth/auth-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  IconButton,
  Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Tab() {
  const { i18n } = useTranslation();
  const { colors } = useTheme();
  const {
    data: session,
    isPending,
    isRefetching,
    error,
    refetch,
  } = useSession();

  // cached user info for fallback display when session is invalid
  const [cachedUser, setCachedUser] = useState<{
    name: string;
    email: string;
    createdAt: string;
  } | null>(null);

  // when component mounts, load cached user info if available
  useEffect(() => {
    AsyncStorage.getItem(SESSION_CACHE_KEY).then((raw) => {
      if (raw) setCachedUser(JSON.parse(raw));
    });
  }, []);

  // session change effect: update cache and display user info accordingly
  useEffect(() => {
    console.log("Session changed:", session, "Pending:", isPending);
    if (isPending) return;
    if (session?.user) {
      const userData = {
        name: session.user.name,
        email: session.user.email,
        createdAt: String(session.user.createdAt),
      };
      AsyncStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(userData));
      setCachedUser(userData);
    } else {
      // valid session lost (e.g. logout), clear cache and fallback to cached user
      AsyncStorage.removeItem(SESSION_CACHE_KEY);
      setCachedUser(null);
    }
  }, [session, isPending]);

  // data for display: prioritize fresh session data, fallback to cache
  const displayUser = session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
        createdAt: String(session.user.createdAt),
      }
    : cachedUser;

  const [isLoading, setIsLoading] = useState(false);
  const dialogRef = useRef<PaperDialogRef>(null);
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <PaperDialog
        ref={dialogRef}
        title={i18n.t("common_dialog_error")}
        content={i18n.t("me_dialog_must_login")}
        confirmText={i18n.t("common_button_ok")}
        mode="single"
      />
      <View style={styles.header}>
        <IconButton
          icon="link"
          iconColor={colors.icon}
          size={28}
          onPress={() => {
            if (session) router.navigate("/deviceManagement");
            else dialogRef.current?.show();
          }}
        />
      </View>
      <View style={styles.content}>
        {!displayUser ? (
          <>
            <Avatar.Icon
              size={100}
              icon="account-circle"
              style={[styles.avatar, { backgroundColor: colors.icon }]}
            />
            <Text
              variant="headlineSmall"
              style={[styles.welcomeText, { color: colors.text }]}
            >
              {i18n.t("me_header_welcome")}
            </Text>
            {isPending ? (
              <ActivityIndicator size="large" />
            ) : (
              <Button
                icon="account-tie"
                mode="contained"
                onPress={() => router.navigate("/login")}
                style={styles.loginButton}
                disabled={isPending || isRefetching}
              >
                {i18n.t("me_button_login_register")}
              </Button>
            )}
          </>
        ) : (
          <>
            <Avatar.Icon
              size={100}
              icon="account"
              style={[styles.avatar, { backgroundColor: colors.icon }]}
            />
            <Text
              variant="headlineSmall"
              style={[styles.welcomeText, { color: colors.text }]}
            >
              {i18n.t("me_header_welcome_back")}
            </Text>
            <Card
              style={[
                styles.userCard,
                { backgroundColor: colors.whiteBackground },
              ]}
            >
              <Card.Content>
                <Text variant="titleMedium" style={{ color: colors.text }}>
                  {i18n.t("me_info_username")} {displayUser.name}
                </Text>
                <Text
                  variant="bodyMedium"
                  style={[styles.emailText, { color: colors.textSecondary }]}
                >
                  {i18n.t("me_info_email")} {displayUser.email}
                </Text>
                <Text
                  variant="bodyMedium"
                  style={[styles.emailText, { color: colors.textSecondary }]}
                >
                  {i18n.t("me_info_created_at")}{" "}
                  {`${new Date(displayUser.createdAt).toLocaleDateString()} ${new Date(displayUser.createdAt).toLocaleTimeString()}`}
                </Text>
              </Card.Content>
            </Card>
            {isLoading ? (
              <ActivityIndicator size="large" style={styles.logoutButton} />
            ) : (
              <Button
                icon="logout"
                mode="contained"
                disabled={isPending}
                onPress={async () => {
                  await authClient.signOut(
                    {},
                    {
                      onRequest: (ctx) => {
                        setIsLoading(true);
                      },
                      onSuccess: (ctx) => {
                        // router.replace("/(drawer)/(tabs)");
                        setIsLoading(false);
                      },
                      onError: (ctx) => {
                        setIsLoading(false);
                      },
                    },
                  );
                }}
                style={styles.logoutButton}
              >
                {i18n.t("me_button_logout")}
              </Button>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    width: "100%",
    height: 50,
    paddingHorizontal: 8,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    marginBottom: 20,
  },
  welcomeText: {
    marginBottom: 30,
    textAlign: "center",
  },
  loginButton: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  logoutButton: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  userCard: {
    marginTop: 20,
    width: "90%",
    padding: 10,
  },
  emailText: {
    marginTop: 8,
    opacity: 0.7,
  },
  verifyingText: {
    opacity: 0.5,
    marginBottom: 4,
  },
});
