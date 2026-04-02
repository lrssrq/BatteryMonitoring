// import "@dotenvx/dotenvx/config";
import { ExpoConfig } from "expo/config";
import "tsx/cjs";

const buildProfile = process.env.EAS_BUILD_PROFILE ?? "development";
const isProductionBuild = buildProfile === "production";

const config: ExpoConfig = {
  name: "BatteryMonitoring",
  slug: "BatteryMonitoring",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "batterymonitoring",
  userInterfaceStyle: "automatic",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.lrssrq.batterymonitoring",
  },
  android: {
    icon: "./assets/images/icon.png",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "cover",
      backgroundColor: "#25292e",
    },
    permissions: [
      "android.permission.CAMERA",
      "android.permission.RECORD_AUDIO",
      "android.permission.POST_NOTIFICATIONS",
    ],
    package: "com.lrssrq.batterymonitoring",
    predictiveBackGestureEnabled: true,
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    [
      "expo-splash-screen",
      {
        backgroundColor: "#232323",
        image: "./assets/images/splash.png",
        // "dark": {
        //   "image": "./assets/images/splash-icon-dark.png",
        //   "backgroundColor": "#000000"
        // },
        imageWidth: 300,
        mode: "cover",
      },
    ],
    "expo-router",
    [
      "expo-camera",
      {
        cameraPermission: "Allow $(PRODUCT_NAME) to access camera.",
      },
    ],
    [
      "expo-notifications",
      {
        icon: "./assets/images/icon.png",
        color: "#ffffff",
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          usesCleartextTraffic: true,
          // Keep preview stable: disable R8 there, enable only for production.
          enableShrinkResourcesInReleaseBuilds: isProductionBuild,
          enableMinifyInReleaseBuilds: isProductionBuild,
          extraProguardRules: `
-keep class org.pytorch.executorch.** { *; }
-keep class com.swmansion.rnexecutorch.** { *; }
          `,
        },
      },
    ],
    "expo-font",
    "expo-web-browser",
    [
      "react-native-share",
      {
        ios: ["fb", "instagram", "twitter", "tiktoksharesdk"],
        android: [
          "com.facebook.katana",
          "com.instagram.android",
          "com.twitter.android",
          "com.zhiliaoapp.musically",
        ],
        enableBase64ShareAndroid: true,
      },
    ],
    ["expo-asset", {}],
    "expo-secure-store",
    "expo-sharing",
    "expo-localization",
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: "2da6c382-e63b-4af2-82df-f6964eced074",
    },
    mailAddress: "email.401680.xyz",
    api_base_url: process.env.API_BASE_URL,
    mqtt_host: process.env.MQTT_HOST,
    mqtt_port: process.env.MQTT_PORT,
    mqtt_ssl: process.env.MQTT_SSL,
    mqtt_username: process.env.MQTT_USERNAME,
    mqtt_password: process.env.MQTT_PASSWORD,
  },
  runtimeVersion: {
    policy: "appVersion",
  },
  owner: "lrssrq",
};

export default config;
