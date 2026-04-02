import WebAuthGuard from "@/components/web/WebAuthGuard";
import WebPageShell from "@/components/web/WebPageShell";
import { useDevice } from "@/contexts/DeviceContext";
import { useSession } from "@/contexts/SessionContext";
import {
  bindDevice,
  Device,
  renameDevice,
  unbindDevice,
} from "@/lib/device/api";
import {
  Box,
  Button,
  Card,
  Dialog,
  DropdownMenu,
  Flex,
  Heading,
  Text,
  TextField,
} from "@radix-ui/themes";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useWindowDimensions } from "react-native";
import Toast from "react-native-toast-message";
import { isValid, ulid } from "ulid";

export default function DeviceManagementWeb() {
  const { i18n } = useTranslation();
  const { data: session, isPending: isSessionPending } = useSession();
  const { devices, fetchDevices } = useDevice();
  const { width } = useWindowDimensions();
  const [deviceSN, setDeviceSN] = useState(ulid());
  const [pending, setPending] = useState(false);
  const [editingSn, setEditingSn] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [showManualForm, setShowManualForm] = useState(false);
  const [unbindTarget, setUnbindTarget] = useState<Device | null>(null);
  const [openMenuSn, setOpenMenuSn] = useState<string | null>(null);
  const menuTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    setIsTouch(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const enterMenu = useCallback((sn: string) => {
    if (isTouch) return;
    clearTimeout(menuTimer.current);
    setOpenMenuSn(sn);
  }, [isTouch]);
  const leaveMenu = useCallback(() => {
    if (isTouch) return;
    menuTimer.current = setTimeout(() => setOpenMenuSn(null), 200);
  }, [isTouch]);

  useEffect(() => {
    if (isSessionPending) return;

    if (!session?.user) {
      Toast.show({
        type: "info",
        text1: i18n.t("me_dialog_must_login"),
      });
      router.replace("/");
    }
  }, [isSessionPending, session, i18n]);

  if (isSessionPending || !session?.user) {
    return null;
  }

  const topInTwoColumns = width >= 1100;
  const actionInline = width >= 1280;
  const listColumns = width >= 1520 ? 3 : width >= 980 ? 2 : 1;

  const bindManual = async () => {
    if (!deviceSN || !isValid(deviceSN)) {
      Toast.show({
        type: "error",
        text1: i18n.t("device_error_invalid_sn"),
      });
      return;
    }

    setPending(true);
    const ok = await bindDevice(deviceSN);
    await fetchDevices(true);
    setPending(false);

    if (ok) {
      Toast.show({
        type: "success",
        text1: i18n.t("device_bound_success"),
      });
      setDeviceSN(ulid());
      setShowManualForm(false);
    }
  };

  const saveRename = async (item: Device) => {
    if (editingName === item.deviceName || editingName.trim() === "") {
      setEditingSn(null);
      setEditingName("");
      return;
    }

    setPending(true);
    const ok = await renameDevice(item.deviceSN, editingName);
    await fetchDevices(true);
    setPending(false);

    if (ok) {
      Toast.show({
        type: "success",
        text1: i18n.t("device_renamed_success"),
      });
      setEditingSn(null);
      setEditingName("");
    }
  };

  const remove = async (item: Device) => {
    setPending(true);
    const ok = await unbindDevice(item.deviceSN);
    await fetchDevices(true);
    setPending(false);

    if (ok) {
      Toast.show({
        type: "success",
        text1: i18n.t("device_unbound_success"),
      });
    }
  };

  const handleConfirmUnbind = async () => {
    if (!unbindTarget) return;
    await remove(unbindTarget);
    setUnbindTarget(null);
  };

  return (
    <WebAuthGuard>
    <WebPageShell showBackButton backHref="/">
      <Dialog.Root open={!!unbindTarget} onOpenChange={(open) => !open && setUnbindTarget(null)}>
        {unbindTarget ? (
          <Dialog.Content style={{ width: "min(92vw, 420px)" }}>
                <Dialog.Title style={{ margin: 0, fontSize: 20, color: "var(--text-1)" }}>
                  {i18n.t("common_dialog_title")}
                </Dialog.Title>
                <Dialog.Description style={{ margin: "8px 0 0 0", color: "var(--gray-11)" }}>
                  {i18n.t("device_dialog_unbind")}
                </Dialog.Description>
                <Flex justify="end" gap="2" mt="3">
                  <Button variant="soft" color="gray" onClick={() => setUnbindTarget(null)}>
                    {i18n.t("common_button_cancel")}
                  </Button>
                  <Button color="red" onClick={handleConfirmUnbind}>
                    {i18n.t("common_button_confirm")}
                  </Button>
                </Flex>
          </Dialog.Content>
        ) : null}
      </Dialog.Root>

      <Box style={{ padding: 10 }}>
        <Flex
          style={{
            flexDirection: topInTwoColumns ? "row" : "column",
            marginBottom: 20,
            gap: 16,
          }}
        >
          <Card
            variant="surface"
            style={{
              flex: 1,
              padding: 16,
            }}
          >
            <Heading size="5" mb="2">{i18n.t("device_management_title")}</Heading>
            <Text color="gray" mb="3">{i18n.t("device_choose_binding")}</Text>

            <Flex gap="2" wrap="wrap">
              <Button disabled={pending} onClick={() => router.navigate("/camera")}>
                {i18n.t("device_open_camera_scan")}
              </Button>
              <Button
                variant="soft"
                disabled={pending}
                onClick={() => setShowManualForm((prev) => !prev)}
              >
                {i18n.t("device_manual_input_panel")}
              </Button>
            </Flex>

            {showManualForm ? (
              <Box style={{ marginTop: 12 }}>
                <TextField.Root
                  value={deviceSN}
                  onChange={(event) => setDeviceSN(event.target.value.trim())}
                  disabled={pending}
                  placeholder={i18n.t("device_input_id")}
                  style={{ marginBottom: 10 }}
                />
                <Flex justify="end" gap="2">
                  <Button
                    variant="soft"
                    color="gray"
                    onClick={() => setShowManualForm(false)}
                    disabled={pending}
                  >
                    {i18n.t("common_button_cancel")}
                  </Button>
                  <Button
                    onClick={bindManual}
                    disabled={pending}
                  >
                    {i18n.t("common_button_confirm")}
                  </Button>
                </Flex>
              </Box>
            ) : null}
          </Card>

          <Card
            variant="surface"
            style={{
              flex: 1,
              padding: 16,
            }}
          >
            <Flex
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Heading size="5">{i18n.t("device_overview")}</Heading>
              <Button
                variant="soft"
                onClick={() => fetchDevices(true)}
                disabled={pending}
              >
                {i18n.t("analysis_button_refresh")}
              </Button>
            </Flex>
            <Box style={{ marginBottom: 4 }}>
              <Flex
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingTop: 6,
                  paddingBottom: 6,
                }}
              >
                <Text>{i18n.t("device_total_devices")}</Text>
                <Text weight="bold">{devices.length}</Text>
              </Flex>
              <Flex
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingTop: 6,
                  paddingBottom: 6,
                }}
              >
                <Text>{i18n.t("device_pending")}</Text>
                <Text weight="bold">{pending ? "Yes" : "No"}</Text>
              </Flex>
            </Box>
          </Card>
        </Flex>

        {devices.length === 0 ? (
          <Card>
            <Text color="gray">{i18n.t("common_list_no_devices")}</Text>
          </Card>
        ) : (
          <Box>
            <Heading size="5" mb="3">{i18n.t("device_list")}</Heading>
            <Flex
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginLeft: -6,
                marginRight: -6,
              }}
            >
              {devices.map((item) => (
                <Box
                  key={item.deviceSN}
                  style={{
                    width: `${100 / listColumns}%`,
                    paddingLeft: 6,
                    paddingRight: 6,
                    marginBottom: 12,
                  }}
                >
                  <Card
                    style={{
                      height: "100%",
                      padding: 14,
                    }}
                  >
                    <Flex
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 10,
                        marginBottom: 10,
                      }}
                    >
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        {editingSn === item.deviceSN ? (
                          <TextField.Root
                            value={editingName}
                            onChange={(event) => setEditingName(event.target.value)}
                          />
                        ) : (
                          <Heading
                            size="4"
                            style={{
                              margin: 0,
                              marginBottom: 8,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.deviceName || i18n.t("home_modal_unnamed_device")}
                          </Heading>
                        )}
                      </Box>

                      {editingSn === item.deviceSN ? (
                        <Flex
                          style={{
                            flexDirection: actionInline ? "row" : "column",
                            gap: 8,
                          }}
                        >
                          <Button
                            onClick={() => saveRename(item)}
                            disabled={
                              pending ||
                              editingName === item.deviceName ||
                              editingName.trim() === ""
                            }
                          >
                            {i18n.t("common_button_save")}
                          </Button>
                          <Button
                            variant="soft"
                            color="gray"
                            onClick={() => {
                              setEditingSn(null);
                              setEditingName("");
                            }}
                            disabled={pending}
                          >
                            {i18n.t("common_button_cancel")}
                          </Button>
                        </Flex>
                      ) : (
                        <DropdownMenu.Root
                          open={openMenuSn === item.deviceSN}
                          onOpenChange={(open) => setOpenMenuSn(open ? item.deviceSN : null)}
                          modal={false}
                        >
                          <DropdownMenu.Trigger disabled={pending}>
                            <Button
                              variant="soft"
                              color="gray"
                              disabled={pending}
                              onPointerEnter={() => !pending && enterMenu(item.deviceSN)}
                              onPointerLeave={leaveMenu}
                              style={{ cursor: pending ? "default" : "pointer" }}
                            >...</Button>
                          </DropdownMenu.Trigger>
                            <DropdownMenu.Content
                              sideOffset={8}
                              align="end"
                              variant="soft"
                              onPointerEnter={() => enterMenu(item.deviceSN)}
                              onPointerLeave={leaveMenu}
                              style={{ minWidth: 180 }}
                            >
                              <DropdownMenu.Item
                                  onClick={() => {
                                    setEditingSn(item.deviceSN);
                                    setEditingName(item.deviceName || "");
                                  }}
                                >
                                <svg width="14" height="14" viewBox="0 0 15 15" fill="none" style={{ marginRight: 6 }}>
                                  <path d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.491 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50905 13.0401 2.69697 12.9596L6.10847 11.4975C6.2254 11.4474 6.3317 11.3754 6.42166 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                                </svg>
                                {i18n.t("device_button_rename")}
                              </DropdownMenu.Item>
                              <DropdownMenu.Separator />
                              <DropdownMenu.Item
                                  onClick={() => setUnbindTarget(item)}
                                  disabled={pending}
                                  color="red"
                                >
                                <svg width="14" height="14" viewBox="0 0 15 15" fill="none" style={{ marginRight: 6 }}>
                                  <path d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H5H10H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H11V12C11 12.5523 10.5523 13 10 13H5C4.44772 13 4 12.5523 4 12V4H3.5C3.22386 4 3 3.77614 3 3.5ZM5 4H10V12H5V4Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                                </svg>
                                {i18n.t("device_button_unbind")}
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                        </DropdownMenu.Root>
                      )}
                    </Flex>
                    <Text
                      color="gray"
                      style={{
                        margin: 0,
                        marginBottom: 10,
                        lineHeight: 1.5,
                        wordBreak: "break-all",
                        fontFamily: "monospace",
                        fontSize: item.deviceSN.length > 30 ? 13 : item.deviceSN.length > 20 ? 14 : 15,
                      }}
                    >
                      {item.deviceSN}
                    </Text>
                    <Box style={{ borderTop: "1px solid var(--gray-a4)", paddingTop: 10 }}>
                      <Text
                        size="2"
                        color="gray"
                        style={{
                          margin: 0,
                          lineHeight: 1.5,
                        }}
                      >
                        {i18n.t("device_info_bound_at")} {new Date(item.boundAt).toLocaleString(i18n.language)}
                      </Text>
                    </Box>
                  </Card>
                </Box>
              ))}
            </Flex>
          </Box>
        )}
      </Box>
    </WebPageShell>
    </WebAuthGuard>
  );
}
