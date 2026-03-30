import { Link, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";

import { Text, View } from "react-native";

export default function NotFoundScreen() {
  const { i18n } = useTranslation();
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Text style={styles.title}>{i18n.t("notfound_info_missing")}</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>{i18n.t("notfound_button_home")}</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: "#2e78b7",
  },
});
