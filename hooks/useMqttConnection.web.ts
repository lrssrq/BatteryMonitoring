import envConfig from "@/config/env";
import { createMqttClient } from "@/services/mqttService";
import type { MqttClient } from "mqtt";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";

export type MqttStatus =
  | "Connected"
  | "Disconnected"
  | "Offline"
  | "Reconnecting"
  | "Error";
export type MqttError = { type: string; msg: string };
export type MqttData = { message: Buffer<ArrayBufferLike>; topic: string };
export type { MqttClient };

type UseMqttConnectionResult = {
  mqttClient: MqttClient | null;
  mqttData: MqttData | null;
  mqttStatus: MqttStatus;
  mqttError: MqttError | null;
  setMqttStatus: Dispatch<SetStateAction<MqttStatus>>;
  setMqttError: Dispatch<SetStateAction<MqttError | null>>;
};

const MQTT_CLIENT_STORAGE_KEY = "mqtt_client_id";

function getPersistentClientId(): string {
  try {
    let id = localStorage.getItem(MQTT_CLIENT_STORAGE_KEY);
    if (!id) {
      id = "web-" + crypto.randomUUID();
      localStorage.setItem(MQTT_CLIENT_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return "web-" + crypto.randomUUID();
  }
}

// Resolved once per page load; survives re-renders and StrictMode double-invocations.
const MQTT_CLIENT_ID = getPersistentClientId();

function useMqttConnection(doMqttConnection: boolean): UseMqttConnectionResult {
  const [mqttStatus, setMqttStatus] = useState<MqttStatus>("Disconnected");
  const [mqttError, setMqttError] = useState<MqttError | null>(null);
  const [mqttData, setMqttData] = useState<MqttData | null>(null);
  const [mqttClient, setMqttClient] = useState<MqttClient | null>(null);

  useEffect(() => {
    if (!doMqttConnection) return;

    let isComponentMounted = true;
    let client: MqttClient | null = null;

    connectMqtt();
    return cleanup;

    function connectMqtt() {
      if (!isComponentMounted) return;

      if (
        envConfig.MQTT_HOST.length === 0 ||
        envConfig.MQTT_PORT <= 0 ||
        envConfig.MQTT_PORT > 65535
      ) {
        if (isComponentMounted) {
          setMqttStatus("Error");
          setMqttError({
            type: "mqtt_config_error",
            msg: "Invalid MQTT_HOST or MQTT_PORT configuration",
          });
        }
        return;
      }

      try {
        client = createMqttClient({
          host: envConfig.MQTT_HOST,
          port: envConfig.MQTT_PORT,
          ssl: envConfig.MQTT_SSL,
          username: envConfig.MQTT_USERNAME,
          password: envConfig.MQTT_PASSWORD,
          setMqttStatus: (status: MqttStatus) => {
            if (isComponentMounted) setMqttStatus(status);
          },
          setMqttError: (error: MqttError | null) => {
            if (isComponentMounted) setMqttError(error);
          },
          uniqueId: MQTT_CLIENT_ID,
          onMessage: (topic: string, message: Buffer<ArrayBufferLike>) => {
            if (isComponentMounted) setMqttData({ message, topic });
          },
        });
        if (isComponentMounted) setMqttClient(client);
      } catch (error) {
        if (isComponentMounted) {
          setMqttStatus("Error");
          setMqttError({
            type: "mqtt_init_error",
            msg: error instanceof Error ? error.message : String(error),
          });
        }
        console.error("MQTT init failed", error);
      }
    }

    function cleanup() {
      isComponentMounted = false;
      if (client) {
        client.end(true, () => {
          setMqttStatus("Disconnected");
          setMqttClient(null);
        });
      }
    }
  }, [doMqttConnection]);

  return {
    mqttClient,
    mqttData,
    mqttStatus,
    mqttError,
    setMqttStatus,
    setMqttError,
  };
}

export default useMqttConnection;