import WebPageShell from "@/components/web/WebPageShell";
import { setLatestScannedData } from "@/lib/camera/scanResult";
import {
  Button,
  Card,
  Container,
  Flex,
  Heading,
  Text,
} from "@radix-ui/themes";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image as RNImage, useWindowDimensions } from "react-native";
import Toast from "react-native-toast-message";

async function scanQRFromImage(file: File): Promise<string | null> {
  try {
    const jsQR = (await import("jsqr")).default;

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            resolve(null);
            return;
          }

          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          resolve(code?.data ?? null);
        };

        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  } catch (error) {
    return null;
  }
}

export default function CameraWeb() {
  const { i18n } = useTranslation();
  const { width } = useWindowDimensions();
  const desktop = width >= 1020;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsScanning(true);

    const reader = new FileReader();
    reader.onload = (event) =>
      setPreviewImage((event.target?.result as string) || null);
    reader.readAsDataURL(file);

    const qrData = await scanQRFromImage(file);

    if (qrData) {
      setLatestScannedData(qrData);
      Toast.show({
        type: "success",
        text1: i18n.t("device_button_scan"),
        text2: qrData,
      });
      setTimeout(() => router.dismissTo("/deviceManagement"), 600);
    } else {
      Toast.show({
        type: "error",
        text1: i18n.t("camera_scan_not_found"),
      });
    }

    setIsScanning(false);
  };

  return (
    <WebPageShell showBackButton backHref="/deviceManagement">
      <Container p="4">
        <Flex
          direction={desktop ? "row" : "column"}
          gap="4"
          align="stretch"
          style={{ maxWidth: "1280px", width: "100%", margin: "0 auto" }}
        >
          {/* Upload Section */}
          <Card variant="surface" style={{ flex: 1 }}>
            <Heading size="6" mb="3">
              {i18n.t("device_button_scan")}
            </Heading>
            <Text color="gray" size="2" mb="3">
              {i18n.t("camera_upload_tip")}
            </Text>

            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanning}
              size="3"
            >
              {isScanning
                ? i18n.t("camera_scanning")
                : i18n.t("camera_choose_image")}
            </Button>

          </Card>

          {/* Preview Section */}
          <Card
            variant="surface"
            style={{
              flex: 1.2,
            }}
          >
            <Flex align="center" justify="between" mb="3">
              <Heading size="6">
                {i18n.t("camera_preview")}
              </Heading>
              {previewImage && (
                <Button
                  variant="outline"
                  size="2"
                  onClick={() => setPreviewImage(null)}
                  style={{ cursor: "pointer" }}
                >
                  {i18n.t("common_button_clear")}
                </Button>
              )}
            </Flex>
            {previewImage ? (
              <RNImage
                source={{ uri: previewImage }}
                resizeMode="contain"
                style={{
                  width: "100%",
                  height: 440,
                  borderRadius: 12,
                  backgroundColor: "var(--color-panel)",
                }}
              />
            ) : (
              <Flex
                align="center"
                justify="center"
                style={{
                  height: 440,
                  borderRadius: 12,
                  backgroundColor: "var(--gray-3)",
                }}
              >
                <Text color="gray" size="3">
                  {i18n.t("camera_no_image_selected")}
                </Text>
              </Flex>
            )}
          </Card>
        </Flex>
      </Container>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        style={{ display: "none" }}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleFileSelect(file);
          event.currentTarget.value = "";
        }}
      />
    </WebPageShell>
  );
}
