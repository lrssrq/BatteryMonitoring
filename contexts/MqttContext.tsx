import type {
  MqttClient,
  MqttData,
  MqttError,
  MqttStatus,
} from "@/hooks/useMqttConnection";
import useMqttConnection from "@/hooks/useMqttConnection";
import type { ReactNode } from "react";
import React, { createContext, useCallback, useContext, useState } from "react";

type SubscribeToTopic = (
  topics: string[],
  options?: { qos: 0 | 1 | 2; nl?: boolean },
) => void;

type MqttContextValue = {
  mqttClient: MqttClient | null;
  mqttData: MqttData | null;
  mqttStatus: MqttStatus;
  mqttError: MqttError | null;
  subscribeToTopic: SubscribeToTopic;
  unsubscribeFromTopic: (topics: string[]) => void;
  setDoMqttConnection: React.Dispatch<React.SetStateAction<boolean>>;
};

const MqttContext = createContext<MqttContextValue | undefined>(undefined);

export const MqttProvider = ({ children }: { children: ReactNode }) => {
  const [doMqttConnection, setDoMqttConnection] = useState(true);
  const {
    mqttClient,
    mqttData,
    mqttStatus,
    mqttError,
    setMqttError,
    setMqttStatus,
  } = useMqttConnection(doMqttConnection);

  /**
   * @type {SubscribeToTopic}
   */
  const subscribeToTopic: SubscribeToTopic = useCallback(
    (topics, options) => {
      const qos = options?.qos ?? 1;
      const nl = options?.nl ?? false;
      if (!mqttClient) return;

      for (const topic of topics) {
        mqttClient.subscribe(topic, { qos, nl }, (error) => {
          if (error) {
            setMqttStatus("Error");
            console.error("MqttTopic", error);
          }
        });
        console.log("Subscribed to topic:", topic, "with options:", {
          qos,
          nl,
        });
      }
    },
    [mqttClient, setMqttStatus],
  );

  const unsubscribeFromTopic = useCallback(
    (topics: string[]) => {
      if (!mqttClient) return;

      for (const topic of topics) {
        mqttClient.unsubscribe(topic, (error) => {
          if (error) {
            setMqttStatus("Error");
            console.error("MqttTopic", error);
          }
        });
        console.log("Unsubscribed from topic:", topic);
      }
    },
    [mqttClient, setMqttStatus],
  );

  return (
    <MqttContext.Provider
      value={{
        mqttClient,
        mqttData,
        mqttStatus,
        mqttError,
        subscribeToTopic,
        unsubscribeFromTopic,
        setDoMqttConnection,
      }}
    >
      {children}
    </MqttContext.Provider>
  );
};

export const useMqtt = (): MqttContextValue => {
  const context = useContext(MqttContext);

  if (!context) {
    throw new Error("useMqtt must be used within MqttProvider");
  }

  return context;
};
