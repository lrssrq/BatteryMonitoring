import Colors from "@/constants/Colors";
import { useDevice } from "@/contexts/DeviceContext";
import { useTheme } from "@/hooks/useTheme";
import { loadBatteryData } from "@/lib/battery/api";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { LineChart, lineDataItem } from "react-native-gifted-charts";
import { Button, IconButton, SegmentedButtons } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
type ChartPoint = lineDataItem & { time: Date };
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen");
export default function Tab() {
  const { i18n } = useTranslation();
  const { colors } = useTheme();
  const { selectedDevice } = useDevice();
  const [pending, setPending] = useState(false);
  const refreshData = async () => {
    if (selectedDevice && selectedDevice.deviceSN) {
      setPending(true);
      loadBatteryData(selectedDevice.deviceSN).then((data) => {
        if (!data) return;
        const lineDataItems: ChartPoint[] = data.map((record) => ({
          value: record.batteryLevel,
          // label: new Date(record.recordedAt).toLocaleTimeString(),
          dataPointText: String(record.batteryLevel),
          time: new Date(record.recordedAt),
        }));
        setCurrentData(lineDataItems);
        setPending(false);
      });
      setPending(false);
    } else {
      setCurrentData([]);
      setPending(false);
    }
  };
  useEffect(() => {
    refreshData();
  }, [selectedDevice]);
  const [value, setValue] = useState("1hour");
  const [currentData, setCurrentData] = useState<ChartPoint[]>([]);
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.text }}>
          {i18n.t("analysis_header_title")}
        </Text>
        <IconButton
          icon="database"
          size={24}
          iconColor={colors.icon}
          onPress={() => {
            router.navigate("/dataHistory");
          }}
        />
      </View>
      <View style={styles.content}>
        <SegmentedButtons
          // multiSelect
          value={value}
          onValueChange={setValue}
          density="regular"
          style={styles.buttonGroup}
          buttons={[
            {
              value: "1hour",
              label: "1 hour",
              labelStyle: { fontSize: 14, fontWeight: "bold", minWidth: 60 },
            },
            {
              value: "24hours",
              label: "24 hours",
              labelStyle: { fontSize: 14, fontWeight: "bold", minWidth: 60 },
            },
            {
              value: "1week",
              label: "1 week",
              labelStyle: { fontSize: 14, fontWeight: "bold", minWidth: 60 },
            },
            {
              value: "1month",
              label: "1 month",
              labelStyle: { fontSize: 14, fontWeight: "bold", minWidth: 60 },
            },
          ]}
        />
        <View style={{ alignItems: "center", marginTop: 20, paddingRight: 50 }}>
          <LineChart
            data={currentData}
            areaChart
            curved
            maxValue={100}
            height={250}
            width={SCREEN_WIDTH * 0.8}
            noOfSections={10}
            backgroundColor={colors.chartBackground}
            color1={colors.chartLineColor}
            startFillColor={colors.chartLineColor}
            endFillColor={colors.chartLineColor}
            startOpacity={0.22}
            endOpacity={0.03}
            initialSpacing={0}
            endSpacing={5}
            hideDataPoints
            focusEnabled
            showDataPointOnFocus
            // showStripOnFocus
            // stripColor="#93C5FD"
            // stripOpacity={0.35}
            hideRules
            yAxisLabelSuffix="%"
            pointerConfig={{
              pointerColor: colors.chartPointerColor,
              radius: 5,
              pointerStripColor: colors.chartPointerStripColor,
              pointerStripHeight: 250,
              pointerStripWidth: 2,
              pointerStripUptoDataPoint: false,
              showPointerStrip: true,
              activatePointersOnLongPress: true,
              activatePointersDelay: 120,
              pointerVanishDelay: 250,
              autoAdjustPointerLabelPosition: true,
              pointerLabelWidth: 120,
              pointerLabelHeight: 56,
              pointerLabelComponent: (items: ChartPoint[]) => {
                const item = items?.[0];
                if (!item || item.value === undefined) return null;
                let shiftedMarginTop = -80;
                if (item?.value) {
                  if (item.value < 50) {
                    shiftedMarginTop += item.value;
                  } else {
                    shiftedMarginTop = 110 - item.value;
                  }
                }
                return (
                  <View
                    style={{
                      alignItems: "center",
                      marginTop: shiftedMarginTop,
                    }}
                  >
                    <Text
                      style={{
                        color: "black",
                        fontSize: 14,
                        marginBottom: 20,
                        textAlign: "center",
                      }}
                    >
                      {item.time.toLocaleDateString()}
                    </Text>
                    <View
                      style={{
                        backgroundColor: colors.chartDataPointBg,
                        borderRadius: 10,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        marginTop: -10,
                        borderWidth: 1,
                        borderColor: colors.chartPointerStripColor,
                      }}
                    >
                      <Text
                        style={{
                          color: colors.chartDataPointText,
                          fontWeight: "700",
                          fontSize: 13,
                        }}
                      >
                        {item.value}%
                      </Text>
                      <Text
                        style={{
                          color: colors.chartDataPointLabel,
                          fontSize: 11,
                        }}
                      >
                        {i18n.t("analysis_chart_battery_level")}
                      </Text>
                      <Text
                        style={{
                          color: colors.chartDataPointLabel,
                          fontSize: 11,
                        }}
                      >
                        {item.time.toLocaleTimeString()}
                      </Text>
                    </View>
                  </View>
                );
              },
            }}
          />
        </View>
        {currentData.length === 0 && (
          <Text style={{ marginTop: 12, fontSize: 20 }}>
            {i18n.t("common_list_no_data")}
          </Text>
        )}
        <Button
          onPress={() => {
            refreshData();
          }}
          mode="contained"
          style={{ marginTop: 20, alignSelf: "center" }}
          disabled={pending}
        >
          {i18n.t("analysis_button_refresh")}
        </Button>
      </View>
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
    paddingHorizontal: 16,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fontStyle: {
    fontFamily: "Optima",
    fontSize: 32,
  },
  activeFontStyle: {
    color: "blue",
  },
  buttonGroup: {
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
});
