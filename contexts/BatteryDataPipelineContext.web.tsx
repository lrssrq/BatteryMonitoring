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
  const [remainingPower, setRemainingPower] = useState<number | null>(-1);
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
    if (!modelRef.current || !modelRef.current.isReady) {
      console.warn("Model not ready/available, skipping inference");
      setRemainingPower(-1);
      return;
    }

    if (inputData.length !== 40) {
      console.warn("Invalid input length for model, expected 40 values", {
        actualLength: inputData.length,
      });
      setRemainingPower(-1);
      return;
    }

    if (!modelRef.current.ort?.Tensor) {
      console.warn("ONNX Runtime is unavailable, skipping inference");
      setRemainingPower(-1);
      return;
    }

    try {
      const inputTensor = new modelRef.current.ort.Tensor(
        "float32",
        inputData,
        [1, 20, 2],
      );
      const outputs = await modelRef.current.forward({
        [modelRef.current.session.inputNames[0]]: inputTensor,
      });

      const outputTensor =
        outputs.output ?? outputs[Object.keys(outputs)[0] as string];

      if (!outputTensor || !outputTensor.data) {
        console.error("Invalid ONNX output", outputs);
        setRemainingPower(-1);
        return;
      }
      const predictedValue = (outputTensor.data as Float32Array)[0];
      console.log(
        "✓ Inference ok:",
        new Float32Array(outputTensor.data).toString(),
        "sizes:",
        outputTensor.dims,
      );
      const batteryLevel = Math.round(
        predictedValue > 0 ? Math.min(100, predictedValue * 100) : 0,
      );

      setRemainingPower(batteryLevel);
      setLastSyncTime(
        new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
      );

      await saveBatteryData({
        deviceSN: selectedDevice?.deviceSN || "",
        batteryLevel,
      });
    } catch (error) {
      console.error("Model inference failed:", (error as Error).message);
      setRemainingPower(-1);
    }
  };

  useEffect(() => {
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

    if (!selectedDevice && prevTopicRef.current) {
      unsubscribeFromTopic([prevTopicRef.current]);
      setRemainingPower(-1);
    }

    if (mqttStatus !== "Connected") {
      setRemainingPower(-1);
      setLastSyncTime("");
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
