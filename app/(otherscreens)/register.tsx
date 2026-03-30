import Colors from "@/constants/Colors";
import { authClient } from "@/lib/auth/auth-client";
import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, StyleSheet, View } from "react-native";
// import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { IconButton, MD3Colors, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
export default function Screen() {
  const { i18n } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onPressRegister = async () => {
    // basic validation
    if (!username || !password || !confirmPassword || !email) {
      Toast.show({
        type: "error",
        text1: "Please fill in all fields",
        text2: "All fields are required",
        visibilityTime: 2000,
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Passwords do not match",
        text2: "The two passwords entered do not match",
        visibilityTime: 2000,
      });
      return;
    }

    if (password.length < 8) {
      Toast.show({
        type: "error",
        text1: "Password too short",
        text2: "Password must be at least 8 characters long",
        visibilityTime: 2000,
      });
      return;
    }
    await authClient.signUp.email(
      {
        name: username,
        email: email,
        password: password,
      },
      {
        onRequest: (ctx) => {
          //show loading
          setIsLoading(true);
        },
        onSuccess: (ctx) => {
          setIsLoading(false);
          Toast.show({
            type: "success",
            text1: "Registration Successful",
            text2: `Welcome, ${username}!`,
            visibilityTime: 2000,
          });
          //redirect to the dashboard or sign in page
          setTimeout(() => {
            router.dismissTo("/me");
          }, 500);
        },
        onError: (ctx) => {
          // display the error message
          console.log(ctx.error.message);
          Toast.show({
            type: "error",
            text1: "Registration Failed",
            text2: "Please try again later",
            visibilityTime: 2000,
          });
          setIsLoading(false);
        },
      },
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={"padding"}>
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
          <Text style={styles.title}>{i18n.t("register_header_title")}</Text>
          <TextInput
            label={i18n.t("common_input_username")}
            maxLength={100}
            style={styles.input}
            contentStyle={styles.inputContent}
            value={username}
            onChangeText={setUsername}
            disabled={isLoading}
          />
          <TextInput
            label={i18n.t("common_input_email")}
            maxLength={100}
            style={styles.input}
            contentStyle={styles.inputContent}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            disabled={isLoading}
          />
          <TextInput
            label={i18n.t("common_input_password")}
            maxLength={64}
            style={styles.input}
            contentStyle={styles.inputContent}
            value={password}
            secureTextEntry={!showPassword}
            onChangeText={(text) =>
              setPassword(text.replace(/[^a-zA-Z0-9!@#$%^&*]/g, ""))
            }
            autoCapitalize="none"
            disabled={isLoading}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye" : "eye-off"}
                size={16}
                style={{ margin: 0, paddingTop: 0 }}
                onPress={() => setShowPassword(!showPassword)}
                forceTextInputFocus={false}
              />
            }
          />
          <Text
            style={{ alignSelf: "flex-end", marginRight: 40 }}
          >{`${password.length}/64`}</Text>
          <TextInput
            label={i18n.t("register_input_confirm_password")}
            maxLength={64}
            style={styles.input}
            contentStyle={styles.inputContent}
            secureTextEntry={!showPassword}
            value={confirmPassword}
            onChangeText={(text) =>
              setConfirmPassword(text.replace(/[^a-zA-Z0-9!@#$%^&*]/g, ""))
            }
            autoCapitalize="none"
            disabled={isLoading}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye" : "eye-off"}
                size={16}
                style={{ margin: 0, paddingTop: 0 }}
                onPress={() => setShowPassword(!showPassword)}
                forceTextInputFocus={false}
              />
            }
          />
          <Text
            style={{ alignSelf: "flex-end", marginRight: 40 }}
          >{`${confirmPassword.length}/64`}</Text>

          <IconButton
            icon="arrow-right"
            mode="contained"
            iconColor={MD3Colors.primary100}
            containerColor={MD3Colors.primary50}
            onPress={onPressRegister}
            loading={isLoading}
            style={styles.registerButton}
          />
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: Colors.light.text,
    marginBottom: 30,
  },
  input: {
    width: "80%",
    height: 50,
    margin: 10,
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingTop: 0,
    // paddingVertical: 10,
    color: Colors.light.text,
  },
  registerButton: {
    width: "80%",
    height: 40,
    marginTop: 20,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    left: 0,
  },
  inputContent: {
    // paddingHorizontal: 5,
    paddingVertical: 0,
    fontSize: 14,
  },
});
