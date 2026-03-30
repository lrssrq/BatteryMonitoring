import { useTheme } from "@/hooks/useTheme";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs, useNavigation } from "expo-router";
import React from "react";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { theme, colors } = useTheme();
  const navigation = useNavigation();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveBackgroundColor: colors.background,
        tabBarInactiveBackgroundColor: colors.background,
        tabBarActiveTintColor: colors.tint,
        tabBarStyle: {
          backgroundColor: colors.background,
        },
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerShown: false,
          title: "My Device",
          headerTitleAlign: "center",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home-sharp" : "home-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerShown: false,
          title: "Analysis",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "analytics-sharp" : "analytics-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="alert"
        options={{
          headerShown: false,
          headerStyle: {
            backgroundColor: colors.background,
          },
          title: "Alert",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "alert-circle" : "alert-circle-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerShown: false,
          title: "Me",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person-circle-sharp" : "person-circle-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
