import React, { useMemo } from "react";
import { StyleSheet, Text, TextStyle, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface PercentageCircleProps {
  radius: number;
  percent: number;
  color?: string; // progress bar color
  bgcolor?: string; // remaining part background color
  innerColor?: string; // center circle color
  borderWidth?: number;
  textStyle?: TextStyle | TextStyle[];
  disabled?: boolean;
  disabledText?: string;
  children?: React.ReactNode;
}

const PercentageCircle: React.FC<PercentageCircleProps> = ({
  radius,
  percent,
  color = "#3498db",
  bgcolor = "#E8E8E8", // Light gray, clear but not eye-catching
  innerColor = "#FFFFFF", // Pure white, simple and bright
  borderWidth = 2,
  textStyle,
  disabled = false,
  disabledText,
  children,
}) => {
  // Ensure the percentage is between 0-100
  const validPercent = Math.max(0, Math.min(100, percent));

  // Dynamically calculate the color based on the battery percentage (if no custom color is provided)
  const batteryColor = useMemo(() => {
    if (color !== "#3498db") return color; // If the user customizes the color, use the custom color

    // Battery color scheme:
    // 0-10%: Dark red #E53935 (Danger)
    // 11-20%: Orange red #FF5722 (Warning)
    // 21-50%: Orange #FF9800 (Attention)
    // 51-80%: Green #66BB6A (Good)
    // 81-100%: Dark green #43A047 (Sufficient)

    if (validPercent <= 10) return "#E53935";
    if (validPercent <= 20) return "#FF5722";
    if (validPercent <= 50) return "#FF9800";
    if (validPercent <= 80) return "#66BB6A";
    return "#43A047";
  }, [validPercent, color]);

  // Calculate actual border width
  const safeBorderWidth = borderWidth < 2 ? 2 : borderWidth;

  // Calculate SVG circle parameters
  const { strokeDasharray, strokeDashoffset } = useMemo(() => {
    // The radius of the circle needs to subtract half of the border width
    const normalizedRadius = radius - safeBorderWidth / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const offset = circumference - (validPercent / 100) * circumference;

    return {
      strokeDasharray: `${circumference} ${circumference}`,
      strokeDashoffset: offset,
    };
  }, [radius, validPercent, safeBorderWidth]);

  // If disabled, show a simple circle
  if (disabled) {
    return (
      <View
        style={[
          styles.circle,
          {
            width: radius * 2,
            height: radius * 2,
            borderRadius: radius,
            backgroundColor: bgcolor,
          },
        ]}
      >
        <Text style={[styles.text, textStyle]}>{disabledText}</Text>
      </View>
    );
  }

  const centerOffset = radius;
  // The radius of the circle needs to subtract half of the border width to ensure the border is completely within the SVG
  const normalizedRadius = radius - safeBorderWidth / 2;
  const svgSize = radius * 2;

  return (
    <View
      style={[
        styles.container,
        {
          width: svgSize,
          height: svgSize,
        },
      ]}
    >
      <Svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
      >
        {/* Background ring */}
        <Circle
          cx={centerOffset}
          cy={centerOffset}
          r={normalizedRadius}
          stroke={bgcolor}
          strokeWidth={safeBorderWidth}
          fill="none"
        />
        {/* Progress ring */}
        <Circle
          cx={centerOffset}
          cy={centerOffset}
          r={normalizedRadius}
          stroke={batteryColor}
          strokeWidth={safeBorderWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${centerOffset}, ${centerOffset}`}
        />
      </Svg>

      {/* Inner content area */}
      <View
        style={[
          styles.innerCircle,
          {
            width: (radius - safeBorderWidth) * 2,
            height: (radius - safeBorderWidth) * 2,
            borderRadius: radius - safeBorderWidth,
            backgroundColor: innerColor,
          },
        ]}
      >
        {children ? (
          children
        ) : (
          <Text style={[styles.text, textStyle]}>{percent}%</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  circle: {
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e3e3e3",
  },
  innerCircle: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    color: "#333333", // Dark gray, clear and readable
    fontWeight: "600", // Slightly bolder, more prominent
  },
});

export default PercentageCircle;
