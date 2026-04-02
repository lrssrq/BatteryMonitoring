import WebAuthGuard from "@/components/web/WebAuthGuard";
import WebPageShell from "@/components/web/WebPageShell";
import { useDevice } from "@/contexts/DeviceContext";
import { loadBatteryData } from "@/lib/battery/api";
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Text
} from "@radix-ui/themes";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useWindowDimensions } from "react-native";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartPoint = { value: number; time: Date };

type RangeKey = "1hour" | "24hours" | "1week" | "1month";

const RANGE_OPTIONS: RangeKey[] = ["1hour", "24hours", "1week", "1month"];

const rangeMs: Record<RangeKey, number> = {
  "1hour": 60 * 60 * 1000,
  "24hours": 24 * 60 * 60 * 1000,
  "1week": 7 * 24 * 60 * 60 * 1000,
  "1month": 30 * 24 * 60 * 60 * 1000,
};

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

function formatAxisTime(timestamp: number, range: RangeKey): string {
  const d = new Date(timestamp);
  if (range === "1hour" || range === "24hours") {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function AnalysisWeb() {
  const { i18n } = useTranslation();
  const { width: windowWidth } = useWindowDimensions();
  const { selectedDevice } = useDevice();
  const [value, setValue] = useState<RangeKey>("24hours");
  const [data, setData] = useState<ChartPoint[]>([]);

  const refreshData = () => {
    if (!selectedDevice?.deviceSN) {
      setData([]);
      return;
    }

    loadBatteryData(selectedDevice.deviceSN)
      .then((rows) => {
        if (!rows || rows.length === 0) {
          setData([]);
          return;
        }

        setData(
          rows.map((item) => ({
            value: item.batteryLevel,
            time: new Date(item.recordedAt),
          })),
        );
      })
      .catch(() => {
        setData([]);
      });
  };

  useEffect(() => {
    refreshData();
  }, [selectedDevice]);

  const filtered = useMemo(() => {
    const now = Date.now();
    const threshold = now - rangeMs[value];
    return data.filter((point) => point.time.getTime() >= threshold);
  }, [data, value]);

  const avg = filtered.length
    ? Math.round(
        filtered.reduce((sum, item) => sum + item.value, 0) / filtered.length,
      )
    : 0;

  const chartData = useMemo(() => {
    const source = filtered.slice(-250);
    return source.map((point) => ({
      value: clampPercent(point.value),
      timestamp: point.time.getTime(),
    }));
  }, [filtered]);

  const desktop = windowWidth >= 1200;

  return (
    <WebAuthGuard>
    <WebPageShell>
      <Flex direction="column" gap="4">
        {/* Range & Refresh Controls */}
        <Flex
          direction={desktop ? "row" : "column"}
          gap="3"
          align={desktop ? "center" : "stretch"}
        >
          <Flex gap="2" wrap="wrap" style={{ flex: 1 }}>
            {RANGE_OPTIONS.map((key) => {
              const active = value === key;
              return (
                <Button
                  key={key}
                  variant={active ? "solid" : "surface"}
                  color={active ? "indigo" : "gray"}
                  onClick={() => setValue(key)}
                  size="2"
                  style={{ cursor: "pointer" }}
                >
                  {i18n.t(`analysis_range_${key}`)}
                </Button>
              );
            })}
          </Flex>
          <Button
            variant="surface"
            onClick={refreshData}
            size="2"
            style={{ cursor: "pointer" }}
          >
            {i18n.t("analysis_button_refresh")}
          </Button>
        </Flex>

        {/* Stats Cards */}
        <Flex
          direction={desktop ? "row" : "column"}
          gap="3"
        >
          {[
            {
              title: i18n.t("analysis_points"),
              value: String(filtered.length),
            },
            {
              title: i18n.t("analysis_average"),
              value: `${avg}%`,
            },
            {
              title: i18n.t("analysis_latest"),
              value: `${filtered.at(-1) ? Math.round(filtered.at(-1)!.value) : 0}%`,
            },
            {
              title: i18n.t("home_info_current_device_name"),
              value: selectedDevice?.deviceName || i18n.t("home_info_no_device_selected"),
            },
          ].map((card) => (
            <Card key={card.title} variant="surface" style={{ flex: 1 }}>
              <Text color="gray" size="2" mb="2">
                {card.title}
              </Text>
              <Heading size="6">
                {card.value}
              </Heading>
            </Card>
          ))}
        </Flex>

        {/* Chart Card */}
        <Card variant="surface">
          <Heading size="5" mb="4">
            {i18n.t("analysis_header_title")}
          </Heading>

          {chartData.length === 0 ? (
            <Box py="6">
              <Text color="gray" align="center">
                {i18n.t("common_list_no_data")}
              </Text>
            </Box>
          ) : (
            <Box style={{ width: "100%", height: 420 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="batteryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--gray-a4)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="timestamp"
                    type="number"
                    domain={["dataMin", "dataMax"]}
                    tickFormatter={(ts) => formatAxisTime(ts, value)}
                    tick={{ fill: "var(--gray-9)", fontSize: 11 }}
                    stroke="var(--gray-7)"
                    tickLine={false}
                    minTickGap={40}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fill: "var(--gray-9)", fontSize: 11 }}
                    stroke="var(--gray-7)"
                    tickLine={false}
                    width={48}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.[0]) return null;
                      const d = payload[0].payload;
                      return (
                        <Box
                          p="3"
                          style={{
                            borderRadius: "var(--radius-2)",
                            border: "1px solid var(--gray-a5)",
                            background: "var(--color-panel-solid)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          }}
                        >
                          <Heading size="3" mb="1">
                            {Math.round(d.value)}%
                          </Heading>
                          <Text size="1" color="gray">
                            {new Date(d.timestamp).toLocaleString(i18n.language)}
                          </Text>
                        </Box>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fill="url(#batteryGradient)"
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: "#818cf8",
                      stroke: "#6366f1",
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          )}
        </Card>
      </Flex>
    </WebPageShell>
    </WebAuthGuard>
  );
}
