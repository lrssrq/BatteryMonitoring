// app/(drawer)/_layout.tsx
import { useTheme } from "@/hooks/useTheme";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import Constants from "expo-constants";
import { Drawer } from "expo-router/drawer";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

function CustomDrawerContent(props: any) {
  const { i18n } = useTranslation();
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <View
          style={{
            height: 50,
            backgroundColor: "transparent",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          {/* <Button
            style={{ position: "absolute", top: 0, right: 0 }}
            icon="line-scan"
            mode="contained"
            onPress={() => router.navigate("/camera")}
          >
            Scan
          </Button> */}
        </View>
        <DrawerItemList {...props} />
        {/* <DrawerItem
          label="Help"
          onPress={() => Linking.openURL("https://mywebsite.com/help")}
        /> */}
      </DrawerContentScrollView>
      <View
        style={{
          padding: 20,
          borderTopWidth: 1,
          borderTopColor: colors.borderColor,
        }}
      >
        <Text style={{ color: colors.text }}>
          {i18n.t("common_info_version", {
            appVersion: Constants.expoConfig?.version,
          })}
        </Text>
        <Text style={{ fontSize: 10, color: colors.textSecondary }}>
          {i18n.t("common_info_copyrght", {
            author: Constants.expoConfig?.owner,
          })}
        </Text>
      </View>
    </View>
  );
}

export default function DrawerLayout() {
  const { i18n } = useTranslation();
  const { colors, theme } = useTheme();
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        swipeEnabled: false,
        swipeEdgeWidth: 10,
        swipeMinDistance: 30,
        headerShown: false,
        drawerType: "front",
        drawerStyle: {
          backgroundColor: colors.background,
          width: "70%",
        },
        drawerLabelStyle: {
          fontSize: 16,
        },
        drawerItemStyle: {
          marginVertical: 4,
        },
        drawerInactiveTintColor: colors.tabIconDefault,
        drawerActiveBackgroundColor: colors.drawerActiveBackground,
        drawerInactiveBackgroundColor: colors.drawerInactiveBackground,
        drawerActiveTintColor: colors.tint,
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: i18n.t("drawer_layout_label_home"),
          title: "Home",
          drawerItemStyle: { display: "none" },
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          drawerLabel: i18n.t("drawer_layout_label_settings"),
          title: "Settings",
        }}
      />
      <Drawer.Screen
        name="about"
        options={{
          drawerLabel: i18n.t("drawer_layout_label_about"),
          title: "About",
        }}
      />
      <Drawer.Screen
        name="help"
        options={{
          drawerLabel: i18n.t("drawer_layout_label_help"),
          title: "Help",
        }}
      />
    </Drawer>
  );
}
