import WebAuthGuard from "@/components/web/WebAuthGuard";
import WebPageShell from "@/components/web/WebPageShell";
import { useDevice } from "@/contexts/DeviceContext";
import { loadBatteryData } from "@/lib/battery/api";
import {
  Box,
  Button,
  Card,
  Container,
  DropdownMenu,
  Flex,
  Heading,
  Popover,
  ScrollArea,
  Table,
  Text
} from "@radix-ui/themes";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useWindowDimensions } from "react-native";
import Toast from "react-native-toast-message";
import { useReactToPrint } from "react-to-print";
import * as XLSX from "xlsx";
import * as xml from "xml-js";

interface DataHistoryRecord {
  id: string;
  time: string;
  battery: number;
}

const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
};

const downloadFile = (filename: string, content: string | ArrayBuffer) => {
  const blob = new Blob([content instanceof ArrayBuffer ? content : content], {
    type: filename.endsWith(".xlsx")
      ? "application/vnd.ms-excel"
      : filename.endsWith(".json")
        ? "application/json"
        : filename.endsWith(".xml")
          ? "text/xml"
          : filename.endsWith(".html")
            ? "text/html"
            : filename.endsWith(".csv")
              ? "text/csv"
              : "application/octet-stream",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default function DataHistoryWeb() {
  const { i18n } = useTranslation();
  const { devices, selectedDevice, setSelectedDevice } = useDevice();
  const { width } = useWindowDimensions();
  const desktop = width >= 1160;
  const [rows, setRows] = useState<DataHistoryRecord[]>([]);
  const [exportOpen, setExportOpen] = useState(false);
  const exportTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [isDeviceDialogVisible, setIsDeviceDialogVisible] = useState(false);
  const deviceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    setIsTouch(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const enterExport = useCallback(() => {
    if (isTouch) return;
    clearTimeout(exportTimer.current);
    setExportOpen(true);
  }, [isTouch]);
  const leaveExport = useCallback(() => {
    if (isTouch) return;
    exportTimer.current = setTimeout(() => setExportOpen(false), 200);
  }, [isTouch]);

  const enterDevice = useCallback(() => {
    if (isTouch) return;
    clearTimeout(deviceTimer.current);
    setIsDeviceDialogVisible(true);
  }, [isTouch]);
  const leaveDevice = useCallback(() => {
    if (isTouch) return;
    deviceTimer.current = setTimeout(() => setIsDeviceDialogVisible(false), 200);
  }, [isTouch]);

  const timeZoneString = useMemo(() => {
    const offset = new Date().getTimezoneOffset();
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    const sign = offset > 0 ? "-" : "+";
    return `GMT${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    if (!selectedDevice?.deviceSN) {
      setRows([]);
      return;
    }

    loadBatteryData(selectedDevice.deviceSN).then((data) => {
      if (!data) {
        setRows([]);
        return;
      }

      setRows(
        data.map((record) => ({
          id: new Date(record.recordedAt).getTime().toString(),
          time: formatTime(record.recordedAt),
          battery: record.batteryLevel,
        })),
      );
    });
  }, [selectedDevice]);

  const generateHTMLContent = () => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Battery Data History</title>
  <style>
  body { font-family: Arial, sans-serif; margin: 20px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
    tr:nth-child(even) { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <h2>Battery Data History</h2>
  <p>Generated: ${new Date().toLocaleString()}</p>
  <table>
    <thead>
      <tr><th>ID</th><th>Time (${timeZoneString})</th><th>Battery %</th></tr>
    </thead>
    <tbody>
      ${rows.map((item) => `<tr><td>${item.id}</td><td>${item.time}</td><td>${item.battery}%</td></tr>`).join("")}
    </tbody>
  </table>
</body>
</html>`;
  };

  const getExportContent = (type: string) => {
    if (type === "csv") {
      return rows.reduce(
        (csv, item) => csv + `${item.id},${item.time},${item.battery}\n`,
        `ID,Time(${timeZoneString}),Battery %\n`,
      );
    }

    if (type === "excel") {
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "dataHistory");
      return XLSX.writeXLSX(workbook, { type: "buffer", bookType: "xlsx" });
    }

    if (type === "json") return JSON.stringify(rows, null, 2);
    if (type === "xml") {
      return xml.js2xml(
        { dataHistory: { record: rows } },
        { compact: true, ignoreDeclaration: false },
      );
    }

    if (type === "html") return generateHTMLContent();

    return "";
  };

  const exportData = (type: string) => {
    try {
      const ext = type === "excel" ? "xlsx" : type;
      const content = getExportContent(type);
      const filename = `battery_history_${new Date().toISOString().split("T")[0]}.${ext}`;
      downloadFile(filename, content);
      Toast.show({
        type: "success",
        text1: i18n.t("history_button_export"),
        text2: filename,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: i18n.t("common_dialog_error"),
      });
    }
  };

  const printContentRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const handlePrint = useReactToPrint({
    contentRef: printContentRef,
    documentTitle: `battery_history_${new Date().toISOString().split("T")[0]}`,
    pageStyle: `
      body { font-family: Arial, sans-serif; margin: 20px; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
      th { background-color: #4CAF50; color: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      tr:nth-child(even) { background-color: #f2f2f2; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    `,
    onAfterPrint: () => setIsPrinting(false),
  });

  useEffect(() => {
    if (isPrinting && printContentRef.current) {
      handlePrint();
    }
  }, [isPrinting]);

  return (
    <WebAuthGuard>
    <WebPageShell showBackButton backHref="/">
      <Container p="4">
        <Flex direction="column" gap="4">
          {/* Header & Export Controls */}
          <Card variant="surface">
            <Flex
              direction={desktop ? "row" : "column"}
              justify="between"
              align={desktop ? "center" : "stretch"}
              gap="3"
            >
              <Flex direction="column" gap="1">
                <Heading size="6">
                  {i18n.t("history_header_title")}
                </Heading>
                <Text color="gray" size="2">
                  {i18n.t("device_info_id")} {selectedDevice?.deviceName || "Unknown"} |
                  {` Timezone: ${timeZoneString}`}
                </Text>
              </Flex>
              <Flex gap="2" align="center" wrap="wrap">
                <Popover.Root open={isDeviceDialogVisible} onOpenChange={setIsDeviceDialogVisible}>
                  <Popover.Trigger>
                    <Button
                      size="2"
                      variant="soft"
                      onPointerEnter={enterDevice}
                      onPointerLeave={leaveDevice}
                      style={{ cursor: "pointer" }}
                    >
                      {selectedDevice?.deviceName || i18n.t("home_button_select_device")}
                    </Button>
                  </Popover.Trigger>
                  <Popover.Content
                    sideOffset={8}
                    align="end"
                    onPointerEnter={enterDevice}
                    onPointerLeave={leaveDevice}
                    style={{
                      width: 320,
                      padding: 0,
                      overflow: "hidden",
                      borderRadius: "var(--radius-3)",
                    }}
                  >
                    <Box
                      style={{
                        background: "linear-gradient(135deg, var(--indigo-9), var(--violet-9), var(--cyan-9))",
                        padding: "14px 18px 12px",
                      }}
                    >
                      <Text size="3" weight="bold" style={{ color: "white" }}>
                        {i18n.t("home_button_select_device")}
                      </Text>
                      <Text size="1" style={{ color: "rgba(255,255,255,0.75)", display: "block", marginTop: 2 }}>
                        {devices.length > 0
                          ? `${i18n.t("device_total_devices")}: ${devices.length}`
                          : i18n.t("common_list_no_devices")}
                      </Text>
                    </Box>
                    <Box style={{ padding: "10px 14px 14px" }}>
                      {devices.length === 0 ? (
                        <Flex direction="column" align="center" py="4">
                          <Text color="gray" size="2">{i18n.t("common_list_no_devices")}</Text>
                        </Flex>
                      ) : (
                        <ScrollArea type="auto" scrollbars="vertical" style={{ maxHeight: 260 }}>
                          <Flex direction="column" gap="2" pr="2">
                            {devices.map((device) => {
                              const selected = selectedDevice?.deviceSN === device.deviceSN;
                              return (
                                <Box
                                  key={device.deviceSN}
                                  onClick={() => {
                                    setSelectedDevice(device);
                                    setIsDeviceDialogVisible(false);
                                  }}
                                  style={{
                                    padding: "10px 14px",
                                    borderRadius: "var(--radius-3)",
                                    border: selected ? "2px solid var(--indigo-9)" : "1px solid var(--gray-a4)",
                                    backgroundColor: selected ? "var(--indigo-a2)" : "var(--gray-a2)",
                                    cursor: "pointer",
                                    transition: "all 0.15s ease",
                                  }}
                                >
                                  <Flex justify="between" align="center" gap="3">
                                    <Flex direction="column" gap="1" style={{ minWidth: 0 }}>
                                      <Text size="2" weight="bold" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {device.deviceName || i18n.t("home_modal_unnamed_device")}
                                      </Text>
                                      <Text size="1" color="gray" style={{ fontFamily: "monospace" }}>
                                        {device.deviceSN}
                                      </Text>
                                    </Flex>
                                    <Box
                                      style={{
                                        width: 18,
                                        height: 18,
                                        borderRadius: "50%",
                                        border: selected ? "none" : "2px solid var(--gray-a6)",
                                        background: selected ? "linear-gradient(135deg, var(--indigo-9), var(--cyan-9))" : "transparent",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                      }}
                                    >
                                      {selected && (
                                        <svg width="10" height="10" viewBox="0 0 15 15" fill="none">
                                          <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3354 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.5553 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="white" fillRule="evenodd" clipRule="evenodd" />
                                        </svg>
                                      )}
                                    </Box>
                                  </Flex>
                                </Box>
                              );
                            })}
                          </Flex>
                        </ScrollArea>
                      )}
                    </Box>
                  </Popover.Content>
                </Popover.Root>

                <DropdownMenu.Root open={exportOpen} onOpenChange={setExportOpen} modal={false}>
                <DropdownMenu.Trigger disabled={rows.length === 0}>
                  <Button
                    size="2"
                    disabled={rows.length === 0}
                    onPointerEnter={rows.length > 0 ? enterExport : undefined}
                    onPointerLeave={leaveExport}
                    style={{ cursor: rows.length > 0 ? "pointer" : "default" }}
                  >
                    {i18n.t("history_button_export")}
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content
                  sideOffset={8}
                  align="end"
                  variant="soft"
                  onPointerEnter={enterExport}
                  onPointerLeave={leaveExport}
                  style={{ minWidth: 160 }}
                >
                  {["csv", "excel", "json", "xml", "html"].map((item) => (
                    <DropdownMenu.Item
                      key={item}
                      onClick={() => exportData(item)}
                    >
                      {item.toUpperCase()}
                    </DropdownMenu.Item>
                  ))}
                  <DropdownMenu.Item key="pdf" onClick={() => setIsPrinting(true)}>
                    PDF
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Item
                    color="red"
                    onClick={() => setRows([])}
                  >
                    {i18n.t("common_button_clear")}
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
              </Flex>
            </Flex>
          </Card>

          {/* Data Table */}
          {rows.length === 0 ? (
            <Card variant="surface">
              <Text color="gray">{i18n.t("common_list_no_data")}</Text>
            </Card>
          ) : (
            <Card variant="surface">
              <ScrollArea style={{ width: "100%" }}>
                <Table.Root style={{ minWidth: "500px" }}>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell>
                        {i18n.t("history_table_time")}
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell justify="end">
                        {i18n.t("history_table_battery")}
                      </Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    {rows.map((item) => (
                      <Table.Row key={item.id}>
                        <Table.RowHeaderCell>{item.time}</Table.RowHeaderCell>
                        <Table.Cell justify="end">{item.battery}%</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </ScrollArea>
            </Card>
          )}
        </Flex>
      </Container>

      {/* Hidden content for react-to-print, only rendered when printing */}
      {isPrinting && (
        <div style={{ display: "none" }}>
        <div ref={printContentRef}>
          <h2>Battery Data History</h2>
          <p>Generated: {new Date().toLocaleString()} | Timezone: {timeZoneString}</p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Time ({timeZoneString})</th>
                <th>Battery %</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.time}</td>
                  <td>{item.battery}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </WebPageShell>
    </WebAuthGuard>
  );
}
