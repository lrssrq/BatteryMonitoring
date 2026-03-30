import { Stack } from "expo-router";

export default function OtherScreensLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="camera"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen
        name="dataHistory"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen
        name="deviceManagement"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen
        name="login"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen
        name="register"
        options={{ headerShown: false, presentation: "modal" }}
      />
    </Stack>
  );
}
