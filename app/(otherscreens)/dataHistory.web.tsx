import WebAuthGuard from "@/components/web/WebAuthGuard";
import WebPageShell from "@/components/web/WebPageShell";
import { useDevice } from "@/contexts/DeviceContext";
import { loadBatteryData } from "@/lib/battery/api";
import {
    Button,
    Card,
    Container,
    DropdownMenu,
    Flex,
    Heading,
    ScrollArea,
    Table,
    Text
} from "@radix-ui/themes";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useWindowDimensions } from "react-native";
import Toast from "react-native-toast-message";
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
  const { selectedDevice } = useDevice();
  const { width } = useWindowDimensions();
  const desktop = width >= 1160;
  const [rows, setRows] = useState<DataHistoryRecord[]>([]);
  const [exportOpen, setExportOpen] = useState(false);
  const exportTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const enterExport = useCallback(() => {
    clearTimeout(exportTimer.current);
    setExportOpen(true);
  }, []);
  const leaveExport = useCallback(() => {
    exportTimer.current = setTimeout(() => setExportOpen(false), 200);
  }, []);

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
</head>
<body>
  <h2>Battery Data History</h2>
  <p>Generated: ${new Date().toLocaleString()}</p>
  <table border="1" cellspacing="0" cellpadding="8">
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
    </WebPageShell>
    </WebAuthGuard>
  );
}
