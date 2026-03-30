import Colors from "@/constants/Colors";
import { authClient } from "@/lib/auth/auth-client";
import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
// import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import {
  Button,
  IconButton,
  MD3Colors,
  Text,
  TextInput,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function Screen() {
  const { i18n } = useTranslation();
  const [email, onChangeEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onPressLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "please enter email and password",
        text2: "Email and password cannot be empty",
        visibilityTime: 2000,
      });
      return;
    }

    await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onRequest(ctx) {
          setIsLoading(true);
        },
        onSuccess(ctx) {
          Toast.show({
            type: "success",
            text1: "Login Successful",
            text2: `Welcome back, ${ctx.data?.user?.name}!`,
            visibilityTime: 2000,
          });
          setTimeout(() => {
            router.dismissTo("/me");
          }, 500);
          setIsLoading(false);
        },
        onError(ctx) {
          Toast.show({
            type: "error",
            text1: "Login Failed",
            text2: `${ctx.error.message}`,
            visibilityTime: 2000,
          });
          setIsLoading(false);
        },
      },
    );
  };

  // const [text, setText] = React.useState("");

  // // Define validation logic: for example, cannot be empty
  // const hasErrors = () => {
  //   return text.length === 0; // If length is 0, consider it an error
  // };
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <IconButton
            icon="close"
            iconColor="black"
            size={30}
            onPress={() => {
              router.canGoBack() ? router.back() : router.dismissTo("/");
            }}
          />
        </View>
        <View style={styles.content}>
          <Text style={styles.text}>{i18n.t("common_input_email")}</Text>
          <TextInput
            label={i18n.t("common_input_email")}
            maxLength={100}
            mode="outlined"
            style={styles.input}
            contentStyle={{ paddingHorizontal: 5, fontSize: 16 }}
            selectTextOnFocus={true}
            keyboardType="email-address"
            autoCapitalize="none"
            disabled={isLoading}
            onChangeText={onChangeEmail}
            value={email}
          />
          <Text style={styles.text}>{i18n.t("common_input_password")}</Text>
          <TextInput
            label={i18n.t("common_input_password")}
            maxLength={64}
            mode="outlined"
            style={styles.input}
            contentStyle={{ paddingHorizontal: 5, fontSize: 14 }}
            secureTextEntry={!showPassword}
            disabled={isLoading}
            value={password}
            onChangeText={(text) =>
              setPassword(text.replace(/[^a-zA-Z0-9!@#$%^&*]/g, ""))
            }
            right={
              <TextInput.Icon
                icon={showPassword ? "eye" : "eye-off"}
                size={16}
                style={{ margin: 0 }}
                onPress={() => setShowPassword(!showPassword)}
                forceTextInputFocus={false}
              />
            }
          />
          <Text
            style={{ alignSelf: "flex-end", marginRight: 40 }}
          >{`${password.length}/64`}</Text>

          <IconButton
            icon="arrow-right"
            mode="contained"
            iconColor={MD3Colors.primary100}
            containerColor={MD3Colors.primary50}
            onPress={onPressLogin}
            style={styles.loginButton}
            loading={isLoading}
          />

          {/* <TextInput.Affix
        text={`${password.length}/64`}
        textStyle={{
          position: "absolute",
          left: 222,
          top: -25,
          fontSize: 12,
          fontWeight: "bold",
        }}
      /> */}
          <Button onPress={() => router.push("/register")} disabled={isLoading}>
            {i18n.t("login_button_signup")}
          </Button>
        </View>
      </KeyboardAvoidingView>
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
    justifyContent: "flex-start",
    width: "100%",
    height: 50,
    paddingHorizontal: 8,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    // color: "#fff",
  },
  input: {
    // backgroundColor: "transparent",
    width: "80%",
    height: 50,
    paddingHorizontal: 5,
  },
  loginButton: {
    // backgroundColor: "blue",
    width: 80,
    height: 40,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    left: 0,
  },
});
