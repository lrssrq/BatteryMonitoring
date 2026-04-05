import { useDevice } from "@/contexts/DeviceContext";
import { BatteryDataRecord, loadBatteryData } from "@/lib/battery/api";
import { Circle, useFont } from "@shopify/react-native-skia";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, StyleSheet, View } from "react-native";
import { Button, IconButton, SegmentedButtons, Text, useTheme } from "react-native-paper";
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Area, CartesianChart, Line, useChartPressState } from "victory-native";

type ChartPoint = { timestamp: number; value: number };

const { width: SCREEN_WIDTH } = Dimensions.get("screen");
const CHART_HEIGHT = 260;
const TOOLTIP_WIDTH = 130;

function getTimeRangeCutoff(range: string): number {
  const rangeMs: Record<string, number> = {
    "1hour": 60 * 60 * 1000,
    "24hours": 24 * 60 * 60 * 1000,
    "1week": 7 * 24 * 60 * 60 * 1000,
    "1month": 30 * 24 * 60 * 60 * 1000,
  };
  return Date.now() - (rangeMs[range] ?? rangeMs["1hour"]);
}

export default function Tab() {
  const { i18n } = useTranslation();
  const { colors } = useTheme();
  const { selectedDevice } = useDevice();
  const [pending, setPending] = useState(false);
  const [rawData, setRawData] = useState<BatteryDataRecord[]>([]);
  const [timeRange, setTimeRange] = useState("1hour");
  const font = useFont(
    require("@/assets/fonts/SpaceMono-Regular.ttf"),
    11,
  );
  const chartData = useMemo<ChartPoint[]>(() => {
    const cutoff = getTimeRangeCutoff(timeRange);
    return rawData
      .filter((d) => new Date(d.recordedAt).getTime() >= cutoff)
      .map((d) => ({
        timestamp: new Date(d.recordedAt).getTime(),
        value: d.batteryLevel,
      }));
  }, [rawData, timeRange]);

  const refreshData = async () => {
    if (selectedDevice?.deviceSN) {
      setPending(true);
      const data = await loadBatteryData(selectedDevice.deviceSN);
      setRawData(data ?? []);
      setPending(false);
    } else {
      setRawData([]);
    }
  };

  useEffect(() => {
    refreshData();
  }, [selectedDevice]);

  const { state, isActive } = useChartPressState({ x: 0, y: { value: 0 } });

  const [tooltipInfo, setTooltipInfo] = useState<{
    value: number;
    timestamp: number;
  } | null>(null);

  useAnimatedReaction(
    () => ({
      active: state.isActive.value,
      x: state.x.value.value,
      y: state.y.value.value.value,
    }),
    (current) => {
      if (current.active) {
        runOnJS(setTooltipInfo)({
          value: current.y,
          timestamp: current.x as number,
        });
      } else {
        runOnJS(setTooltipInfo)(null);
      }
    },
  );

  const tooltipStyle = useAnimatedStyle(() => {
    "worklet";
    const x = Math.min(
      Math.max(state.x.position.value - TOOLTIP_WIDTH / 2, 4),
      SCREEN_WIDTH - TOOLTIP_WIDTH - 4,
    );
    return {
      transform: [{ translateX: x }],
      top: Math.max(state.y.value.position.value - 80, 4),
    };
  });

  const [isFocused, setIsFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false); // Tab 离开时卸载
    }, [])
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>
          {i18n.t("analysis_header_title")}
        </Text>
        <IconButton
          icon="database"
          size={24}
          onPress={() => router.navigate("/dataHistory")}
        />
      </View>
      <View style={styles.content}>
        <SegmentedButtons
          value={timeRange}
          onValueChange={setTimeRange}
          density="regular"
          style={styles.buttonGroup}
          buttons={[
            {
              value: "1hour",
              label: "1H",
              labelStyle: { fontSize: 13, fontWeight: "bold" },
            },
            {
              value: "24hours",
              label: "24H",
              labelStyle: { fontSize: 13, fontWeight: "bold" },
            },
            {
              value: "1week",
              label: "7D",
              labelStyle: { fontSize: 13, fontWeight: "bold" },
            },
            {
              value: "1month",
              label: "1M",
              labelStyle: { fontSize: 13, fontWeight: "bold" },
            },
          ]}
        />
        <View style={styles.chartWrapper}>
          {isFocused && chartData.length > 0 ? (
            <>
              <CartesianChart
                data={chartData}
                xKey="timestamp"
                yKeys={["value"]}
                domain={{ y: [0, 100] }}
                domainPadding={{ left: 0, right: 10, top: 20, bottom: 10 }}
                chartPressState={state}
                axisOptions={{
                  font,
                  labelColor: colors.onSurface,
                  lineColor: {
                    grid: { x: colors.outline, y: "transparent" },
                    frame: colors.outline,
                  },
                  formatXLabel: (v) => {
                    const d = new Date(v as number);
                    if (timeRange === "1hour" || timeRange === "24hours") {
                      return d.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    }
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  },
                  formatYLabel: (v) => `${v}%`,
                  tickCount: { x: 4, y: 5 },
                }}
              >
                {({ points, chartBounds }) => (
                  <>
                    <Area
                      points={points.value}
                      y0={chartBounds.bottom}
                      color={colors.primary}
                      opacity={0.2}
                      curveType="natural"
                      animate={{ type: "spring" }}
                    />
                    <Line
                      points={points.value}
                      color={colors.primary}
                      strokeWidth={2.5}
                      curveType="natural"
                      animate={{ type: "spring" }}
                    />
                    {isActive && (
                      <Circle
                        cx={state.x.position}
                        cy={state.y.value.position}
                        r={5}
                        color={colors.primary}
                      />
                    )}
                  </>
                )}
              </CartesianChart>
              {isActive && tooltipInfo && (
                <Animated.View
                  style={[
                    styles.tooltip,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.primaryContainer,
                    },
                    tooltipStyle,
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      textAlign: "center",
                    }}
                  >
                    {new Date(tooltipInfo.timestamp).toLocaleDateString()}
                  </Text>
                  <Text
                    style={{
                      color: colors.primary,
                      fontWeight: "700",
                      fontSize: 15,
                      textAlign: "center",
                    }}
                  >
                    {tooltipInfo.value.toFixed(1)}%
                  </Text>
                  <Text
                    style={{
                      color: colors.onSurfaceVariant,
                      fontSize: 11,
                      textAlign: "center",
                    }}
                  >
                    {i18n.t("analysis_chart_battery_level")}
                  </Text>
                  <Text
                    style={{
                      color: colors.onSurfaceVariant,
                      fontSize: 10,
                      textAlign: "center",
                    }}
                  >
                    {new Date(tooltipInfo.timestamp).toLocaleTimeString()}
                  </Text>
                </Animated.View>
              )}
            </>
          ) : (
            <Text style={{ fontSize: 18 }}>
              {i18n.t("common_list_no_data")}
            </Text>
          )}
        </View>
        {rawData.length > 0 && (
          <Button
            onPress={refreshData}
            mode="contained"
            style={{ marginTop: 50, alignSelf: "center" }}
            disabled={pending}
          >
            {i18n.t("analysis_button_refresh")}
          </Button>)}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    justifyContent: "flex-start",
    paddingTop: 8,
  },
  buttonGroup: {
    marginTop: 20,
    marginBottom: 12,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  chartWrapper: {
    width: SCREEN_WIDTH,
    height: CHART_HEIGHT,
    marginTop: 80,
    position: "relative",
  },
  tooltip: {
    position: "absolute",
    width: TOOLTIP_WIDTH,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 0,
    borderWidth: 1,
    gap: 2,
  },
});
