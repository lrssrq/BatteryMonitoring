import PaperDialog, { PaperDialogRef } from "@/components/PaperDialog";
import { useDevice } from "@/contexts/DeviceContext";
import { useTheme } from "@/hooks/useTheme";
import { loadBatteryData } from "@/lib/battery/api";
import { FlashList } from "@shopify/flash-list";
import { File, Paths } from "expo-file-system";
import * as Print from "expo-print";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import {
  Button,
  DataTable,
  Divider,
  IconButton,
  Menu,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import * as XLSX from "xlsx";
import * as xml from "xml-js";
interface DataHistoryRecord {
  id: string;
  time: string;
  battery: number;
}
const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
};

export default function DataHistory() {
  const { i18n } = useTranslation();
  const { colors } = useTheme();
  const TimeZoneString = useMemo(() => {
    const timeZoneOffset = new Date().getTimezoneOffset();
    const hours = Math.floor(Math.abs(timeZoneOffset) / 60);
    const minutes = Math.abs(timeZoneOffset) % 60;
    const sign = timeZoneOffset > 0 ? "-" : "+";
    return `GMT${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }, []);
  const { selectedDevice } = useDevice();
  useEffect(() => {
    if (selectedDevice && selectedDevice.deviceSN) {
      loadBatteryData(selectedDevice.deviceSN).then((data) => {
        if (!data) return;
        const currentData = data.map((record) => ({
          id: new Date(record.recordedAt).getTime().toString(),
          time: formatTime(record.recordedAt),
          battery: record.batteryLevel,
        }));
        setCurrentData(currentData);
        // console.log(
        //   "Loaded battery data for device",
        //   selectedDevice.deviceSN,
        //   currentData,
        // );
      });
    }
  }, []);
  const [currentData, setCurrentData] = useState<DataHistoryRecord[]>([]);
  const [visible, setVisible] = useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  const dialogRef = useRef<PaperDialogRef>(null);

  const generateExportContent = (fileType: string) => {
    switch (fileType) {
      case "csv":
        return currentData.reduce((csv, item) => {
          const row = `${item.id},${item.time},${item.battery}\n`;
          return csv + row;
        }, `ID,Time(${TimeZoneString}),Battery %\n`);
      case "excel": {
        const worksheet = XLSX.utils.json_to_sheet(currentData);
        const workbook = XLSX.utils.book_new();
        // console.log(worksheet);
        XLSX.utils.book_append_sheet(workbook, worksheet, "dataHistory");
        const buffer = XLSX.writeXLSX(workbook, {
          type: "buffer",
          bookType: "xlsx",
        });

        console.log({
          type: buffer.constructor.name,
          size: buffer.byteLength + " bytes",
          firstBytes: Array.from(buffer.slice(0, 8))
            .map((b) => "0x" + Number(b).toString(16).padStart(2, "0"))
            .join(", "),
          isValidXLSX: buffer[0] === 0x50 && buffer[1] === 0x4b,
        });
        return buffer;
      }
      case "json":
        return JSON.stringify(currentData, null, 2);
      case "xml":
        return xml.js2xml(
          { dataHistory: { record: currentData } },
          { compact: true, ignoreDeclaration: false },
        );
      case "html":
      case "pdf":
        return generateHTMLContent();
      default:
        return "";
    }
  };

  const generateHTMLContent = () => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
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
  <h1>Battery Data History</h1>
  <p>Generated: ${new Date().toLocaleString()}</p>
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Time(${TimeZoneString})</th>
        <th>Battery %</th>
      </tr>
    </thead>
    <tbody>
      ${currentData
        .map(
          (item) => `
        <tr>
          <td>${item.id}</td>
          <td>${item.time}</td>
          <td>${item.battery}</td>
        </tr>
      `,
        )
        .join("")}
    </tbody>
  </table>
</body>
</html>`;
  };

  const exportFile = async (fileType: string, content: string | Uint8Array) => {
    try {
      if (fileType === "pdf") {
        const pdf = await Print.printToFileAsync({
          html: String(content),
          base64: false,
        });
        console.log(pdf);
        const pdfFile = new File(pdf.uri);
        const oldFile = new File(pdfFile.parentDirectory, "data_history.pdf");
        if (oldFile.exists) {
          oldFile.delete();
        }
        pdfFile.rename("data_history.pdf");

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(pdfFile.uri, {
            mimeType: "application/pdf",
            dialogTitle: "Share Data History PDF",
          });
        }
      } else {
        const fileName = `data_history.${exportHandlers[fileType]?.ext}`;
        const file = new File(Paths.cache, fileName);
        file.create({ intermediates: true, overwrite: true });
        file.write(content);
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(file.uri, {
            mimeType: exportHandlers[fileType]?.mime,
            dialogTitle: "Share Data History",
          });
        }
      }
    } catch (e) {
      console.error("Error exporting file:", e);
    }
  };

  const exportHandlers: Record<
    string,
    {
      ext: string;
      mime: string;
      handler: (
        fileType: string,
        content: string | Uint8Array,
      ) => Promise<void>;
    }
  > = {
    csv: {
      ext: "csv",
      mime: "text/csv",
      handler: exportFile,
    },
    json: {
      ext: "json",
      mime: "application/json",
      handler: exportFile,
    },
    xml: {
      ext: "xml",
      mime: "text/xml",
      handler: exportFile,
    },
    excel: {
      ext: "xlsx",
      mime: "application/vnd.ms-excel",
      handler: exportFile,
    },
    html: {
      ext: "html",
      mime: "text/html",
      handler: exportFile,
    },
    pdf: {
      ext: "pdf",
      mime: "application/pdf",
      handler: exportFile,
    },
  };

  const handleExportData = async (fileType: string) => {
    const handler = exportHandlers[fileType];
    if (!handler) {
      console.error("Unknown export format:", fileType);
      return;
    }

    const content = generateExportContent(fileType);
    console.log(`Exporting data as ${fileType}...`);
    await handler.handler(fileType, content);
  };

  // const handleClearData = () => {
  //   setData([]);
  // };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <PaperDialog
        ref={dialogRef}
        title={i18n.t("common_dialog_title")}
        content={i18n.t("history_dialog_clear_data")}
        confirmText={i18n.t("common_button_confirm")}
        cancelText={i18n.t("common_button_cancel")}
        onConfirm={() => {}}
        onCancel={() => dialogRef.current?.hide()}
        mode="double"
      />
      <View style={styles.header}>
        <IconButton
          icon="close"
          iconColor={colors.icon}
          size={30}
          onPress={() => {
            router.canGoBack() ? router.back() : router.dismissTo("/");
          }}
        />
        <Text style={[styles.title, { color: colors.text }]}>
          {i18n.t("history_header_title")}
        </Text>
        <View style={{ width: 48 }} />
      </View>
      {currentData.length > 0 ? (
        <>
          <DataTable style={styles.table}>
            <DataTable.Header>
              <DataTable.Title style={styles.timeColumn}>
                {i18n.t("history_table_time")}
              </DataTable.Title>
              <DataTable.Title numeric style={styles.batteryColumn}>
                {i18n.t("history_table_battery")}
              </DataTable.Title>
            </DataTable.Header>

            <FlashList
              data={currentData}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ flexGrow: 1 }}
              renderItem={({ item }) => (
                <DataTable.Row>
                  <DataTable.Cell style={styles.timeColumn}>
                    {item.time}
                  </DataTable.Cell>
                  <DataTable.Cell numeric style={styles.batteryColumn}>
                    {item.battery}
                  </DataTable.Cell>
                </DataTable.Row>
              )}
              scrollEnabled={true}
            />
          </DataTable>

          <View style={styles.buttonContainer}>
            <Menu
              // key={visible.toString()}
              visible={visible}
              onDismiss={closeMenu}
              anchor={
                <Button mode="contained" onPress={openMenu}>
                  {i18n.t("history_button_export")}
                </Button>
              }
              anchorPosition="top"
              style={{ maxWidth: 150 }}
              contentStyle={{
                marginBottom: 40,
                minHeight: 240,
                paddingVertical: 0,
              }}
            >
              <Menu.Item
                leadingIcon="file-delimited"
                dense={true}
                onPress={() => {
                  closeMenu();
                  handleExportData("csv");
                }}
                title="CSV"
                style={{ minHeight: 40 }}
                titleStyle={{ fontSize: 18 }}
              />
              <Divider />
              <Menu.Item
                leadingIcon="code-json"
                dense={true}
                onPress={() => {
                  closeMenu();
                  handleExportData("json");
                }}
                title="JSON"
                style={{ minHeight: 40 }}
                titleStyle={{ fontSize: 18 }}
              />
              <Divider />
              <Menu.Item
                leadingIcon="xml"
                dense={true}
                onPress={() => {
                  closeMenu();
                  handleExportData("xml");
                }}
                title="XML"
                style={{ minHeight: 40 }}
                titleStyle={{ fontSize: 18 }}
              />
              <Divider />
              <Menu.Item
                leadingIcon="file-excel"
                dense={true}
                onPress={() => {
                  closeMenu();
                  handleExportData("excel");
                }}
                title="Excel"
                style={{ minHeight: 40 }}
                titleStyle={{ fontSize: 18 }}
              />
              <Divider />
              <Menu.Item
                leadingIcon="file-document"
                dense={true}
                onPress={() => {
                  closeMenu();
                  handleExportData("html");
                }}
                title="HTML"
                style={{ minHeight: 40 }}
                titleStyle={{ fontSize: 18 }}
              />
              <Divider />
              <Menu.Item
                leadingIcon="file-pdf-box"
                dense={true}
                onPress={() => {
                  closeMenu();
                  handleExportData("pdf");
                }}
                title="PDF"
                style={{ minHeight: 40 }}
                titleStyle={{ fontSize: 18 }}
              />
            </Menu>
            <Button mode="outlined" onPress={() => dialogRef.current?.show()}>
              {i18n.t("common_button_clear")}
            </Button>
          </View>
        </>
      ) : (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text
            style={{ alignSelf: "center", fontSize: 20, color: colors.text }}
          >
            {i18n.t("common_list_no_data")}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: 50,
    // paddingHorizontal: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  table: {
    flex: 1,
    marginBottom: 16,
  },
  timeColumn: {
    flex: 2,
    // maxWidth: 140,
  },
  batteryColumn: {
    flex: 1,
    justifyContent: "center",
  },
  tempColumn: {
    flex: 1,
    justifyContent: "center",
  },
  healthColumn: {
    flex: 1,
    justifyContent: "center",
  },
  buttonContainer: {
    marginBottom: 50,
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 8,
  },
});
