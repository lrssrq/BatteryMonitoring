import PaperDialog, { PaperDialogRef } from "@/components/PaperDialog";
import Colors from "@/constants/Colors";
import { useTheme } from "@/hooks/useTheme";
import BottomSheet, {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Modal, StyleSheet, View } from "react-native";
import { RectButton, RefreshControl } from "react-native-gesture-handler";
import "react-native-get-random-values";
import {
  Button,
  Chip,
  Divider,
  IconButton,
  Menu,
  Text,
  TextInput,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
// import { v4 as uuidv4, validate as uuidValidate } from "uuid";
import { useDevice } from "@/contexts/DeviceContext";
import { consumeLatestScannedData } from "@/lib/camera/scanResult";
import {
  Device,
  bindDevice,
  renameDevice,
  unbindDevice,
} from "@/lib/device/api";
import { useTranslation } from "react-i18next";
import { isValid, ulid } from "ulid";
export default function DeviceManagement() {
  const { i18n } = useTranslation();
  const { colors } = useTheme();
  const { devices, fetchDevices } = useDevice();
  const [refreshing, setRefreshing] = useState(false);
  const [devicePresentedOnModal, setDevicePresentedOnModal] = useState<Device>({
    deviceSN: ulid(),
    deviceName: "",
    boundAt: new Date(),
  });
  const [visible, setVisible] = useState(false);
  const openMenu = () => {
    setVisible(true);
  };
  const closeMenu = () => {
    setVisible(false);
  };
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDevices(true);
    setRefreshing(false);
  }, []);
  // ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const handleSheetChanges = useCallback((index: number) => {}, []);
  const [deviceSN, setDeviceSN] = useState(ulid());
  const [isLoading, setIsLoading] = useState(false);
  const snapPoints = useMemo(() => ["25%"], []);
  const [modalVisible, setModalVisible] = useState(false);
  const [deviceNameEditable, setDeviceNameEditable] = useState(false);
  const [editedDeviceName, setEditedDeviceName] = useState("");
  const paperDialogRef = useRef<PaperDialogRef>(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const scannedData = consumeLatestScannedData();
        if (scannedData) {
          if (isValid(scannedData)) {
            const bindSuccess = await bindDevice(scannedData);
            if (bindSuccess) {
              fetchDevices(true);
              Toast.show({
                type: "success",
                text1: "Device bound successfully",
                visibilityTime: 2000,
              });
            }
          } else {
            Toast.show({
              type: "error",
              text1: "Invalid Device SN",
              visibilityTime: 2000,
            });
          }
        }
      })();
    }, []),
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View style={styles.header}>
        <IconButton
          icon="close"
          iconColor={colors.icon}
          size={30}
          onPress={() => {
            router.canGoBack() ? router.back() : router.dismissTo("/");
          }}
        />
        <Menu
          // key={visible.toString()}
          visible={visible}
          onDismiss={closeMenu}
          anchor={
            <IconButton
              icon="plus"
              iconColor={colors.icon}
              size={34}
              onPress={openMenu}
            />
          }
          anchorPosition="bottom"
          style={{ maxWidth: 150 }}
          contentStyle={{
            minHeight: 100,
            paddingVertical: 0,
          }}
        >
          <Menu.Item
            leadingIcon="line-scan"
            dense={true}
            onPress={() => {
              closeMenu();
              router.navigate({
                pathname: "/camera",
                params: { from: "device-management", mode: "bind-device" },
              });
            }}
            title={i18n.t("device_button_scan")}
            style={{ minHeight: 50 }}
            titleStyle={{ fontSize: 18 }}
            // background={{ borderless: false, foreground: true }}
          />

          <Divider />
          <Menu.Item
            leadingIcon="note-edit-outline"
            dense={true}
            onPress={() => {
              closeMenu();
              bottomSheetModalRef.current?.present();
            }}
            title={i18n.t("device_button_manual")}
            style={{ minHeight: 50 }}
            titleStyle={{ fontSize: 18 }}
          />
        </Menu>
      </View>

      <View style={styles.content}>
        {devices.length === 0 ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text>{i18n.t("common_list_no_devices")}</Text>
          </View>
        ) : (
          <FlashList
            data={devices}
            // ItemSeparatorComponent={Divider}
            keyExtractor={(item, index) => item.deviceSN}
            // onScrollBeginDrag={handleScroll}
            // style={{ margin: 10 }}
            contentContainerStyle={styles.flashListContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={true}
            bounces={true}
            alwaysBounceVertical={true}
            renderItem={({ item }) => (
              <DeviceRow
                item={item}
                onPress={() => {
                  bottomSheetModalRef.current?.dismiss();
                  setDevicePresentedOnModal(item);
                  setModalVisible(true);
                }}
                i18n={i18n}
                colors={colors}
              />
            )}
          />
        )}
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          // Alert.alert("Modal has been closed.");
          setDeviceNameEditable(false);
          setEditedDeviceName("");
          setModalVisible(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <IconButton
              icon="close"
              mode="outlined"
              size={20}
              iconColor={colors.icon}
              onPress={() => {
                setDeviceNameEditable(false);
                setEditedDeviceName("");
                setModalVisible(false);
              }}
              style={{ position: "absolute", top: 0, right: 0 }}
            />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {!deviceNameEditable ? (
                <>
                  <Chip style={styles.modalText}>
                    {i18n.t("device_modal_name")}{" "}
                    {devicePresentedOnModal.deviceName}
                  </Chip>
                  <IconButton
                    icon="circle-edit-outline"
                    size={20}
                    iconColor={colors.icon}
                    style={{ right: 0 }}
                    onPress={() => {
                      setEditedDeviceName(devicePresentedOnModal.deviceName);
                      setDeviceNameEditable(true);
                    }}
                  />
                </>
              ) : (
                <TextInput
                  // label="Device Name"
                  mode="outlined"
                  placeholder={i18n.t("device_input_name")}
                  maxLength={16}
                  style={[
                    styles.textInput,
                    {
                      flex: 0,
                      minWidth: "80%",
                      paddingHorizontal: 5,
                      minHeight: 40,
                    },
                  ]}
                  value={editedDeviceName}
                  onChangeText={setEditedDeviceName}
                  // autoCapitalize="words"
                />
              )}
            </View>

            <Chip style={styles.modalText}>
              {i18n.t("device_info_id")}
              {" " + devicePresentedOnModal.deviceSN}
            </Chip>
            <Chip style={styles.modalText} ellipsizeMode="middle">
              {i18n.t("device_info_bound_at")}
              {" " +
                new Date(devicePresentedOnModal.boundAt).toLocaleDateString()}
            </Chip>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                width: "100%",
              }}
            >
              <Button
                mode="contained"
                onPress={() => {
                  setModalVisible(false);
                  setDeviceNameEditable(false);
                  setEditedDeviceName("");
                  paperDialogRef.current?.show();
                }}
                style={styles.modalUnbindButton}
              >
                {i18n.t("device_button_unbind")}
              </Button>
              <Button
                mode="contained"
                onPress={async () => {
                  setDevicePresentedOnModal({
                    ...devicePresentedOnModal,
                    deviceName: editedDeviceName,
                  });
                  setDeviceNameEditable(false);
                  const renameSuccess = await renameDevice(
                    devicePresentedOnModal.deviceSN,
                    editedDeviceName,
                  );
                  await fetchDevices(true);
                  if (renameSuccess) {
                    setEditedDeviceName("");
                    setModalVisible(false);
                    Toast.show({
                      type: "success",
                      text1: "Device name updated",
                      visibilityTime: 2000,
                    });
                  }
                }}
                style={styles.modalSaveButton}
                disabled={!deviceNameEditable}
              >
                {i18n.t("common_button_save")}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
      <BottomSheetModalProvider>
        {/* <Button onPress={handlePresentModalPress} mode="contained">
            Present Modal
          </Button> */}
        <BottomSheetModal
          enablePanDownToClose={false}
          snapPoints={snapPoints}
          // keyboardBehavior="fillParent"
          enableDynamicSizing={false}
          keyboardBlurBehavior="restore"
          ref={bottomSheetModalRef}
          onChange={handleSheetChanges}
          detached={true}
          bottomInset={50}
          // backgroundStyle={{ backgroundColor: MD3Colors.primary70 }}
          style={{ marginHorizontal: "10%" }}
        >
          <BottomSheetView style={styles.bottomSheetView}>
            <View style={styles.bottomSheetViewView}>
              <BottomSheetTextInput
                placeholder={i18n.t("device_input_id")}
                maxLength={50}
                style={styles.textInput}
                // contentStyle={styles.inputContent}
                value={deviceSN}
                onChangeText={setDeviceSN}
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
            <View
              style={[
                {
                  flex: 1,
                  marginTop: 10,
                  width: "95%",
                  justifyContent: "flex-end",
                  flexDirection: "row",
                },
              ]}
            >
              <Button
                mode="contained"
                onPress={() => {
                  bottomSheetModalRef.current?.dismiss();
                  setDeviceSN("");
                }}
                style={{ marginRight: 10 }}
              >
                {i18n.t("common_button_cancel")}
              </Button>
              <Button
                mode="contained"
                onPress={async () => {
                  setIsLoading(true);
                  if (deviceSN.length === 0) {
                    Toast.show({
                      type: "error",
                      text1: "Device ID cannot be empty",
                      visibilityTime: 2000,
                    });
                    setIsLoading(false);
                    return;
                  } else if (isValid(deviceSN)) {
                    const bindSuccess = await bindDevice(deviceSN);
                    if (bindSuccess) {
                      await fetchDevices(true);
                      Toast.show({
                        type: "success",
                        text1: "Device bound successfully",
                        visibilityTime: 2000,
                      });
                      bottomSheetModalRef.current?.dismiss();
                    } else {
                      Toast.show({
                        type: "error",
                        text1: "Binding failed",
                        visibilityTime: 2000,
                      });
                    }
                  } else {
                    Toast.show({
                      type: "error",
                      text1: "Device not found",
                      visibilityTime: 2000,
                    });
                  }
                  bottomSheetModalRef.current?.dismiss();
                  setIsLoading(false);
                  setDeviceSN("");
                }}
                style={{}}
              >
                {i18n.t("common_button_confirm")}
              </Button>
            </View>
          </BottomSheetView>
        </BottomSheetModal>
      </BottomSheetModalProvider>
      <PaperDialog
        ref={paperDialogRef}
        title={i18n.t("common_dialog_title")}
        content={i18n.t("device_dialog_unbind")}
        confirmText={i18n.t("common_button_confirm")}
        cancelText={i18n.t("common_button_cancel")}
        onConfirm={async () => {
          const unbindSuccess = await unbindDevice(
            devicePresentedOnModal.deviceSN,
          );
          if (unbindSuccess) {
            await fetchDevices(true);
            paperDialogRef.current?.hide();
          }
        }}
        onCancel={() => paperDialogRef.current?.hide()}
        mode="double"
      />
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
    justifyContent: "space-between",
    width: "100%",
    height: 50,
    paddingHorizontal: 8,
  },
  content: {
    flex: 1,
    // height: "100%",
    // alignItems: "center",
    // justifyContent: "center",
  },
  rectButton: {
    height: 80,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderColor: "lightgray",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginVertical: 6,
    flexDirection: "column",
  },
  flashListContainer: {
    // height: "60%",
    paddingTop: 10,
    width: "90%",
    alignSelf: "center",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    margin: 20,
    backgroundColor: Colors.light.background,
    borderRadius: 20,
    padding: 35,
    alignItems: "flex-start",
    minWidth: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    alignSelf: "flex-start",
    maxWidth: "80%",
    marginVertical: 5,
    paddingVertical: 5,
    textAlign: "center",
  },
  modalSaveButton: {
    marginTop: 15,
    marginHorizontal: 10,
  },
  modalUnbindButton: {
    marginTop: 15,
  },
  bottomSheetView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: MD3Colors.primary70,
    paddingTop: 20,
  },
  textInput: {
    flex: 1,
    maxHeight: 50,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "lightgray",
    borderRadius: 8,
    paddingHorizontal: 12,
    // backgroundColor: Colors.light.background,
  },
  bottomSheetViewView: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: "10%",
    // marginTop: 20,
  },
});

const DeviceRow = ({
  item,
  onActiveStateChange,
  onPress = () => {},
  onLongPress = () => {},
  i18n,
  colors,
}: {
  item: Device;
  onActiveStateChange?: (active: boolean) => void;
  onPress?: () => void;
  onLongPress?: () => void;
  i18n: any;
  colors: ReturnType<typeof useTheme>["colors"];
}) => {
  return (
    <RectButton
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.rectButton}
    >
      <Text
        style={{ flex: 1, fontSize: 14, paddingTop: 10, color: colors.text }}
      >
        {item.deviceName || "Unnamed Device"}
      </Text>
      <Text style={{ fontSize: 12, color: colors.text, paddingBottom: 10 }}>
        {i18n.t("device_info_sn")} {item.deviceSN}
      </Text>
      <Text style={{ fontSize: 12, color: colors.text }}>
        {i18n.t("device_info_bound_at")}{" "}
        {new Date(item.boundAt).toLocaleString()}
      </Text>
    </RectButton>
  );
};
