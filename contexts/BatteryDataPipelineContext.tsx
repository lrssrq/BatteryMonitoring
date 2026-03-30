import { saveBatteryData } from "@/lib/battery/api";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDevice } from "./DeviceContext";
import { useModel } from "./ModelContext";
import { useMqtt } from "./MqttContext";

const TOPIC_PREFIX = "device/data/";

type BatteryDataPipelineContextType = {
  mqttStatus: string;
  remainingPower: number | null;
  lastSyncTime: string;
};

const BatteryDataPipelineContext = createContext<
  BatteryDataPipelineContextType | undefined
>(undefined);

export const BatteryDataPipelineProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const prevTopicRef = useRef<string | null>(null);
  const [remainingPower, setRemainingPower] = useState<number | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState("");
  const { selectedDevice } = useDevice();
  const { mqttData, mqttStatus, subscribeToTopic, unsubscribeFromTopic } =
    useMqtt();
  const model = useModel();
  const modelRef = useRef(model);

  useEffect(() => {
    modelRef.current = model;
  }, [model]);

  const modelInference = async (inputData: Float32Array) => {
    // Early exit if model not ready
    if (!modelRef.current || !modelRef.current.isReady) {
      console.warn("⚠ Model not ready/available, skipping inference");
      setRemainingPower(-1);
      return;
    }

    try {
      // Try to load executorch module dynamically
      let ScalarType: any = null;
      try {
        const exec = require("react-native-executorch");
        ScalarType = exec.ScalarType;
      } catch (e) {
        console.warn("⚠ Executorch module unavailable in this build");
        setRemainingPower(-1);
        return;
      }

      if (!ScalarType?.FLOAT) {
        console.warn("⚠ ScalarType.FLOAT not available");
        setRemainingPower(-1);
        return;
      }

      // Create input tensor with safe scalar type
      const inputTensor = {
        dataPtr: inputData,
        sizes: [1, 20, 2],
        scalarType: ScalarType.FLOAT,
      };

      // Execute model inference
      const output = await modelRef.current.forward([inputTensor]);

      if (!output || !output[0]) {
        console.error("Invalid model output");
        setRemainingPower(-1);
        return;
      }

      const dataBuffer = output[0].dataPtr as ArrayBuffer;
      const predictedValue = new Float32Array(dataBuffer)[0];

      console.log(
        "✓ Inference ok:",
        new Float32Array(dataBuffer),
        "sizes:",
        output[0].sizes,
      );

      // Update UI with predicted value
      if (predictedValue > 0) {
        setRemainingPower(Math.min(100, Math.round(predictedValue * 100)));
      } else {
        setRemainingPower(0);
      }

      setLastSyncTime(
        new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
      );

      // Save to database
      await saveBatteryData({
        deviceSN: selectedDevice?.deviceSN || "",
        batteryLevel: Math.round(
          predictedValue > 0 ? Math.min(100, predictedValue * 100) : 0,
        ),
      });
    } catch (error) {
      console.error("✗ Model inference failed:", (error as Error).message);
      setRemainingPower(-1);
    }
  };

  useEffect(() => {
    // console.log(
    //   "Received MQTT message:",
    //   mqttData?.topic,
    //   mqttData?.message.toString(),
    // );
    if (!selectedDevice) return;
    const currentTopic = TOPIC_PREFIX + selectedDevice.deviceSN;
    if (mqttData?.topic === currentTopic) {
      try {
        const parsedMessage = JSON.parse(mqttData.message.toString());
        if (!Array.isArray(parsedMessage?.data)) {
          console.warn("Invalid MQTT payload format", parsedMessage);
          return;
        }
        const inputData = new Float32Array(parsedMessage.data);
        modelInference(inputData);
      } catch (error) {
        console.error("Failed to parse MQTT payload", error);
      }
    }
  }, [mqttData, selectedDevice]);

  useEffect(() => {
    const nextTopic = selectedDevice
      ? TOPIC_PREFIX + selectedDevice.deviceSN
      : null;
    console.log("nextTopic:", nextTopic, "mqttStatus:", mqttStatus);

    if (!selectedDevice && prevTopicRef.current) {
      unsubscribeFromTopic([prevTopicRef.current]);
      setRemainingPower(-1);
    }
    if (mqttStatus !== "Connected") {
      prevTopicRef.current = null;
      return;
    }

    if (!nextTopic) {
      prevTopicRef.current = null;
      return;
    }

    setRemainingPower(-1);
    setLastSyncTime("");

    if (prevTopicRef.current && prevTopicRef.current !== nextTopic) {
      unsubscribeFromTopic([prevTopicRef.current]);
    }

    if (prevTopicRef.current !== nextTopic) {
      subscribeToTopic([nextTopic], {
        qos: 1,
        nl: true,
      });
      prevTopicRef.current = nextTopic;
    }
  }, [mqttStatus, selectedDevice, subscribeToTopic, unsubscribeFromTopic]);

  return (
    <BatteryDataPipelineContext.Provider
      value={{
        mqttStatus,
        remainingPower,
        lastSyncTime,
      }}
    >
      {children}
    </BatteryDataPipelineContext.Provider>
  );
};

export const useBatteryDataPipeline = () => {
  const context = useContext(BatteryDataPipelineContext);
  if (context === undefined) {
    throw new Error(
      "useBatteryDataPipeline must be used within a BatteryDataPipelineProvider",
    );
  }
  return context;
};
