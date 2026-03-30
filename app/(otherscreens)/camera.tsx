import { setLatestScannedData } from "@/lib/camera/scanResult";
import Slider from "@react-native-community/slider";
import {
  BarcodeScanningResult,
  Camera,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Icon, IconButton, MD3Colors } from "react-native-paper";
import Toast from "react-native-toast-message";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen");
console.log("Screen Dimensions:", SCREEN_WIDTH, SCREEN_HEIGHT);
const SCAN_AREA_SIZE = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) * 0.6; // scanned area is 60% of the smaller screen dimension

function handleScanResult(data: string) {
  setLatestScannedData(data);
  router.back();
}

async function scanFromURL(uri: string) {
  try {
    const result = await Camera.scanFromURLAsync(uri, ["qr"]);
    if (result && result[0]?.data) {
      Toast.show({
        type: "info",
        text1: `Scanned from URL: ${result[0].data}`,
        visibilityTime: 3000,
      });
      handleScanResult(result[0].data);
    } else {
      Toast.show({
        type: "error",
        text1: "No QR code found in the image",
        visibilityTime: 3000,
      });
    }
  } catch (error) {
    console.error("Failed to scan from URL:", error);
    Toast.show({
      type: "error",
      text1: "Scan failed",
      text2: "Unable to scan QR code from URL",
      visibilityTime: 3000,
    });
  }
}

async function openImagePickerAsync() {
  const permissionResult =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permissionResult.granted) {
    console.log(
      "Permission required",
      "Permission to access the media library is required.",
    );
    return;
  }

  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: false,
    allowsMultipleSelection: false,
    aspect: [4, 3],
    quality: 1,
  });

  console.log(result);

  if (!result.canceled) {
    scanFromURL(result.assets[0].uri);
  }
}

export default function Screen() {
  const { i18n } = useTranslation();
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("light");
      return () => setStatusBarStyle("dark");
    }, []),
  );

  const [permission, requestPermission] = useCameraPermissions();
  const [torchOn, setTorchOn] = useState(false);
  const [zoomValue, setZoomValue] = useState(0);
  const [facingMode, setFacingMode] = useState<"front" | "back">("back");
  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          {i18n.t("camera_info_permission")}
        </Text>
        <Button
          onPress={requestPermission}
          title={i18n.t("camera_button_grant")}
        />
      </View>
    );
  }

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    // alert(
    //   `Bar code with type ${result.type} and data ${result.data} has been scanned!`,
    // );
    handleScanResult(result.data);
  };

  return (
    <View style={styles.container}>
      <View style={styles.torchButtonWrapper}>
        <IconButton
          icon={torchOn ? "flashlight" : "flashlight-off"}
          iconColor="#fff"
          size={24}
          onPress={() => setTorchOn(!torchOn)}
        />
      </View>
      <View style={styles.imageButtonWrapper}>
        <IconButton
          icon="image"
          iconColor="#fff"
          size={24}
          onPress={openImagePickerAsync}
        />
      </View>
      <View
        style={{
          position: "absolute",
          top: (StatusBar.currentHeight || 0) + 20,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          // paddingHorizontal: 10  ,
          zIndex: 1,
        }}
      >
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor="#fff"
          animated={true}
          onPress={() => router.back()}
        />
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Icon source="magnify-minus-outline" size={30} color="#fff" />
          <Slider
            style={{ width: 250, height: 40, marginHorizontal: 10 }}
            tapToSeek
            step={0.01}
            value={zoomValue}
            onValueChange={(value: number) => setZoomValue(value)}
            minimumValue={0}
            maximumValue={1}
            thumbTintColor="#fff"
            minimumTrackTintColor={"#fff"}
            maximumTrackTintColor={"#d2cece"}
          />
          <Icon source="magnify-plus-outline" size={30} color="#fff" />
        </View>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.flipButtonWrapper}>
        <IconButton
          icon="camera-flip-outline"
          iconColor="#fff"
          size={24}
          onPress={() =>
            setFacingMode(facingMode === "back" ? "front" : "back")
          }
        />
      </View>
      <CameraView
        autofocus="on"
        zoom={zoomValue}
        onBarcodeScanned={handleBarcodeScanned}
        enableTorch={torchOn}
        facing={facingMode}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        style={StyleSheet.absoluteFillObject}
      />
      <View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          height: (SCREEN_HEIGHT - SCAN_AREA_SIZE) / 2,
          width: SCREEN_WIDTH,
          backgroundColor: "rgba(0,0,0,0.7)",
          // zIndex: 1,
        }}
      />
      <View
        style={{
          position: "absolute",
          top: (SCREEN_HEIGHT - SCAN_AREA_SIZE) / 2,
          left: 0,
          height: SCAN_AREA_SIZE,
          width: (SCREEN_WIDTH - SCAN_AREA_SIZE) / 2,
          backgroundColor: "rgba(0,0,0,0.7)",
          // zIndex: 1,
        }}
      />
      <View
        style={{
          position: "absolute",
          top: (SCREEN_HEIGHT - SCAN_AREA_SIZE) / 2,
          right: 0,
          height: SCAN_AREA_SIZE,
          width: (SCREEN_WIDTH - SCAN_AREA_SIZE) / 2,
          backgroundColor: "rgba(0,0,0,0.7)",
          // zIndex: 1,
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: 0,
          height: (SCREEN_HEIGHT - SCAN_AREA_SIZE) / 2,
          width: SCREEN_WIDTH,
          backgroundColor: "rgba(0,0,0,0.7)",
          // zIndex: 1,
        }}
      />
      <View
        style={{
          position: "absolute",
          top: (SCREEN_HEIGHT - SCAN_AREA_SIZE) / 2,
          left: (SCREEN_WIDTH - SCAN_AREA_SIZE) / 2,
          width: SCAN_AREA_SIZE,
          height: SCAN_AREA_SIZE,
          borderWidth: 2,
          borderColor: "#00FF00",
          backgroundColor: "transparent",
          zIndex: 2,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: MD3Colors.primary60,
  },
  torchButtonWrapper: {
    position: "absolute",
    bottom: 50,
    left: 20,
    zIndex: 1,
    width: 56,
    height: 56,
    borderRadius: 28, // circle
    backgroundColor: "rgba(0, 0, 0, 0.5)", // semi-transparent background
    justifyContent: "center",
    alignItems: "center",
    // optional: add border to make it more visible
    // borderWidth: 2,
    // borderColor: "rgba(255, 255, 255, 0.3)",
    // optional: add shadow for iOS
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
    // optional: add elevation for Android
    // elevation: 5,
  },
  imageButtonWrapper: {
    position: "absolute",
    bottom: 50,
    right: 20,
    zIndex: 1,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  flipButtonWrapper: {
    position: "absolute",
    right: 10,
    zIndex: 1,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});
